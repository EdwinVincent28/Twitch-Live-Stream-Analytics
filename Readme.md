# VibeCheck — Real-Time Twitch Chat Analytics & AI Search

> An enterprise-grade analytics platform for live Twitch streams. Built with an event-driven architecture to safely handle thousands of chat messages per second, featuring live dashboards, historical stream archiving, and a RAG-powered AI chatbot that answers natural language questions about any stream moment.

**GitHub:** [EdwinVincent28/Twitch-Live-Stream-Analytics](https://github.com/EdwinVincent28/Twitch-Live-Stream-Analytics)

---

## Key Features

**Live Stream Dashboard**
Real-time chat ingestion via `tmi.js` with auto-scrolling feed, subscriber badges, a canvas-based Hype Meter graph, live Emote Leaderboard, and Spam Burst Detector — all updating without page refresh.

**Redis Buffer → MongoDB Drain Pipeline**
Incoming messages are pushed to a Redis list as an atomic in-memory buffer, then bulk-drained to MongoDB every 5 seconds via `insertMany`. This prevents high-frequency Twitch chat spikes (3,000+ msgs/sec during clutch plays) from overwhelming the database with individual writes.

**RAG Pipeline — Qdrant + Groq LLM**
Every 15 seconds, a background chunker fetches the message window from MongoDB, embeds it locally using `all-MiniLM-L6-v2` (Xenova Transformers — fully offline, no OpenAI), and upserts the vector + metadata (hype score, dominant emotes, timestamps) into Qdrant. A REST search endpoint embeds the user's query, performs filtered vector search, and feeds the top chunks as context to Groq's LLM for a natural-language answer.

**Stream Rewind — Historical Archive**
Calendar-based UI to browse any past stream date. Queries MongoDB for full paginated chat logs, top contributors, and message volume — all from cold storage without touching Redis or Qdrant.

**Semantic Search**
Ask *"When was chat going crazy after a clutch?"* or *"Find moments when people were spamming W"* — Qdrant returns the exact 15-second window with timestamp, hype score, and message preview.

---

## System Architecture

```
Twitch IRC (tmi.js)
        │
        ▼
   Redis Buffer          ← atomic lPush, handles burst spikes
   (chat:<channel>)
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Mongo      Qdrant
Drainer    Chunker
(5s)       (15s)
   │         │
   ▼         ▼
MongoDB    Qdrant        ← permanent storage + vector index
   │         │
   └────┬────┘
        │
        ▼
  Express REST API
        │
        ▼
  React + Vite Frontend
```

**Ingestion Layer** — `tmi.js` connects to Twitch IRC and pushes raw JSON payloads to Redis via `lPush`.

**Buffer Layer (Dual Workers)**
- **Mongo Drainer** — `lPopCount(500)` every 5 seconds → `insertMany` to MongoDB
- **Qdrant Chunker** — fetches 15s message window from MongoDB → embed with `all-MiniLM-L6-v2` → upsert vector + payload to Qdrant

**Presentation Layer** — React/Vite frontend consuming live data from the Express REST API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS, shadcn/ui, Lucide React |
| **Backend** | Node.js, Express.js |
| **Chat Ingestion** | tmi.js (Twitch IRC) |
| **Message Buffer** | Redis (atomic list operations) |
| **Persistent Storage** | MongoDB + Mongoose (TTL index — 30 day auto-expiry) |
| **Vector Database** | Qdrant |
| **Embeddings** | Xenova/all-MiniLM-L6-v2 — fully local, no API cost |
| **LLM** | Groq API — `llama-3.1-8b-instant` |
| **Infrastructure** | Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Docker Desktop

### 1. Clone the repository
```bash
git clone https://github.com/EdwinVincent28/Twitch-Live-Stream-Analytics.git
cd Twitch-Live-Stream-Analytics
```

### 2. Start all databases
```bash
docker-compose up -d
```
This spins up MongoDB (port 27017), Redis (port 6379), and Qdrant (port 6333).

### 3. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
PORT=5000
TWITCH_CHANNEL=jynxzi
MONGO_URI=mongodb://127.0.0.1:27017/twitchanalytics
REDIS_URL=redis://127.0.0.1:6379
QDRANT_URL=http://127.0.0.1:6333
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

> **Note:** Use `127.0.0.1` instead of `localhost` on Windows — Docker Desktop binds to IPv4 only and `localhost` may resolve to IPv6, causing silent connection hangs.

Start the server:
```bash
node server.js
```

Expected output:
```
✅ MongoDB connected
✅ Redis connected
✅ Qdrant connected
✅ Twitch chat connected to: #jynxzi
✅ MongoDB drainer started (every 5s)
✅ Embedding model ready
✅ Qdrant chunker started (every 15s)
🚀 Server running on http://localhost:5000
```

### 4. Frontend setup
```bash
cd client
npm install
npm run dev
```

---

## 📂 Project Structure

```
Twitch-Live-Stream-Analytics/
├── docker-compose.yml
│
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB, Redis, Qdrant connections
│   ├── models/
│   │   └── ChatMessage.js         # Mongoose schema + TTL index
│   ├── services/
│   │   ├── twitchListener.js      # tmi.js → Redis lPush
│   │   ├── mongoDrainer.js        # Redis → MongoDB every 5s
│   │   ├── qdrantChunker.js       # MongoDB → embed → Qdrant every 15s
│   │   └── llmService.js          # Groq LLM answer generation
│   ├── controllers/
│   │   └── searchController.js    # Embed query → Qdrant → LLM
│   ├── routes/
│   │   └── search.js              # POST /api/search
│   ├── middleware/
│   │   └── validate.js            # Request validation
│   └── server.js                  # Entry point
│
└── client/
    └── src/
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   └── TopBar.jsx
        │   └── dashboard/
        │       ├── HypeMeter.jsx      # Canvas-based msgs/sec graph
        │       ├── EmoteLeaderboard.jsx
        │       ├── LiveFeed.jsx       # Auto-scrolling chat feed
        │       ├── StatsRow.jsx       # Live stat cards
        │       └── SpamDetector.jsx   # Burst event detector
        ├── pages/
        │   ├── Dashboard.jsx          # Live dashboard layout
        │   ├── ChatBot.jsx            # Semantic search + RAG UI
        │   └── StreamRewind.jsx       # Historical archive + calendar
        └── App.jsx
```

---

## 🔌 API Reference

### `POST /api/search`
Natural language semantic search over embedded chat chunks.

**Request:**
```json
{
  "query": "when were the chat discussing about rook in chess. Give me a brief summary about the discussion"
}
```

**Response:**
```json
{
  "query": "when were the chat discussing about rook. Give me a brief summary about the discussion",
  "answer": "The chat was discussing about rook from 9:39:51 PM to 9:40:36 PM.\n\nDuring this time, the chat was expressing frustration and disappointment with a player's move, specifically the loss of a rook (Rook E1). They were criticizing the player's decision, using derogatory language, and suggesting alternative moves to save the rook. The discussion peaked at 9:40:36 PM with 108 messages and a hype score of 36/100.",
  "sources": [
    {
      "score": 0.49243477,
      "start_time": "2026-05-18T19:40:36.706Z",
      "end_time": "2026-05-18T19:40:51.706Z",
      "message_count": 108,
      "hype_score": 36,
      "dominant_emotes": ["emotesv2_a1a917e42b3e4ceb936e7945962be591"],
      "preview": "SO DUMB ROOK E1 worst moveee on the boarddddd ? JUST LOST A ROOK FOR WHAT UR AN IDIOT YT BRO trash vs garbage E1 jynxziVapeBreak Genius BISHOP TAKES IT -rok Under rook bro found the worst move..."
    },
    {
      "score": 0.46522722,
      "start_time": "2026-05-18T19:40:21.696Z",
      "end_time": "2026-05-18T19:40:36.696Z",
      "message_count": 110,
      "hype_score": 37,
      "dominant_emotes": ["emotesv2_587405136a8147148c77df74baaa1bf4"],
      "preview": "the rpooookkkkkkkkkkkk watch the h1 ROOK E1 E1 trade queens then save your rook UH OH ROCK E1 Dont ROOK E1 e1 time SAVE ROOK i would love to piss on ur face ROOOOOOOOK rook move the queee..."
    },
    {
      "score": 0.46121752,
      "start_time": "2026-05-18T19:39:51.683Z",
      "end_time": "2026-05-18T19:40:06.683Z",
      "message_count": 84,
      "hype_score": 28,
      "dominant_emotes": ["emotesv2_a9cf917697e14b2e86275c25f190a7e1"],
      "preview": "rokkkkk rook e1 save the rook] move rook you want to move your rook save your rook UR ROOOOOOOOOOOK bro doesnt know he has a rook EEEEEEEEEEEEEEEEEEEEE1111111111111111111111111111..."
    },
    {
      "score": 0.4480111,
      "start_time": "2026-05-18T19:39:36.667Z",
      "end_time": "2026-05-18T19:39:51.667Z",
      "message_count": 85,
      "hype_score": 28,
      "dominant_emotes": [
        "emotesv2_a1a917e42b3e4ceb936e7945962be591",
        "emotesv2_22282505661f406aa9a60f376bd064b7"
      ],
      "preview": "daddy get on seige !gamble 100 rook e1 Free pawn numb nuts rook e1 ranaldo YTTTTTTTTTT Re1 save your rooks MOVE YOUR ROOOK..."
    },
    {
      "score": 0.42863083,
      "start_time": "2026-05-18T19:40:06.696Z",
      "end_time": "2026-05-18T19:40:21.696Z",
      "message_count": 107,
      "hype_score": 36,
      "dominant_emotes": [
        "emotesv2_f2fd474fbe964964b2570671575b39ea",
        "emotesv2_f11a584b87da4a09980e2d9e1446e70c"
      ],
      "preview": "YO YOU KNOW IF YOU CHEAT YOU CAN WIN ROOK E1 bring out rook take pawn BratChat BratChat BratChat BratChat rook e1 rook e1 he doesnt pay attention..."
    }
  ],
  "total": 5
}
```

---

## 👨‍💻 Author

**Edwin Vincent**
MSc Applied Computer Science — SRH University Heidelberg

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/edwin-vincent-evt)
[![GitHub](https://img.shields.io/badge/GitHub-EdwinVincent28-181717?style=flat&logo=github)](https://github.com/EdwinVincent28)