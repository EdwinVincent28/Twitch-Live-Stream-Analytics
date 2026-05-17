import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Clock, Flame, MessageSquare, Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "When was chat going absolutely crazy?",
  "Find moments when chat was hyped after a clutch",
  "When were people spamming W in chat?",
  "Find the most toxic moments",
  "When was chat laughing the most?",
];

const MOCK_RESPONSE = {
  answer: "Chat peaked at 10:42 PM with a hype score of 97/100 when 176 messages flooded in within 15 seconds. The crowd erupted with BAND, W, and o7 spam after Jynxzi nearly got someone banned for flaming in all chat. A second spike occurred at 10:44 PM (hype: 87) with similar energy around a clutch play.",
  sources: [
    { score: 0.89, start_time: "2026-05-01T22:42:00Z", end_time: "2026-05-01T22:42:15Z", message_count: 176, hype_score: 97, preview: "W BAND BAND o7 LOL BAND BAND gg banned W BAND THERES NOTHING BELOW IRON LOL..." },
    { score: 0.74, start_time: "2026-05-01T22:44:00Z", end_time: "2026-05-01T22:44:15Z", message_count: 143, hype_score: 87, preview: "BANNEDDD GG TIME TO THROW W chatting BAND BAND You're getting banned for sure..." },
    { score: 0.61, start_time: "2026-05-01T22:43:00Z", end_time: "2026-05-01T22:43:15Z", message_count: 91, hype_score: 60, preview: "good comms buyyyy He's a natural WW y u booly BANNEDDD GG barron move your head bro..." },
  ]
};

function SourceCard({ source, index }) {
  const time = new Date(source.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const scoreColor = source.score > 0.8 ? "var(--chart-3)" : source.score > 0.6 ? "var(--chart-4)" : "var(--muted-foreground)";
  const hypeBg = source.hype_score > 70 ? "var(--hype-high)" : source.hype_score > 40 ? "var(--hype-mid)" : "var(--hype-low)";

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: scoreColor, background: `${scoreColor}15` }}>
            #{index + 1} · {Math.round(source.score * 100)}% match
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock size={9} />
            {time}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px]">
            <MessageSquare size={9} className="text-muted-foreground" />
            <span className="text-muted-foreground font-mono">{source.message_count}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: hypeBg }}>
            <Flame size={9} />
            {source.hype_score}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono leading-relaxed line-clamp-2">{source.preview}</p>
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end gap-3 msg-enter">
        <div className="max-w-[75%] flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">{msg.time}</span>
            <span className="text-[10px] font-semibold text-foreground">You</span>
            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User size={10} className="text-primary" />
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/25 text-sm text-foreground">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 msg-enter">
      <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shrink-0 mt-1">
        <Bot size={13} className="text-primary" />
      </div>
      <div className="flex-1 max-w-[85%] flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-primary">VibeCheck AI</span>
          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
        </div>

        {/* Answer */}
        {msg.answer && (
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border text-sm text-foreground leading-relaxed">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={11} className="text-primary" />
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">AI Analysis</span>
            </div>
            {msg.answer}
          </div>
        )}

        {/* Sources */}
        {msg.sources?.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase px-1">
              Sources from Qdrant ({msg.sources.length})
            </span>
            {msg.sources.map((s, i) => (
              <SourceCard key={i} source={s} index={i} />
            ))}
          </div>
        )}

        {msg.loading && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
            <Loader2 size={13} className="text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Searching Qdrant and generating answer...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      time: "now",
      answer: "Hey! I'm VibeCheck AI. Ask me anything about the stream — when chat went crazy, what people were hyped about, or find specific moments using natural language.",
      sources: [],
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (query) => {
    const q = query || input.trim();
    if (!q || loading) return;
    setInput("");

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const loadingMsg = {
      id: Date.now() + 1,
      role: "assistant",
      loading: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, loading: false, answer: data.answer, sources: data.sources }
          : m
      ));
    } catch {
      // Fallback to mock for demo
      setTimeout(() => {
        setMessages(prev => prev.map(m =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, answer: MOCK_RESPONSE.answer, sources: MOCK_RESPONSE.sources }
            : m
        ));
      }, 1800);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Example queries */}
      <div className="px-6 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-150 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-3 p-3 rounded-xl bg-card border border-border focus-within:border-primary/40 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about chat moments, hype spikes, emote patterns..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[24px] max-h-[120px] leading-6 py-0 disabled:opacity-50"
            style={{ fieldSizing: "content" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary hover:bg-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {loading
              ? <Loader2 size={14} className="text-primary-foreground animate-spin" />
              : <Send size={14} className="text-primary-foreground" />
            }
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Powered by Qdrant vector search + Groq LLM · Press Enter to send
        </p>
      </div>
    </div>
  );
}