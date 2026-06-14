const sql = require('mssql');

module.exports = async function (context, req) {

    // Support BOTH JSON body and query string
    const playerId = req.body?.playerId || req.query.playerId;
    const matchId = req.body?.matchId || req.query.matchId;
    const availability = req.body?.availability || req.query.availability;

    // Validate required fields
    if (!playerId || !matchId || !availability) {
        context.res = {
            status: 400,
            body: "Missing required fields: playerId, matchId, availability"
        };
        return;
    }

    try {
        await sql.connect(process.env.SQL_CONNECTION_STRING);

        await sql.query`
            MERGE MatchAvailability AS target
            USING (SELECT ${matchId} AS MatchId, ${playerId} AS PlayerId) AS source
            ON target.MatchId = source.MatchId AND target.PlayerId = source.PlayerId
            WHEN MATCHED THEN
                UPDATE SET Availability = ${availability}, LastUpdated = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (MatchId, PlayerId, Availability, LastUpdated)
                VALUES (${matchId}, ${playerId}, ${availability}, GETDATE());
        `;

        context.res = {
            status: 200,
            body: "Saved"
        };

    } catch (err) {
        context.res = {
            status: 500,
            body: err.message
        };
    }
};
