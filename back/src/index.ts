import express, { NextFunction, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import cors from "cors";
import { registerEndpoints } from './router';
import { athleteRouter } from './router/athlete-router';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export interface AthleteSimple {
    athlete_full_name: string;
    games_participations: number;
    first_game: string;
    id: string
}
export interface Host {
    index: number;
    game_slug: string;
    game_end_date: string;
    game_start_date: string;
    game_location: string;
    game_name: string;
    game_season: "Summer" | "Winter";
    game_year: string;
}


const app = express();
const port = 3000;
app.use(
    cors({
        origin: ["https://backend-hackathon-test2.vercel.app", "http://localhost:5173", "localhost:3000","https://frontend-hackathon-ashy.vercel.app"],
        allowedHeaders: ["Content-Type"],
    }),
);

// Middleware pour parser le JSON
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT ?? "3000", 10),
});

registerEndpoints(app);

app.get('/test', (req: Request, res: Response) => {
    res.send('Hello World!');
});


//Afficher les noms des tables de la base de données
app.get('/tables', async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        const result = await client.query(query);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send('Error retrieving table names');
    } finally {
        client.release();
    }
});

//Nom des colonnes d'une table
app.get('/table_columns/:tableName', async (req, res) => {
    const client = await pool.connect();
    const { tableName } = req.params;
    try {
        const query = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = 'public';
        `;
        const result = await client.query(query, [tableName]);
        res.send(result.rows);
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération des colonnes de la table');
    } finally {
        client.release();
    }
});


app.get('/olympic_athletes', async (req: Request, res: Response) => {
    // add crud on table olympic_athletes
    const client = await pool.connect();
    const athletes = await client.query('SELECT * FROM olympic_athletes');
    res.send(athletes.rows);


});
// get from olympic_hosts.csv , olympic_medals , olympic_results
app.get('/olympic_hosts', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const hosts = await client.query('SELECT * FROM olympic_hosts');
    res.send(hosts.rows);
});

app.get('/olympic_medals', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const medals = await client.query('SELECT * FROM olympic_medals');
    res.send(medals.rows);
});

// get athletes  from olympic_medals by country and type of medal
app.get('/olympic_medals/:country/:medal', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const { country, medal } = req.params;
    const medals = await client.query('SELECT athlete_full_name FROM olympic_medals WHERE country_name = $1 AND medal_type = $2', [country, medal]);
    res.send(medals.rows);
});

// pays ayants le plus organisé les jeux olympiques
app.get('/countryWithMore', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const hosts = await client.query('SELECT game_location FROM olympic_hosts GROUP BY game_location ORDER BY COUNT(*) DESC LIMIT 1');
    res.send(hosts.rows);
});

// relation entre olympic_medals and olympic_hosts pour s avoir les pays ayant le plus de médailles en affichant le nombre de médailles
app.get('/olympic_medals_hosts', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const medals_hosts = await client.query('SELECT country_name, COUNT(*) as medal_count FROM olympic_medals INNER JOIN olympic_hosts ON olympic_medals.slug_game = olympic_hosts.game_slug GROUP BY country_name ORDER BY medal_count DESC LIMIT 1');
    res.send(medals_hosts.rows);
});

// Lors de quelle JO la France a eu le plus (le moins) de succès ?
app.get('/france_medals', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const medals = await client.query('SELECT game_year, COUNT(*) as medal_count FROM olympic_medals WHERE country_name = $1 GROUP BY game_year ORDER BY medal_count DESC LIMIT 1', ['France']);
    res.send(medals.rows);
});

app.get('/olympic_results', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const results = await client.query('SELECT * FROM olympic_results');
    res.send(results.rows);
});


//test sur event
app.get('/eventtest', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const events = await client.query('SELECT * FROM "Event"');
        res.send(events.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des événements');
    } finally {
        client.release();
    }
});

app.get('/checkMedalColumns', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'Medal';
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des colonnes de la table Medal');
    } finally {
        client.release();
    }
});


//test sur tous
app.get('/donner/:table', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const table = req.params.table;

    try {
        const queryText = `SELECT * FROM "${table}"`;
        const events = await client.query(queryText);
        res.send(events.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des données');
    } finally {
        client.release();
    }
});

//Combien de médailles la France a remporté : en tout, en Or, en argent et en Bronze (depuis le début des JO) ?
app.get('/nbListFrance_medal', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                m.type AS medal_type,
                COUNT(*) AS medal_count
            FROM
                "Medal" m
            JOIN
                "CompetitorEvent" ce ON m.id = ce.medal_id
            JOIN
                "GameCompetitor" gc ON ce.competitor_id = gc.id
            JOIN
                "Athlete" a ON gc.athlete_id = a.id
            JOIN
                "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN
                "Country" c ON ac.country_id = c.id
            WHERE
                c.country_name = 'France'
            GROUP BY
                m.type;
        `;
        const result = await client.query(query);
        res.send(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des médailles françaises');
    } finally {
        client.release();
    }
});


//Mieux et moins bien réussi des JO pour la France
app.get('/franceOlympicPerformance', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                g.game_name,
                g.games_years,
                COUNT(m.id) AS total_medals
            FROM
                "Game" g
            JOIN
                "GameCompetitor" gc ON g.id = gc.game_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            JOIN
                "Athlete" a ON gc.athlete_id = a.id
            JOIN
                "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN
                "Country" c ON ac.country_id = c.id
            WHERE
                c.country_name = 'France'
            GROUP BY
                g.game_name, g.games_years
            ORDER BY
                total_medals DESC;
        `;
        const result = await client.query(query);
        if (result.rows.length > 0) {
            const most_successful = result.rows[0];
            const least_successful = result.rows[result.rows.length - 1];
            res.json({ most_successful, least_successful });
        } else {
            res.json({ message: "No medal data found for France." });
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
    } finally {
        client.release();
    }
});


//meilleurs et pire du pays
app.get('/best_worst_olympics/:country', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const country = req.params.country;
    try {
        const query = `
            SELECT
                g.game_name,
                g.games_years,
                COUNT(m.id) AS total_medals
            FROM
                "Game" g
            JOIN
                "GameCompetitor" gc ON g.id = gc.game_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            JOIN
                "Athlete" a ON gc.athlete_id = a.id
            JOIN
                "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN
                "Country" c ON ac.country_id = c.id
            WHERE
                c.country_name = $1
            GROUP BY
                g.game_name, g.games_years
            ORDER BY
                total_medals DESC;
        `;
        const result = await client.query(query, [country]);
        if (result.rows.length > 0) {
            const most_successful = result.rows[0];
            const least_successful = result.rows[result.rows.length - 1];
            res.json({ most_successful, least_successful });
        } else {
            res.json({ message: "No data found for specified country." });
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des performances olympiques pour ' + country);
    } finally {
        client.release();
    }
});


//discipline dominante pour un pays
app.get('/dominant_disciplines/:country', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const country = req.params.country;
    try {
        const query = `
            SELECT
                d.name AS discipline_name,
                COUNT(m.id) AS total_medals
            FROM
                "Event" e
            JOIN
                "Discipline" d ON e.discipline_id = d.id
            JOIN
                "CompetitorEvent" ce ON e.id = ce.event_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            JOIN
                "GameCompetitor" gc ON ce.competitor_id = gc.id
            JOIN
                "Athlete" a ON gc.athlete_id = a.id
            JOIN
                "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN
                "Country" c ON ac.country_id = c.id
            WHERE
                c.country_name = $1
            GROUP BY
                d.name
            ORDER BY
                total_medals DESC
            LIMIT 1;
        `;
        const result = await client.query(query, [country]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ message: "No dominant discipline found for " + country });
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération de la discipline dominante pour ' + country);
    } finally {
        client.release();
    }
});


//Sport dominant chaque année
app.get('/dominant_sports_over_years', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                g.games_years,
                g.season,
                d.name AS discipline_name,
                COUNT(m.id) AS total_medals
            FROM
                "Game" g
            JOIN
                "GameCompetitor" gc ON g.id = gc.game_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Event" e ON ce.event_id = e.id
            JOIN
                "Discipline" d ON e.discipline_id = d.id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            GROUP BY
                g.games_years, g.season, d.name
            ORDER BY
                g.games_years, g.season, total_medals DESC;
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des sports dominants au fil des ans');
    } finally {
        client.release();
    }
});


//les 10 pays les plus médaillés en retirant les non medailles
app.get('/top_10_countries_medals', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                c.country_name,
                COUNT(m.id) AS total_medals
            FROM
                "Country" c
            JOIN
                "AthleteCountry" ac ON c.id = ac.country_id
            JOIN
                "GameCompetitor" gc ON ac.athlete_id = gc.athlete_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            WHERE
                m.type <> 'No medal'
            GROUP BY
                c.country_name
            ORDER BY
                total_medals DESC
            LIMIT 10;
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des pays les plus médaillés');
    } finally {
        client.release();
    }
});

//les pays les plus médaillés par type de médaille
app.get('/top_countries_by_medal', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                c.country_name,
                COUNT(*) AS total_medals,
                COUNT(CASE WHEN m.type = 'GOLD' THEN 1 END) AS gold_medals,
                COUNT(CASE WHEN m.type = 'SILVER' THEN 1 END) AS silver_medals,
                COUNT(CASE WHEN m.type = 'BRONZE' THEN 1 END) AS bronze_medals
            FROM
                "Country" c
            JOIN
                "AthleteCountry" ac ON c.id = ac.country_id
            JOIN
                "GameCompetitor" gc ON ac.athlete_id = gc.athlete_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            WHERE
                m.type <> 'No medal'
            GROUP BY
                c.country_name
            ORDER BY
                total_medals DESC;
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération du classement des pays par médaille');
    } finally {
        client.release();
    }
});

//meilleurs pays par sport donné
app.get('/top_countries_by_sport/:sport', async (req: Request, res: Response) => {
    const client = await pool.connect();
    const sport = req.params.sport;
    try {
        const query = `
            SELECT
                c.country_name,
                COUNT(*) AS total_medals,
                COUNT(CASE WHEN m.type = 'GOLD' THEN 1 END) AS gold_medals,
                COUNT(CASE WHEN m.type = 'SILVER' THEN 1 END) AS silver_medals,
                COUNT(CASE WHEN m.type = 'BRONZE' THEN 1 END) AS bronze_medals
            FROM
                "Country" c
            JOIN
                "AthleteCountry" ac ON c.id = ac.country_id
            JOIN
                "GameCompetitor" gc ON ac.athlete_id = gc.athlete_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            JOIN
                "Event" e ON ce.event_id = e.id
            JOIN
                "Discipline" d ON e.discipline_id = d.id
            WHERE
                d.name = $1 AND
                m.type <> 'No medal'
            GROUP BY
                c.country_name
            ORDER BY
                total_medals DESC;
        `;
        const result = await client.query(query, [sport]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération du classement des pays par sport');
    } finally {
        client.release();
    }
});

//Medailles par pays sans no_medal
app.get('/medals_by_country', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                c.country_name,
                COUNT(m.id) AS total_medals
            FROM
                "Country" c
            JOIN
                "AthleteCountry" ac ON c.id = ac.country_id
            JOIN
                "GameCompetitor" gc ON ac.athlete_id = gc.athlete_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            WHERE
                m.type <> 'No medal'
            GROUP BY
                c.country_name
            ORDER BY
                total_medals DESC;
        `;
        const result = await client.query(query);
        const formattedResult = [["Country", "Medals"]];
        result.rows.forEach(row => {
            formattedResult.push([row.country_name, row.total_medals]);
        });
        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des médailles par pays');
    } finally {
        client.release();
    }
});

//liste des medailles par année de la france
app.get('/medals_by_year_france', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                g.games_years AS year,
                COUNT(CASE WHEN m.type = 'SILVER' THEN 1 END) AS silver_medals,
                COUNT(CASE WHEN m.type = 'GOLD' THEN 1 END) AS gold_medals,
                COUNT(CASE WHEN m.type = 'BRONZE' THEN 1 END) AS bronze_medals
            FROM
                "Game" g
            JOIN
                "GameCompetitor" gc ON g.id = gc.game_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            WHERE
                m.type <> 'No medal'
                c.country_name = 'France'
            GROUP BY
                g.games_years
            ORDER BY
                g.games_years;
        `;
        const result = await client.query(query);
        const formattedResult = [["Year", "Silver", "Gold", "Bronze"]];
        result.rows.forEach(row => {
            formattedResult.push([row.year.toString(), row.silver_medals, row.gold_medals, row.bronze_medals]);
        });
        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des médailles par année');
    } finally {
        client.release();
    }
});



app.get('/athlete', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const start = req.query._start ? parseInt(req.query._start as string, 10) : 0;
        const end = req.query._end ? parseInt(req.query._end as string, 10) : 10;
        const limit = end - start;

        if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
            res.status(400).send('Invalid _start or _end parameters');
            return;
        }

        const query = `
            SELECT DISTINCT ON (a.full_name)
                a.id,
                a.full_name AS athlete_full_name,
                (SELECT COUNT(DISTINCT gc.game_id)
                 FROM "GameCompetitor" gc
                 WHERE gc.athlete_id = a.id) AS games_participations,
                (SELECT MIN(g.games_years)
                 FROM "Game" g
                 JOIN "GameCompetitor" gc ON g.id = gc.game_id
                 WHERE gc.athlete_id = a.id) AS first_game
            FROM
                "Athlete" a
            ORDER BY
                a.full_name, a.id
            LIMIT $1 OFFSET $2;
        `;
        const result = await client.query(query, [limit, start]);

        const formattedResult: AthleteSimple[] = result.rows.map(row => ({
            athlete_full_name: row.athlete_full_name,
            games_participations: parseInt(row.games_participations, 10),
            first_game: row.first_game.toString(),
            id: row.id
        }));

        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des athlètes');
    } finally {
        client.release();
    }
});

app.get('/host', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const start = req.query._start ? parseInt(req.query._start as string, 10) : 0;
        const end = req.query._end ? parseInt(req.query._end as string, 10) : 10;
        const limit = end - start;

        if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
            res.status(400).send('Invalid _start or _end parameters');
            return;
        }

        const query = `
            SELECT DISTINCT ON (g.game_name, g.season, g.games_years, c.city_name)
                ROW_NUMBER() OVER(ORDER BY g.games_years) AS index,
                CONCAT(g.game_name, '-', g.season, '-', g.games_years) AS game_slug,
                NULL AS game_end_date,
                NULL AS game_start_date,
                c.city_name AS game_location,
                g.game_name,
                g.season AS game_season,
                g.games_years AS game_year
            FROM 
                "Game" g
            JOIN 
                "GameCity" gc ON g.id = gc.game_id
            JOIN 
                "City" c ON gc.city_id = c.id
            ORDER BY 
                g.game_name, g.season, g.games_years, c.city_name
            LIMIT $1 OFFSET $2;
        `;
        const result = await client.query(query, [limit, start]);

        const formattedResult: Host[] = result.rows.map(row => ({
            index: row.index,
            game_slug: row.game_slug,
            game_end_date: row.game_end_date, // Adjust if available in your schema
            game_start_date: row.game_start_date, // Adjust if available in your schema
            game_location: row.game_location,
            game_name: row.game_name,
            game_season: row.game_season,
            game_year: row.game_year.toString(),
        }));

        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des hôtes de jeux');
    } finally {
        client.release();
    }
});

app.get('/seasons', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT DISTINCT season
            FROM "Game"
            ORDER BY season;
        `;
        const result = await client.query(query);

        const seasons = result.rows.map(row => row.season);
        res.json(seasons);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des saisons');
    } finally {
        client.release();
    }
});


app.get('/medals_by_year_franceList', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                g.games_years AS year,
                COUNT(m.id) AS medal_count
            FROM
                "Game" g
            JOIN
                "GameCompetitor" gc ON g.id = gc.game_id
            JOIN
                "CompetitorEvent" ce ON gc.id = ce.competitor_id
            JOIN
                "Medal" m ON ce.medal_id = m.id
            JOIN
                "Athlete" a ON gc.athlete_id = a.id
            JOIN
                "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN
                "Country" c ON ac.country_id = c.id
            WHERE
                c.country_name = 'France'
            GROUP BY
                g.games_years
            ORDER BY
                g.games_years;
        `;
        const result = await client.query(query);
        const formattedResult = [["Year", "Medal count"]];
        result.rows.forEach(row => {
            formattedResult.push([row.year.toString(), row.medal_count]);
        });
        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des médailles par année');
    } finally {
        client.release();
    }
});


app.get('/predictions', (req, res) => {
    const filePath = 'path/to/your/predictions.h5';

    const pythonProcess = spawn('python', ['read_predictions.py', filePath]);

    pythonProcess.stdout.on('data', (data) => {
        const result = JSON.parse(data.toString());
        res.json(result);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).send('Erreur lors de la lecture du fichier H5');
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Process exited with code ${code}`);
        }
    });
});



interface Route {
    method: string;
    path: string;
}

const routes: Route[] = [];

app.use((req: Request, res: Response, next: NextFunction) => {
    routes.push({
        method: req.method,
        path: req.originalUrl,
    });
    next();
})

function listRoutes(app: express.Express): Route[] {
    const routeStack = app._router.stack;
    const routes: Route[] = [];

    routeStack.forEach((middleware: any) => {
        if (middleware.route) {
            const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase());
            methods.forEach((method: string) => {
                routes.push({
                    method,
                    path: middleware.route.path,
                });
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler: any) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).map(method => method.toUpperCase());
                    methods.forEach((method: string) => {
                        routes.push({
                            method,
                            path: handler.route.path,
                        });
                    });
                }
            });
        }
    });

    return routes;
};


app.get('/franceMedalByYears', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
        SELECT 
    "G"."games_years" AS Year,
    COUNT("M"."id") AS Medal_Count
FROM 
    "Game" "G"
JOIN 
    "GameCompetitor" "GC" ON "G"."id" = "GC"."game_id"
JOIN 
    "CompetitorEvent" "CE" ON "GC"."id" = "CE"."competitor_id"
JOIN 
    "Medal" "M" ON "CE"."medal_id" = "M"."id"
JOIN 
    "Athlete" "A" ON "GC"."athlete_id" = "A"."id"
JOIN 
    "AthleteCountry" "AC" ON "A"."id" = "AC"."athlete_id"
JOIN 
    "Country" "C" ON "AC"."country_id" = "C"."id"
WHERE 
    "C"."country_name" = 'France'
GROUP BY 
    "G"."games_years"
ORDER BY 
    "G"."games_years";
        `;
        const result = await client.query(query);
        console.log(result.rows)
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json({ message: "No medal data found for France." });
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
    } finally {
        client.release();
    }
});

app.get('/franceMedal', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
        SELECT "Medal"."type", COUNT(*) as total
        FROM "Medal"
        JOIN "CompetitorEvent" ON "Medal"."id" = "CompetitorEvent"."medal_id"
        JOIN "GameCompetitor" ON "CompetitorEvent"."competitor_id" = "GameCompetitor"."id"
        JOIN "AthleteCountry" ON "GameCompetitor"."athlete_id" = "AthleteCountry"."athlete_id"
        JOIN "Country" ON "AthleteCountry"."country_id" = "Country"."id"
        WHERE "Country"."country_name" = 'France'
        GROUP BY "Medal"."type";
        `;
        const result = await client.query(query);
        console.log(result.rows)
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json({ message: "No medal data found for France." });
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des performances olympiques françaises');
    } finally {
        client.release();
    }
});

app.post('/predict_medals', (req: Request, res: Response) => {
    const {
        Country,
        sports,
        events,
        game_part,
        prec_game_medal,
        prec_game_gold,
        prec_game_silver,
        prec_game_bronze
    } = req.body;

    console.log("Request body:", req.body);

    const scriptPath = path.join(__dirname, '..', 'scripts', 'predict_medals.py');
    const args = [
        scriptPath,
        Country.toString(),
        sports.toString(),
        events.toString(),
        game_part.toString(),
        prec_game_medal.toString(),
        prec_game_gold.toString(),
        prec_game_silver.toString(),
        prec_game_bronze.toString()
    ];

    const pythonProcess = spawn('python', args);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        scriptError += data.toString();
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Process exited with code ${code}`);
            res.status(500).send(`Process exited with code ${code}\nError: ${scriptError}`);
        } else {
            try {
                console.log("Script output (raw):", scriptOutput);
                const result = JSON.parse(scriptOutput);
                res.json(result);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).send('Erreur lors de l\'analyse des résultats');
            }
        }
    });
});


app.get('/routes', (req: Request, res: Response) => {
    const allRoutes = listRoutes(app);
    res.json(allRoutes);
});


app.get('/participating_countries', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT DISTINCT
                c.id,
                c.country_name,
                c.noc
            FROM
                "Country" c
            JOIN
                "AthleteCountry" ac ON c.id = ac.country_id
            JOIN
                "Athlete" a ON ac.athlete_id = a.id
            JOIN
                "GameCompetitor" gc ON a.id = gc.athlete_id
            JOIN
                "Game" g ON gc.game_id = g.id
            ORDER BY
                c.country_name;
        `;
        const result = await client.query(query);
        const formattedResult = result.rows.map(row => ({
            id: row.id,
            country_name: row.country_name,
            noc: row.noc
        }));
        res.json(formattedResult);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des pays participants');
    } finally {
        client.release();
    }
});

app.get('/country_details', async (req: Request, res: Response) => {
    const { country } = req.query;
    const client = await pool.connect();
    try {
        const hostedGamesQuery = `
            SELECT DISTINCT g.game_name, g.games_years
            FROM "Game" g
            JOIN "GameCity" gc ON g.id = gc.game_id
            JOIN "City" c ON gc.city_id = c.id
            JOIN "Country" co ON c.id = co.id
            WHERE co.country_name = $1;
        `;
        const athletesQuery = `
            SELECT DISTINCT a.full_name
            FROM "Athlete" a
            JOIN "AthleteCountry" ac ON a.id = ac.athlete_id
            JOIN "Country" c ON ac.country_id = c.id
            WHERE c.country_name = $1;
        `;

        const goldQuery = `
        SELECT COUNT(*) as total
        FROM "Medal"
        JOIN "CompetitorEvent" ON "Medal"."id" = "CompetitorEvent"."medal_id"
        JOIN "GameCompetitor" ON "CompetitorEvent"."competitor_id" = "GameCompetitor"."id"
        JOIN "AthleteCountry" ON "GameCompetitor"."athlete_id" = "AthleteCountry"."athlete_id"
        JOIN "Country" ON "AthleteCountry"."country_id" = "Country"."id"
        WHERE "Country"."country_name" = $1 AND "Medal"."type" = 'GOLD';
    `;
        const silverQuery = `
        SELECT COUNT(*) as total
        FROM "Medal"
        JOIN "CompetitorEvent" ON "Medal"."id" = "CompetitorEvent"."medal_id"
        JOIN "GameCompetitor" ON "CompetitorEvent"."competitor_id" = "GameCompetitor"."id"
        JOIN "AthleteCountry" ON "GameCompetitor"."athlete_id" = "AthleteCountry"."athlete_id"
        JOIN "Country" ON "AthleteCountry"."country_id" = "Country"."id"
        WHERE "Country"."country_name" = $1 AND "Medal"."type" = 'SILVER';
    `;
        const bronzeQuery = `
        SELECT COUNT(*) as total
        FROM "Medal"
        JOIN "CompetitorEvent" ON "Medal"."id" = "CompetitorEvent"."medal_id"
        JOIN "GameCompetitor" ON "CompetitorEvent"."competitor_id" = "GameCompetitor"."id"
        JOIN "AthleteCountry" ON "GameCompetitor"."athlete_id" = "AthleteCountry"."athlete_id"
        JOIN "Country" ON "AthleteCountry"."country_id" = "Country"."id"
        WHERE "Country"."country_name" = $1 AND "Medal"."type" = 'BRONZE';
    `;


        const hostedGamesResult = await client.query(hostedGamesQuery, [country]);
        const athletesResult = await client.query(athletesQuery, [country]);
        const goldMedals = await client.query(goldQuery, [country]);
        const silverMedals = await client.query(silverQuery, [country]);
        const bronzeMedals = await client.query(bronzeQuery, [country]);

        const medalsData = {
            gold: goldMedals.rows[0].total,
            silver: silverMedals.rows[0].total,
            bronze: bronzeMedals.rows[0].total
        };

        const data = {
            hostedGames: hostedGamesResult.rows.map(row => `${row.game_name} (${row.games_years})`),
            athletes: athletesResult.rows.map(row => row.full_name),
            medals: medalsData
        };

        res.json(data);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Erreur lors de la récupération des détails du pays');
    } finally {
        client.release();
    }
});





app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


// host -> disciples ->athletes -> resulats

// table discirples a partir de olympics reulsats.

//  trai = une   >plusieurs