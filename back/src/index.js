"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
var child_process_1 = require("child_process");
var cors_1 = require("cors");
dotenv_1.default.config(); // Charge les variables d'environnement à partir de .env
var app = (0, express_1.default)();
var port = 3000;
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
}));
var pool = new pg_1.Pool({
    // modifier plus tard pour mettre les credentials dans un fichier .env
    user: "yanis52",
    password: "J@B$qwvH37zrWbY",
    host: 'postgresql-yanis52.alwaysdata.net',
    database: 'yanis52_db',
    port: 5432,
});
app.get('/test', function (req, res) {
    res.send('Hello World!');
});
//Afficher les noms des tables de la base de données
app.get('/tables', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT table_name \n            FROM information_schema.tables \n            WHERE table_schema = 'public';\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.send(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_1 = _a.sent();
                res.status(500).send('Error retrieving table names');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//Nom des colonnes d'une table
app.get('/table_columns/:tableName', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, tableName, query, result, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                tableName = req.params.tableName;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT column_name, data_type\n            FROM information_schema.columns\n            WHERE table_name = $1 AND table_schema = 'public';\n        ";
                return [4 /*yield*/, client.query(query, [tableName])];
            case 3:
                result = _a.sent();
                res.send(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_2 = _a.sent();
                res.status(500).send('Erreur lors de la récupération des colonnes de la table');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/olympic_athletes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, athletes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT * FROM olympic_athletes')];
            case 2:
                athletes = _a.sent();
                res.send(athletes.rows);
                return [2 /*return*/];
        }
    });
}); });
// get from olympic_hosts.csv , olympic_medals , olympic_results
app.get('/olympic_hosts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, hosts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT * FROM olympic_hosts')];
            case 2:
                hosts = _a.sent();
                res.send(hosts.rows);
                return [2 /*return*/];
        }
    });
}); });
app.get('/olympic_medals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, medals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT * FROM olympic_medals')];
            case 2:
                medals = _a.sent();
                res.send(medals.rows);
                return [2 /*return*/];
        }
    });
}); });
// get athletes  from olympic_medals by country and type of medal
app.get('/olympic_medals/:country/:medal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, _a, country, medal, medals;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _b.sent();
                _a = req.params, country = _a.country, medal = _a.medal;
                return [4 /*yield*/, client.query('SELECT athlete_full_name FROM olympic_medals WHERE country_name = $1 AND medal_type = $2', [country, medal])];
            case 2:
                medals = _b.sent();
                res.send(medals.rows);
                return [2 /*return*/];
        }
    });
}); });
// pays ayants le plus organisé les jeux olympiques
app.get('/countryWithMore', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, hosts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT game_location FROM olympic_hosts GROUP BY game_location ORDER BY COUNT(*) DESC LIMIT 1')];
            case 2:
                hosts = _a.sent();
                res.send(hosts.rows);
                return [2 /*return*/];
        }
    });
}); });
// relation entre olympic_medals and olympic_hosts pour s avoir les pays ayant le plus de médailles en affichant le nombre de médailles
app.get('/olympic_medals_hosts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, medals_hosts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT country_name, COUNT(*) as medal_count FROM olympic_medals INNER JOIN olympic_hosts ON olympic_medals.slug_game = olympic_hosts.game_slug GROUP BY country_name ORDER BY medal_count DESC LIMIT 1')];
            case 2:
                medals_hosts = _a.sent();
                res.send(medals_hosts.rows);
                return [2 /*return*/];
        }
    });
}); });
// Lors de quelle JO la France a eu le plus (le moins) de succès ?
app.get('/france_medals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, medals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT game_year, COUNT(*) as medal_count FROM olympic_medals WHERE country_name = $1 GROUP BY game_year ORDER BY medal_count DESC LIMIT 1', ['France'])];
            case 2:
                medals = _a.sent();
                res.send(medals.rows);
                return [2 /*return*/];
        }
    });
}); });
app.get('/olympic_results', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                return [4 /*yield*/, client.query('SELECT * FROM olympic_results')];
            case 2:
                results = _a.sent();
                res.send(results.rows);
                return [2 /*return*/];
        }
    });
}); });
//test sur event
app.get('/eventtest', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, events, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                return [4 /*yield*/, client.query('SELECT * FROM "Event"')];
            case 3:
                events = _a.sent();
                res.send(events.rows);
                return [3 /*break*/, 6];
            case 4:
                err_3 = _a.sent();
                console.error('Error executing query', err_3);
                res.status(500).send('Erreur lors de la récupération des événements');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/checkMedalColumns', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT column_name, data_type\n            FROM information_schema.columns\n            WHERE table_name = 'Medal';\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_4 = _a.sent();
                console.error('Error executing query', err_4);
                res.status(500).send('Erreur lors de la récupération des colonnes de la table Medal');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//test sur tous
app.get('/donner/:table', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, table, queryText, events, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                table = req.params.table;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                queryText = "SELECT * FROM \"".concat(table, "\"");
                return [4 /*yield*/, client.query(queryText)];
            case 3:
                events = _a.sent();
                res.send(events.rows);
                return [3 /*break*/, 6];
            case 4:
                err_5 = _a.sent();
                console.error('Error executing query', err_5);
                res.status(500).send('Erreur lors de la récupération des données');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//Combien de médailles la France a remporté : en tout, en Or, en argent et en Bronze (depuis le début des JO) ?
app.get('/nbListFrance_medal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                m.type AS medal_type,\n                COUNT(*) AS medal_count\n            FROM\n                \"Medal\" m\n            JOIN\n                \"CompetitorEvent\" ce ON m.id = ce.medal_id\n            JOIN\n                \"GameCompetitor\" gc ON ce.competitor_id = gc.id\n            JOIN\n                \"Athlete\" a ON gc.athlete_id = a.id\n            JOIN\n                \"AthleteCountry\" ac ON a.id = ac.athlete_id\n            JOIN\n                \"Country\" c ON ac.country_id = c.id\n            WHERE\n                c.country_name = 'France'\n            GROUP BY\n                m.type;\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.send(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_6 = _a.sent();
                console.error('Error executing query', err_6);
                res.status(500).send('Erreur lors de la récupération des médailles françaises');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//Mieux et moins bien réussi des JO pour la France
app.get('/franceOlympicPerformance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, most_successful, least_successful, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                g.game_name,\n                g.games_years,\n                COUNT(m.id) AS total_medals\n            FROM\n                \"Game\" g\n            JOIN\n                \"GameCompetitor\" gc ON g.id = gc.game_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            JOIN\n                \"Athlete\" a ON gc.athlete_id = a.id\n            JOIN\n                \"AthleteCountry\" ac ON a.id = ac.athlete_id\n            JOIN\n                \"Country\" c ON ac.country_id = c.id\n            WHERE\n                c.country_name = 'France'\n            GROUP BY\n                g.game_name, g.games_years\n            ORDER BY\n                total_medals DESC;\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                if (result.rows.length > 0) {
                    most_successful = result.rows[0];
                    least_successful = result.rows[result.rows.length - 1];
                    res.json({ most_successful: most_successful, least_successful: least_successful });
                }
                else {
                    res.json({ message: "No medal data found for France." });
                }
                return [3 /*break*/, 6];
            case 4:
                err_7 = _a.sent();
                console.error('Error executing query', err_7);
                res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//meilleurs et pire du pays
app.get('/best_worst_olympics/:country', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, country, query, result, most_successful, least_successful, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                country = req.params.country;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                g.game_name,\n                g.games_years,\n                COUNT(m.id) AS total_medals\n            FROM\n                \"Game\" g\n            JOIN\n                \"GameCompetitor\" gc ON g.id = gc.game_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            JOIN\n                \"Athlete\" a ON gc.athlete_id = a.id\n            JOIN\n                \"AthleteCountry\" ac ON a.id = ac.athlete_id\n            JOIN\n                \"Country\" c ON ac.country_id = c.id\n            WHERE\n                c.country_name = $1\n            GROUP BY\n                g.game_name, g.games_years\n            ORDER BY\n                total_medals DESC;\n        ";
                return [4 /*yield*/, client.query(query, [country])];
            case 3:
                result = _a.sent();
                if (result.rows.length > 0) {
                    most_successful = result.rows[0];
                    least_successful = result.rows[result.rows.length - 1];
                    res.json({ most_successful: most_successful, least_successful: least_successful });
                }
                else {
                    res.json({ message: "No data found for specified country." });
                }
                return [3 /*break*/, 6];
            case 4:
                err_8 = _a.sent();
                console.error('Error executing query', err_8);
                res.status(500).send('Erreur lors de la récupération des performances olympiques pour ' + country);
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//discipline dominante pour un pays
app.get('/dominant_disciplines/:country', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, country, query, result, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                country = req.params.country;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                d.name AS discipline_name,\n                COUNT(m.id) AS total_medals\n            FROM\n                \"Event\" e\n            JOIN\n                \"Discipline\" d ON e.discipline_id = d.id\n            JOIN\n                \"CompetitorEvent\" ce ON e.id = ce.event_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            JOIN\n                \"GameCompetitor\" gc ON ce.competitor_id = gc.id\n            JOIN\n                \"Athlete\" a ON gc.athlete_id = a.id\n            JOIN\n                \"AthleteCountry\" ac ON a.id = ac.athlete_id\n            JOIN\n                \"Country\" c ON ac.country_id = c.id\n            WHERE\n                c.country_name = $1\n            GROUP BY\n                d.name\n            ORDER BY\n                total_medals DESC\n            LIMIT 1;\n        ";
                return [4 /*yield*/, client.query(query, [country])];
            case 3:
                result = _a.sent();
                if (result.rows.length > 0) {
                    res.json(result.rows[0]);
                }
                else {
                    res.json({ message: "No dominant discipline found for " + country });
                }
                return [3 /*break*/, 6];
            case 4:
                err_9 = _a.sent();
                console.error('Error executing query', err_9);
                res.status(500).send('Erreur lors de la récupération de la discipline dominante pour ' + country);
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//Sport dominant chaque année
app.get('/dominant_sports_over_years', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                g.games_years,\n                g.season,\n                d.name AS discipline_name,\n                COUNT(m.id) AS total_medals\n            FROM\n                \"Game\" g\n            JOIN\n                \"GameCompetitor\" gc ON g.id = gc.game_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Event\" e ON ce.event_id = e.id\n            JOIN\n                \"Discipline\" d ON e.discipline_id = d.id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            GROUP BY\n                g.games_years, g.season, d.name\n            ORDER BY\n                g.games_years, g.season, total_medals DESC;\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_10 = _a.sent();
                console.error('Error executing query', err_10);
                res.status(500).send('Erreur lors de la récupération des sports dominants au fil des ans');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//les 10 pays les plus médaillés en retirant les non medailles
app.get('/top_10_countries_medals', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                c.country_name,\n                COUNT(m.id) AS total_medals\n            FROM\n                \"Country\" c\n            JOIN\n                \"AthleteCountry\" ac ON c.id = ac.country_id\n            JOIN\n                \"GameCompetitor\" gc ON ac.athlete_id = gc.athlete_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            WHERE\n                m.type <> 'No medal'\n            GROUP BY\n                c.country_name\n            ORDER BY\n                total_medals DESC\n            LIMIT 10;\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_11 = _a.sent();
                console.error('Error executing query', err_11);
                res.status(500).send('Erreur lors de la récupération des pays les plus médaillés');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//les pays les plus médaillés par type de médaille
app.get('/top_countries_by_medal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                c.country_name,\n                COUNT(*) AS total_medals,\n                COUNT(CASE WHEN m.type = 'GOLD' THEN 1 END) AS gold_medals,\n                COUNT(CASE WHEN m.type = 'SILVER' THEN 1 END) AS silver_medals,\n                COUNT(CASE WHEN m.type = 'BRONZE' THEN 1 END) AS bronze_medals\n            FROM\n                \"Country\" c\n            JOIN\n                \"AthleteCountry\" ac ON c.id = ac.country_id\n            JOIN\n                \"GameCompetitor\" gc ON ac.athlete_id = gc.athlete_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            WHERE\n                m.type <> 'No medal'\n            GROUP BY\n                c.country_name\n            ORDER BY\n                total_medals DESC;\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_12 = _a.sent();
                console.error('Error executing query', err_12);
                res.status(500).send('Erreur lors de la récupération du classement des pays par médaille');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//meilleurs pays par sport donné
app.get('/top_countries_by_sport/:sport', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, sport, query, result, err_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                sport = req.params.sport;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n            SELECT\n                c.country_name,\n                COUNT(*) AS total_medals,\n                COUNT(CASE WHEN m.type = 'GOLD' THEN 1 END) AS gold_medals,\n                COUNT(CASE WHEN m.type = 'SILVER' THEN 1 END) AS silver_medals,\n                COUNT(CASE WHEN m.type = 'BRONZE' THEN 1 END) AS bronze_medals\n            FROM\n                \"Country\" c\n            JOIN\n                \"AthleteCountry\" ac ON c.id = ac.country_id\n            JOIN\n                \"GameCompetitor\" gc ON ac.athlete_id = gc.athlete_id\n            JOIN\n                \"CompetitorEvent\" ce ON gc.id = ce.competitor_id\n            JOIN\n                \"Medal\" m ON ce.medal_id = m.id\n            JOIN\n                \"Event\" e ON ce.event_id = e.id\n            JOIN\n                \"Discipline\" d ON e.discipline_id = d.id\n            WHERE\n                d.name = $1 AND\n                m.type <> 'No medal'\n            GROUP BY\n                c.country_name\n            ORDER BY\n                total_medals DESC;\n        ";
                return [4 /*yield*/, client.query(query, [sport])];
            case 3:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 4:
                err_13 = _a.sent();
                console.error('Error executing query', err_13);
                res.status(500).send('Erreur lors de la récupération du classement des pays par sport');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/predictions', function (req, res) {
    var filePath = 'path/to/your/predictions.h5';
    var pythonProcess = (0, child_process_1.spawn)('python', ['read_predictions.py', filePath]);
    pythonProcess.stdout.on('data', function (data) {
        var result = JSON.parse(data.toString());
        res.json(result);
    });
    pythonProcess.stderr.on('data', function (data) {
        console.error("stderr: ".concat(data));
        res.status(500).send('Erreur lors de la lecture du fichier H5');
    });
    pythonProcess.on('close', function (code) {
        if (code !== 0) {
            console.log("Process exited with code ".concat(code));
        }
    });
});
var routes = [];
app.use(function (req, res, next) {
    routes.push({
        method: req.method,
        path: req.originalUrl,
    });
    next();
});
function listRoutes(app) {
    var routeStack = app._router.stack;
    var routes = [];
    routeStack.forEach(function (middleware) {
        if (middleware.route) {
            var methods = Object.keys(middleware.route.methods).map(function (method) { return method.toUpperCase(); });
            methods.forEach(function (method) {
                routes.push({
                    method: method,
                    path: middleware.route.path,
                });
            });
        }
        else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(function (handler) {
                if (handler.route) {
                    var methods = Object.keys(handler.route.methods).map(function (method) { return method.toUpperCase(); });
                    methods.forEach(function (method) {
                        routes.push({
                            method: method,
                            path: handler.route.path,
                        });
                    });
                }
            });
        }
    });
    return routes;
}
;
app.get('/franceMedalByYears', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n        SELECT \n    \"G\".\"games_years\" AS Year,\n    COUNT(\"M\".\"id\") AS Medal_Count\nFROM \n    \"Game\" \"G\"\nJOIN \n    \"GameCompetitor\" \"GC\" ON \"G\".\"id\" = \"GC\".\"game_id\"\nJOIN \n    \"CompetitorEvent\" \"CE\" ON \"GC\".\"id\" = \"CE\".\"competitor_id\"\nJOIN \n    \"Medal\" \"M\" ON \"CE\".\"medal_id\" = \"M\".\"id\"\nJOIN \n    \"Athlete\" \"A\" ON \"GC\".\"athlete_id\" = \"A\".\"id\"\nJOIN \n    \"AthleteCountry\" \"AC\" ON \"A\".\"id\" = \"AC\".\"athlete_id\"\nJOIN \n    \"Country\" \"C\" ON \"AC\".\"country_id\" = \"C\".\"id\"\nWHERE \n    \"C\".\"country_name\" = 'France'\nGROUP BY \n    \"G\".\"games_years\"\nORDER BY \n    \"G\".\"games_years\";\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                console.log(result.rows);
                if (result.rows.length > 0) {
                    res.json(result.rows);
                }
                else {
                    res.json({ message: "No medal data found for France." });
                }
                return [3 /*break*/, 6];
            case 4:
                err_14 = _a.sent();
                console.error('Error executing query', err_14);
                res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/franceMedal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, query, result, err_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                query = "\n        SELECT \"Medal\".\"type\", COUNT(*) as total\n        FROM \"Medal\"\n        JOIN \"CompetitorEvent\" ON \"Medal\".\"id\" = \"CompetitorEvent\".\"medal_id\"\n        JOIN \"GameCompetitor\" ON \"CompetitorEvent\".\"competitor_id\" = \"GameCompetitor\".\"id\"\n        JOIN \"AthleteCountry\" ON \"GameCompetitor\".\"athlete_id\" = \"AthleteCountry\".\"athlete_id\"\n        JOIN \"Country\" ON \"AthleteCountry\".\"country_id\" = \"Country\".\"id\"\n        WHERE \"Country\".\"country_name\" = 'France'\n        GROUP BY \"Medal\".\"type\";\n        ";
                return [4 /*yield*/, client.query(query)];
            case 3:
                result = _a.sent();
                console.log(result.rows);
                if (result.rows.length > 0) {
                    res.json(result.rows);
                }
                else {
                    res.json({ message: "No medal data found for France." });
                }
                return [3 /*break*/, 6];
            case 4:
                err_15 = _a.sent();
                console.error('Error executing query', err_15);
                res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
                return [3 /*break*/, 6];
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/routes', function (req, res) {
    var allRoutes = listRoutes(app);
    res.json(allRoutes);
});
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port));
});
// host -> disciples ->athletes -> resulats
// table discirples a partir de olympics reulsats.
//  trai = une   >plusieurs
