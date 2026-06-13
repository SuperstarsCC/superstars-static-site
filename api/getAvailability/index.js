const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        // Connect to SQL using your connection string in Application Settings
        await sql.connect(process.env.SQL_CONNECTION_STRING);

        // Get players
        const playersResult = await sql.query`
            SELECT PlayerId, PlayerName
            FROM CurrentPlayers
            ORDER BY PlayerName;
        `;

        // Get fixtures
        const fixturesResult = await sql.query`
            SELECT MatchId, MatchName
        FROM Fixtures
        ORDER BY 
        CASE 
        WHEN MatchId LIKE 'Match%' 
        THEN TRY_CAST(SUBSTRING(MatchId, 6, LEN(MatchId)) AS INT)
        ELSE 9999
        END,
     MatchName;
        `;

        // Return both lists
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                players: playersResult.recordset,
                fixtures: fixturesResult.recordset
            }
        };

    } catch (err) {
        context.res = {
            status: 500,
            body: err.message
        };
    }
};
