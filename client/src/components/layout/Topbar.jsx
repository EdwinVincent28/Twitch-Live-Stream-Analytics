import { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";

const PAGE_LABELS = {
  dashboard: "Live Dashboard",
  chatbot: "Vibe Search",
  rewind: "Stream Rewind",
};

const PAGE_DESCRIPTIONS = {
  dashboard: "Real-time chat analytics",
  chatbot: "Natural language chat query",
  rewind: "Historical stream explorer",
};

export default function TopBar({ page }) {
  const [time, setTime] = useState(new Date());
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate live msg counter ticking up
  useEffect(() => {
    const t = setInterval(() => {
      setMsgCount(n => n + Math.floor(Math.random() * 8 + 1));
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="relative flex items-center justify-between px-6 h-14 bg-card border-b border-border shrink-0">
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-tight">
            {PAGE_LABELS[page]}
          </h1>
          <p className="text-[11px] text-muted-foreground">{PAGE_DESCRIPTIONS[page]}</p>
        </div>
      </div>

      {/* Right: live stats */}
      <div className="flex items-center gap-4">
        {/* Messages ingested */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border">
          <Activity size={12} className="text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{msgCount.toLocaleString()}</span>
            {" "}msgs
          </span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Clock size={12} />
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--live-red)]/15 border border-[var(--live-red)]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--live-red)] live-dot" />
          <span className="text-[10px] font-bold text-[var(--live-red)] tracking-widest uppercase">Live</span>
        </div>
      </div>
    </header>
  );
}