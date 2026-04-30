require('dotenv').config();
const express = require('express');
const { connectDatabases } = require('./config/db');
const { startTwitchListener } = require('./services/twitchListener');
const { startDrainer } = require('./services/mongoDrainer');
const { startChunker } = require('./services/qdrantChunker');
const app = express();
app.use(express.json());

async function startServer() {
    try {
        console.log('Starting database connections...');
        await connectDatabases();
        await startTwitchListener();
        startDrainer();
        await startChunker();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start:', error.message);
        process.exit(1);
    }
}

startServer();