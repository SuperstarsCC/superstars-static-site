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
        // 🔥 This is the important part — full error visibility
        context.log("FULL POSTGRES ERROR OBJECT:", err);

        context.res.status = 500;
        context.res.body = {
            error: "Database error",
            message: err.message || null,
            code: err.code || null,
            detail: err.detail || null,
            hint: err.hint || null,
            where: err.where || null,
            stack: err.stack || null
        };
    }
};


