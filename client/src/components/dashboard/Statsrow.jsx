import { useEffect, useState, useRef } from "react";
import { MessageSquare, Users, Flame, TrendingUp } from "lucide-react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

function StatCard({ icon: Icon, label, value, unit, color, delta }) {

  return (
    <div className="relative flex flex-col gap-3 p-4 rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors duration-200">
      {/* Background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${color}/5 to-transparent`} />

      <div className="flex items-center justify-between">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${color}/15 border border-current/10`}>
          <Icon size={15} className={color} />
        </div>
        {delta !== undefined && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${delta >= 0 ? "text-[var(--hype-low)] bg-[var(--hype-low)]/10" : "text-[var(--hype-high)] bg-[var(--hype-high)]/10"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function StatsRow() {
  const [stats, setStats] = useState({
    msgsPerMin: 0,
    activeChatters: 0,
    hypeScore: 0,
    qdrantChunks: 312
  });

  const historyRef = useRef([]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      historyRef.current.push({
        timestamp: Date.now(),
        username: msg.username
      });
    };

    socket.on("chat_message", handleNewMessage);

    const t = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const fifteenSecondsAgo = now - 15000;

      historyRef.current = historyRef.current.filter(m => m.timestamp >= oneMinuteAgo);
      const recentMessages = historyRef.current;

      const msgsPerMin = recentMessages.length;

      const uniqueUsers = new Set(recentMessages.map(m => m.username));
      const activeChatters = uniqueUsers.size;

      const recent15s = recentMessages.filter(m => m.timestamp >= fifteenSecondsAgo).length;
      const msgsPerSecond = recent15s / 15;
      const hypeScore = Math.min(100, Math.round(msgsPerSecond * 5));

      setStats(prev => ({
        ...prev,
        msgsPerMin,
        activeChatters,
        hypeScore
      }));

    }, 1000);

    return () => {
      socket.off("chat_message", handleNewMessage);
      clearInterval(t);
    };
  }, []);

  const statCards = [
    { icon: MessageSquare, label: "Messages / min", value: stats.msgsPerMin, unit: "", color: "text-primary", delta: 12 },
    { icon: Users, label: "Active Chatters", value: stats.activeChatters, unit: "", color: "text-[var(--chart-2)]", delta: 5 },
    { icon: Flame, label: "Hype Score", value: stats.hypeScore, unit: "/ 100", color: "text-[var(--hype-mid)]", delta: 8 },
    { icon: TrendingUp, label: "Chunks in Qdrant", value: stats.qdrantChunks, unit: "", color: "text-[var(--chart-3)]", delta: 3 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
}