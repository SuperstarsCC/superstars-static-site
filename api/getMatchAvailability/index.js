const sql = require('mssql');

module.exports = async function (context, req) {
    const matchId = (req.query.matchId || (req.body && req.body.matchId) || '').trim();

    if (!matchId) {
        context.res = {
            status: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: "Please provide matchId" }
        };
        return;
    }

    try {
        await sql.connect(process.env.SQL_CONNECTION_STRING);

        const request = new sql.Request();
        request.input('matchId', sql.NVarChar(50), matchId);

        const result = await request.query(`
            SELECT 
                p.PlayerName,
                a.Availability,
                a.LastUpdated
            FROM MatchAvailability a
            INNER JOIN CurrentPlayers p
                ON p.PlayerId = a.PlayerId
            WHERE a.MatchId = @matchId
            ORDER BY p.PlayerName;
        `);

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: result.recordset
        };

    } catch (err) {
        context.log.error("getmatchavailability error:", err);

        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: { error: err.message }
        };
    }
};
