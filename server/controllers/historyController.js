const historyService = require('../services/historyService');

async function getStreamHistory(req, res) {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Date parameter is required" });
        }

        const messages = await historyService.getMessagesByDate(date);

        res.status(200).json(messages);
    } catch (error) {
        console.error("History Controller Error:", error);
        res.status(500).json({ error: "Failed to fetch stream history" });
    }
}

module.exports = {getStreamHistory};