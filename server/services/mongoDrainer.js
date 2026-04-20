const ChatMessage = require('../models/ChatMessage');
const { redisClient } = require('../config/db');
const { REDIS_CHAT_KEY } = require('./twitchListener');

const BATCH_SIZE = 500;
const DRAIN_INTERVAL_MS = 5000;

async function drainRedisMongo() {
    try {
        const batch = await redisClient.lPopCount(REDIS_CHAT_KEY, BATCH_SIZE);

        if (!batch || batch.length === 0) return;

        const docs = batch.map(item => JSON.parse(item));
        await ChatMessage.insertMany(docs, { ordered: false });

        console.log(`Drained ${docs.length} messages → MongoDB`);
    } catch (err) {
        console.error('Drain failed:', err.message);
    }
}

function startDrainer() {
    console.log(`MongoDB drainer started (every ${DRAIN_INTERVAL_MS / 1000}s)`);
    setInterval(drainRedisMongo, DRAIN_INTERVAL_MS);
}

module.exports = { startDrainer };