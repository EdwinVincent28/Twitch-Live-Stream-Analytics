const { pipeline } = require('@xenova/transformers');
const ChatMessage = require('../models/ChatMessage');
const { qdrantClient , redisClient} = require('../config/db');
const { QDRANT_QUEUE } = require('./twitchListener');

const CHANNEL = (process.env.TWITCH_CHANNEL || 'tarik').toLowerCase();;
const COLLECTION_NAME = `chat_chunks_${CHANNEL}`;
const CHUNK_INTERVAL_MS = 15_000;

let embedder = null;

async function initEmbedder() {
    console.log('Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model ready');
}

function getEmbedder() {
    return embedder;
}

async function ensureCollection() {
    const { collections } = await qdrantClient.getCollections();
    const exists = collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: { size: 384, distance: 'Cosine' } 
        });
        console.log(`Qdrant collection created: ${COLLECTION_NAME}`);
    }
}

async function embedText(text) {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

function getDominantEmotes(messages) {
    const emoteCounts = {};
    messages.forEach(msg => {
        if (msg.tags?.emotes) {
            Object.keys(msg.tags.emotes).forEach(id => {
                emoteCounts[id] = (emoteCounts[id] || 0) + 1;
            });
        }
    });
    return Object.entries(emoteCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);
}

function getHypeScore(messageCount, windowSeconds = 15) {
    const msgsPerSecond = messageCount / windowSeconds;
    return Math.min(100, Math.round(msgsPerSecond * 5));
}

async function chunkAndEmbed() {
    try {
        const rawMessages = await redisClient.lPopCount(QDRANT_QUEUE, 5000);

        if (!rawMessages || rawMessages.length === 0) {
            console.log('No messages in Redis queue, skipping chunk');
            return;
        }

        const messages = rawMessages.map(msg => JSON.parse(msg));

        const now = new Date();
        const windowStart = new Date(now - CHUNK_INTERVAL_MS);

        const text = messages.map(m => m.message).join(' ');
        const dominant_emotes = getDominantEmotes(messages);
        const hype_score = getHypeScore(messages.length);
        const vector = await embedText(text);

        await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: [{
                id: Date.now(),
                vector,
                payload: {
                    channel: CHANNEL,
                    start_time: windowStart.toISOString(),
                    end_time: now.toISOString(),
                    message_count: messages.length,
                    text,
                    dominant_emotes,
                    hype_score,
                }
            }]
        });

        console.log(`Chunk embedded to Qdrant | msgs: ${messages.length} | hype: ${hype_score}`);

    } catch (err) {
        console.error('Chunker failed:', err.message);
    }
}

async function startChunker() {
    await initEmbedder();
    await ensureCollection();
    console.log(`Qdrant chunker started (every ${CHUNK_INTERVAL_MS / 1000}s)`);
    setInterval(chunkAndEmbed, CHUNK_INTERVAL_MS);
}

module.exports = { startChunker, getEmbedder };