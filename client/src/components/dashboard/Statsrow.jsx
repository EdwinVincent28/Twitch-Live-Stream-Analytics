import { useEffect, useState } from "react";
import { MessageSquare, Users, Flame, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, label, value, unit, color, delta }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Animate count up
    const target = Number(String(value).replace(/,/g, ""));
    if (isNaN(target)) return;
    let start = 0;
    const step = Math.ceil(target / 30);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setDisplay(start);
      if (start >= target) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [value]);

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
          {typeof display === "number" ? display.toLocaleString() : value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function StatsRow({ stats }) {
  const defaults = [
    { icon: MessageSquare, label: "Messages / min", value: stats?.msgsPerMin ?? 142, unit: "", color: "text-primary", delta: 12 },
    { icon: Users, label: "Active Chatters", value: stats?.activeChatters ?? 1847, unit: "", color: "text-[var(--chart-2)]", delta: 5 },
    { icon: Flame, label: "Hype Score", value: stats?.hypeScore ?? 73, unit: "/ 100", color: "text-[var(--hype-mid)]", delta: 8 },
    { icon: TrendingUp, label: "Chunks in Qdrant", value: stats?.qdrantChunks ?? 312, unit: "", color: "text-[var(--chart-3)]", delta: 3 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {defaults.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
}