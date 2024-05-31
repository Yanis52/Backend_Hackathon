import { Router, Request, Response, NextFunction } from "express";
import { HttpCode } from "../http-code/http-error-code";
import { Pool } from "pg";

const pool = new Pool({
    // modifier plus tard pour mettre les credentials dans un fichier .env
    user: "yanis52",
    password: "J@B$qwvH37zrWbY",
    host: 'postgresql-yanis52.alwaysdata.net',
    database: 'yanis52_db',
    port: 5432,
});

export function athleteRouter(): Router {
    const router = Router();

    router.get("/", async (req: Request, res: Response, next: NextFunction) => {
        const client = await pool.connect();

        // Get pagination parameters from the request query
        const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
        const pageSize = parseInt(req.query.pageSize as string) || 100; // Default to 100 items per page if not provided

        // Calculate the OFFSET
        const offset = (page - 1) * pageSize;

        // Construct the SQL query with LIMIT and OFFSET
        const query = `
        SELECT 
    "Athlete"."full_name" AS "Athlete", 
    "Country"."country_name" AS "Country", 
    COUNT("CompetitorEvent"."medal_id") AS "Medal_Count"
FROM 
    "Athlete"
INNER JOIN 
    "AthleteCountry" ON "Athlete"."id" = "AthleteCountry"."athlete_id"
INNER JOIN 
    "Country" ON "AthleteCountry"."country_id" = "Country"."id"
LEFT JOIN 
    "GameCompetitor" ON "Athlete"."id" = "GameCompetitor"."athlete_id"
LEFT JOIN 
    "CompetitorEvent" ON "GameCompetitor"."id" = "CompetitorEvent"."competitor_id"
LEFT JOIN 
    "Medal" ON "CompetitorEvent"."medal_id" = "Medal"."id"
WHERE 
    "CompetitorEvent"."medal_id" IS NOT NULL AND
    "Medal"."type" != 'No medal'
GROUP BY 
    "Athlete"."full_name", 
    "Country"."country_name"
ORDER BY 
    "Medal_Count" DESC
LIMIT $1
OFFSET $2;
        `;

        const totalItemsQuery = `
        SELECT COUNT(*) AS "TotalItems"
        FROM (
            SELECT 
                "Athlete"."full_name" AS "Athlete", 
                "Country"."country_name" AS "Country", 
                COUNT("CompetitorEvent"."medal_id") AS "Medal_Count"
            FROM 
                "Athlete"
            INNER JOIN 
                "AthleteCountry" ON "Athlete"."id" = "AthleteCountry"."athlete_id"
            INNER JOIN 
                "Country" ON "AthleteCountry"."country_id" = "Country"."id"
            LEFT JOIN 
                "GameCompetitor" ON "Athlete"."id" = "GameCompetitor"."athlete_id"
            LEFT JOIN 
                "CompetitorEvent" ON "GameCompetitor"."id" = "CompetitorEvent"."competitor_id"
            LEFT JOIN 
                "Medal" ON "CompetitorEvent"."medal_id" = "Medal"."id"
            WHERE 
                "CompetitorEvent"."medal_id" IS NOT NULL AND
                "Medal"."type" != 'No medal'
            GROUP BY 
                "Athlete"."full_name", 
                "Country"."country_name"
        ) AS SubQuery;
`;

        try {
            const result = await client.query(query, [pageSize, offset]);
            const totalItemsResult = await client.query(totalItemsQuery);
            const totalItems = totalItemsResult.rows[0].TotalItems;
            
            // Calculate total pages
            const totalPages = Math.ceil(totalItems / pageSize);
            console.log(result);
            if (result.rowCount === 0) {
                res.status(HttpCode.NOT_FOUND).json({ message: "No data found" });
            } else {
                res.status(HttpCode.OK).json({
                    result: result.rows,
                    pagination: {
                        page,
                        pageSize,
                        totalItems,
                        totalPages  // Include total pages in the response
                    }
                });
            }
        } catch (error) {
            console.error('Error executing query', error);
            res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        } finally {
            client.release();
        }

    });

    router.get("/:fullName", async (req: Request, res: Response, next: NextFunction) => {
        const client = await pool.connect();

        const fullName = req.params.fullName;

        const query = `
        SELECT 
    "Athlete"."id" AS "Athlete_ID",
    "Athlete"."full_name" AS "Athlete", 
    "Country"."country_name" AS "Country", 
    "Discipline"."name" AS "Discipline",
    "Game"."game_name" AS "Game",
    SubQuery."Highest_Medal",
    SubQuery."Event_Name"
FROM 
    "Athlete"
INNER JOIN 
    "AthleteCountry" ON "Athlete"."id" = "AthleteCountry"."athlete_id"
INNER JOIN 
    "Country" ON "AthleteCountry"."country_id" = "Country"."id"
INNER JOIN 
    "GameCompetitor" ON "Athlete"."id" = "GameCompetitor"."athlete_id"
INNER JOIN 
    "Game" ON "GameCompetitor"."game_id" = "Game"."id"
INNER JOIN 
    "CompetitorEvent" ON "GameCompetitor"."id" = "CompetitorEvent"."competitor_id"
INNER JOIN 
    "Event" ON "CompetitorEvent"."event_id" = "Event"."id"
INNER JOIN 
    "Discipline" ON "Event"."discipline_id" = "Discipline"."id"
INNER JOIN 
    (
        SELECT 
            "GameCompetitor"."athlete_id",
            "Medal"."type" AS "Highest_Medal",
            "Event"."name" AS "Event_Name",
            ROW_NUMBER() OVER (
                PARTITION BY "GameCompetitor"."athlete_id"
                ORDER BY CASE "Medal"."type"
                    WHEN 'GOLD' THEN 1
                    WHEN 'SILVER' THEN 2
                    WHEN 'BRONZE' THEN 3
                END
            ) AS "Rank"
        FROM 
            "GameCompetitor"
        INNER JOIN 
            "CompetitorEvent" ON "GameCompetitor"."id" = "CompetitorEvent"."competitor_id"
        INNER JOIN 
            "Medal" ON "CompetitorEvent"."medal_id" = "Medal"."id"
        INNER JOIN 
            "Event" ON "CompetitorEvent"."event_id" = "Event"."id"
        WHERE 
            "Medal"."type" IN ('BRONZE', 'SILVER', 'GOLD')
    ) AS SubQuery ON "Athlete"."id" = SubQuery."athlete_id" AND SubQuery."Rank" = 1
WHERE 
    "Athlete"."full_name" = $1;
        `;

        try {
            const result = await client.query(query, [fullName]);

            if (result.rowCount === 0) {
                res.status(HttpCode.NOT_FOUND).json({ message: "No data found" });
            } else {
                res.status(HttpCode.OK).json(result.rows[0]);
            }
        } catch (error) {
            console.error('Error executing query', error);
            res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        } finally {
            client.release();
        }
    }
    );

    return router;
}