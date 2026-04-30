const tmi = require('tmi.js');
const { redisClient } = require('../config/db');

const CHANNEL = (process.env.TWITCH_CHANNEL || 'tarik').toLowerCase();
const REDIS_CHAT_KEY = `chat:${CHANNEL}`;

const twitchClient = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true, secure: true },
    channels: [CHANNEL]
});

async function startTwitchListener() {
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
                color:      tags.color,
                subscriber: tags.subscriber,
                mod:        tags.mod,
                vip:        tags.vip ?? false,
                emotes:     tags.emotes,
            }
        });

        try {
            await redisClient.lPush(REDIS_CHAT_KEY, payload);
        } catch (err) {
            console.error('Redis push failed:', err.message);
        }
    });
}

module.exports = { startTwitchListener, REDIS_CHAT_KEY };