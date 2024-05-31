import sys
import joblib
import pandas as pd
import json
import os

try:
    # Chemin vers le dossier des modèles
    script_dir = os.path.dirname(__file__)
    model_dir = os.path.join(script_dir, '..', 'models')

    # Charger les modèles 
    rf_gold = joblib.load(os.path.join(model_dir, 'rf_gold_model.pkl'))
    rf_silver = joblib.load(os.path.join(model_dir, 'rf_silver_model.pkl'))
    rf_bronze = joblib.load(os.path.join(model_dir, 'rf_bronze_model.pkl'))
    scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
    le = joblib.load(os.path.join(model_dir, 'label_encoder.pkl'))

    # Récupérer les arguments passés par le script Node.js
    args = sys.argv[1:]
    Country = args[0]
    sports = int(args[1])
    events = int(args[2])
    game_part = int(args[3])
    prec_game_medal = int(args[4])
    prec_game_gold = int(args[5])
    prec_game_silver = int(args[6])
    prec_game_bronze = int(args[7])

    # Préparer les données pour la prédiction
    data = pd.DataFrame({
        'Country': [Country],
        'sports': [sports],
        'events': [events],
        'game_part': [game_part],
        'prec_game_medal': [prec_game_medal],
        'prec_game_gold': [prec_game_gold],
        'prec_game_silver': [prec_game_silver],
        'prec_game_bronze': [prec_game_bronze]
    })

    # Encoder les données de pays
    data['Country'] = le.transform(data['Country'])

    # Standardiser les données
    scaled_data = scaler.transform(data)

    # Effectuer les prédictions
    gold_pred = rf_gold.predict(scaled_data)[0]
    silver_pred = rf_silver.predict(scaled_data)[0]
    bronze_pred = rf_bronze.predict(scaled_data)[0]

    # Préparer les résultats
    result = {
        'gold': gold_pred,
        'silver': silver_pred,
        'bronze': bronze_pred
    }

    print(json.dumps(result))

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
