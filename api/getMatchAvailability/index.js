const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.NEON_CONNECTION_STRING
});

module.exports = async function (context, req) {
    context.log("getMatchAvailability called");

    const matchId = (req.query.matchId || req.body?.matchId || "").trim();

    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    };

    if (!matchId) {
        context.res.status = 400;
        context.res.body = { error: "Please provide matchId" };
        return;
    }

    try {
        const result = await pool.query(
            `
            SELECT 
                ma.matchid,
                ma.playerid,
                ma.availability,
                ma.lastupdated,
                cp.playername
            FROM matchavailability ma
            INNER JOIN currentplayers cp
                ON cp.playerid = ma.playerid
            WHERE ma.matchid = $1
            ORDER BY cp.playername ASC;
            `,
            [matchId]
        );

        context.res.status = 200;
        context.res.body = result.rows;

    } catch (err) {
        context.log.error("getMatchAvailability error:", err);

        context.res.status = 500;
        context.res.body = { error: err.message };
    }
};

