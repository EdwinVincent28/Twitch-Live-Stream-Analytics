const mongoose = require('mongoose');
const { createClient } = require('redis');
const { QdrantClient } = require('@qdrant/js-client-rest');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL });

async function connectDatabases() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await redisClient.connect();
    console.log('Redis connected');

    await qdrantClient.getCollections();
    console.log('Qdrant connected');
}

module.exports = { connectDatabases, redisClient, qdrantClient };