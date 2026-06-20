const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.NEON_CONNECTION_STRING
});

module.exports = async function (context, req) {
    context.log("submitAvailability called");

    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    };

    // Support JSON body
    const { matchId, playerId, availability } = req.body || {};

    if (!matchId || !playerId || !availability) {
        context.res.status = 400;
        context.res.body = { error: "matchId, playerId and availability are required" };
        return;
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO matchavailability (matchid, playerid, availability, lastupdated)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
            `,
            [matchId, playerId, availability]
        );

        context.res.body = { success: true, record: result.rows[0] };
    } catch (err) {
        context.log("Error:", err);
        context.res.status = 500;
        context.res.body = { error: "Database error", details: err.message };
    }
};


