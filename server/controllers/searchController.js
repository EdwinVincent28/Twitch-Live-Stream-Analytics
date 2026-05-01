const { getEmbedder } = require('../services/qdrantChunker');
const { qdrantClient } = require('../config/db');
const { generateAnswer } = require('../services/llmService');

const CHANNEL = (process.env.TWITCH_CHANNEL || 'tarik').toLowerCase();
const COLLECTION_NAME = `chat_chunks_${CHANNEL}`;
const DEFAULT_LIMIT = 5;

async function searchChat(req, res) {
    try {
        const { query, limit = DEFAULT_LIMIT } = req.body;
        const embedder = getEmbedder();
        if (!embedder) {
            return res.status(503).json({ error: 'Embedding model not ready yet' });
        }

        const output = await embedder(query, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(output.data);

        const results = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryVector,
            limit: Math.min(limit, 20), 
            with_payload: true,
        });

        const formatted = results.map(result => ({
            score:         result.score,
            start_time:    result.payload.start_time,
            end_time:      result.payload.end_time,
            message_count: result.payload.message_count,
            hype_score:    result.payload.hype_score,
            dominant_emotes: result.payload.dominant_emotes,
            preview:       result.payload.text.slice(0, 200) + '...',
        }));

        const top3 = formatted.slice(0, 3);
        const answer = await generateAnswer(query, top3);

        return res.status(200).json({
            query,
            answer,
            sources: formatted,
            total: formatted.length,
        });

    } catch (err) {
        console.error('Search failed:', err.message);
        return res.status(500).json({ error: 'Search failed', detail: err.message });
    }
}

module.exports = { searchChat };