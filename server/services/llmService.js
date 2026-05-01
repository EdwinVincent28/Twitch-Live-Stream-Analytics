const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

async function generateAnswer(query, chunks) {
    const context = chunks.map((chunk, i) => {
        const time = new Date(chunk.start_time).toLocaleTimeString();
        return `Chunk ${i + 1} [${time}]: ${chunk.message_count} messages, hype score: ${chunk.hype_score}/100\nChat said: "${chunk.preview}"`;
    }).join('\n\n');

    const prompt = `You are an analyst for Twitch chat data. Answer the user's question using ONLY the context below. Be concise and specific about timestamps and what chat was doing.

Context:
${context}

Question: ${query}

Answer:`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.3, 
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq error: ${err}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (err) {
        console.error('LLM generation failed:', err.message);
        throw err;
    }
}

module.exports = { generateAnswer };