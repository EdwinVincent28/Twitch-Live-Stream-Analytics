import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const SPAM_POOL = ["W", "BAND", "KEKW", "o7", "LOL", "PogChamp", "LULW", "Copium", "L", "ACE"];

export default function SpamDetector() {
  const [events, setEvents] = useState([
    { word: "BAND", count: 67, time: "2s ago" },
    { word: "W", count: 43, time: "18s ago" },
  ]);

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.35) {
        const word = SPAM_POOL[Math.floor(Math.random() * SPAM_POOL.length)];
        const count = Math.floor(Math.random() * 60 + 20);
        setEvents(prev => [
          { word, count, time: "just now", id: Date.now() },
          ...prev.slice(0, 4),
        ]);
      }
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const intensity = (count) => {
    if (count >= 60) return { color: "var(--hype-high)", label: "MEGA" };
    if (count >= 40) return { color: "var(--hype-mid)", label: "HIGH" };
    return { color: "var(--chart-1)", label: "MOD" };
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-[var(--hype-mid)]" />
        <span className="text-sm font-semibold text-foreground">Spam Detector</span>
        <span className="text-[10px] text-muted-foreground ml-auto font-mono">BURST EVENTS</span>
      </div>

      <div className="flex flex-col gap-2">
        {events.map((ev, i) => {
          const { color, label } = intensity(ev.count);
          return (
            <div
              key={ev.id ?? i}
              className="flex items-center gap-3 p-2.5 rounded-lg border msg-enter"
              style={{ borderColor: `${color}30`, background: `${color}08` }}
            >
              {/* Big word */}
              <div
                className="text-lg font-black tracking-tight min-w-[60px]"
                style={{ color, textShadow: `0 0 12px ${color}` }}
              >
                {ev.word}
              </div>

              {/* Count badge */}
              <div
                className="text-2xl font-black font-mono"
                style={{ color }}
              >
                ×{ev.count}
              </div>

              {/* Meta */}
              <div className="ml-auto flex flex-col items-end gap-0.5">
                <span
                  className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color, background: `${color}20` }}
                >
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{ev.time}</span>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Waiting for spam bursts...</p>
        )}
      </div>
    </div>
  );
}