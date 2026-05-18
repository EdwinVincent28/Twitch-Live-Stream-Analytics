const tmi = require('tmi.js');
const { redisClient } = require('../config/db');

const CHANNEL = (process.env.TWITCH_CHANNEL || 'tarik').toLowerCase();
const MONGO_QUEUE = `queue:mongo:${CHANNEL}`;
const QDRANT_QUEUE = `queue:qdrant:${CHANNEL}`;

const twitchClient = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true, secure: true },
    channels: [CHANNEL]
});

async function startTwitchListener(io) {
    await twitchClient.connect();
    console.log(`Twitch chat connected to: #${CHANNEL}`);

    twitchClient.on('message', async (channel, tags, message, self) => {
        if (self) return;

        const payload = JSON.stringify({
            channel:  channel.replace('#', ''),
            username: tags['display-name'] || tags.username,
            message,
            timestamp: new Date(),
            tags: {
                color:      tags.color || '#ffffff',
                subscriber: tags.subscriber,
                mod:        tags.mod,
                vip:        tags.vip ?? false,
                emotes:     tags.emotes,
            }
        });

        if (io) {
            io.emit('chat_message', payload);
        }

        try {
            const payloadString = JSON.stringify(payload);
            await Promise.all([
                redisClient.lPush(MONGO_QUEUE, payloadString),
                redisClient.lPush(QDRANT_QUEUE, payloadString)
            ]);
        } catch (err) {
            console.error('Redis push failed:', err.message);
        }
    });
}

module.exports = { startTwitchListener, MONGO_QUEUE, QDRANT_QUEUE };