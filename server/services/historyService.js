const ChatMessage = require('../models/ChatMessage'); 

async function getMessagesByDate(dateString) {
    const startDate = new Date(dateString);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const messages = await ChatMessage.find({
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    })
    .sort({ timestamp: 1 }) 
    .lean(); 

    return messages;
}

module.exports = {
    getMessagesByDate
};