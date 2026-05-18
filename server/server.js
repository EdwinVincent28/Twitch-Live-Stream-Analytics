require('dotenv').config();
const express = require('express');
const { connectDatabases } = require('./config/db');
const { startTwitchListener } = require('./services/twitchListener');
const { startDrainer } = require('./services/mongoDrainer');
const { startChunker } = require('./services/qdrantChunker');
const searchRoute = require('./routes/searchRoute');
const historyRoutes = require('./routes/historyRoutes');

const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/search', searchRoute);
app.use('/api/history', historyRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

async function startServer() {
    try {
        console.log('Starting database connections...');
        await connectDatabases();
        await startTwitchListener(io);
        startDrainer();
        await startChunker();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start:', error.message);
        process.exit(1);
    }
}

startServer();