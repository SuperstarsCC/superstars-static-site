const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.NEON_CONNECTION_STRING
});

module.exports = async function (context, req) {
    context.log("getAvailability called");

    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    };

    try {
        const result = await pool.query(`
            SELECT 
                ma.id,
                ma.matchid,
                ma.playerid,
                ma.availability,
                ma.lastupdated,
                cp.playername
            FROM matchavailability ma
            LEFT JOIN currentplayers cp ON cp.playerid = ma.playerid
            ORDER BY ma.lastupdated DESC;
        `);

        context.res.body = result.rows;
    } catch (err) {
        context.log("Error:", err);
        context.res.status = 500;
        context.res.body = { error: "Database error", details: err.message };
    }
};

