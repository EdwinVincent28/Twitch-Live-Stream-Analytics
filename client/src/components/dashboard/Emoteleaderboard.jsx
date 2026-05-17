import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const EMOTE_POOL = [
  { name: "KEKW", count: 342, color: "var(--chart-1)" },
  { name: "PogChamp", count: 287, color: "var(--chart-2)" },
  { name: "W", count: 251, color: "var(--chart-3)" },
  { name: "Copium", count: 189, color: "var(--chart-4)" },
  { name: "LULW", count: 143, color: "var(--chart-5)" },
  { name: "o7", count: 98, color: "var(--chart-1)" },
  { name: "BAND", count: 76, color: "var(--chart-2)" },
];

export default function EmoteLeaderboard() {
  const [emotes, setEmotes] = useState(EMOTE_POOL);

  // Simulate live updates
  useEffect(() => {
    const t = setInterval(() => {
      setEmotes(prev =>
        [...prev]
          .map(e => ({ ...e, count: e.count + Math.floor(Math.random() * 15) }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const max = emotes[0]?.count || 1;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-[var(--chart-4)]" />
          <span className="text-sm font-semibold text-foreground">Emote Leaderboard</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono tracking-wider">LAST 60s</span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {emotes.map((emote, i) => {
          const pct = (emote.count / max) * 100;
          return (
            <div key={emote.name} className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-[11px] font-bold font-mono text-muted-foreground w-4 shrink-0">
                {i + 1}
              </span>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{emote.name}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{emote.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: emote.color,
                      boxShadow: `0 0 8px ${emote.color}`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}