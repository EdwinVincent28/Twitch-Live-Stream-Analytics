import { useState } from "react";
import { Calendar, Search, ChevronLeft, ChevronRight, Crown, Flame, MessageSquare } from "lucide-react";

const MOCK_MESSAGES = [
  { username: "xG0dSlayer", message: "W W W PogChamp this is insane", color: "#9b59b6", subscriber: true, timestamp: "22:42:11" },
  { username: "lowkeyfan99", message: "Copium Copium bro missed again", color: "#3498db", subscriber: false, timestamp: "22:42:12" },
  { username: "ValorantPro44", message: "KEKW KEKW he's so cooked chat", color: "#e74c3c", subscriber: true, timestamp: "22:42:13" },
  { username: "chillvibes_", message: "this is actually wild bro how", color: "#2ecc71", subscriber: false, timestamp: "22:42:14" },
  { username: "NotABot1234", message: "BAND BAND BAND get em out of here", color: "#f39c12", subscriber: true, timestamp: "22:42:15" },
  { username: "MATSUZAKA", message: "o7 o7 respect honestly", color: "#1abc9c", subscriber: false, timestamp: "22:42:17" },
  { username: "Reaper0096", message: "W only W players in this chat", color: "#e74c3c", subscriber: true, timestamp: "22:42:18" },
  { username: "streamsnipr", message: "Copium the team diff is real", color: "#9b59b6", subscriber: false, timestamp: "22:42:20" },
];

const TOP_CHATTERS = [
  { username: "xG0dSlayer", count: 1842, firstSeen: "2026-01-12", color: "#9b59b6" },
  { username: "ValorantPro44", count: 1654, firstSeen: "2026-02-03", color: "#e74c3c" },
  { username: "MATSUZAKA", count: 1421, firstSeen: "2025-12-20", color: "#1abc9c" },
  { username: "chillvibes_", count: 1198, firstSeen: "2026-03-14", color: "#2ecc71" },
  { username: "NotABot1234", count: 987, firstSeen: "2026-01-28", color: "#f39c12" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CalendarPicker({ selected, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); // May 2026

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Mock active days
  const activeDays = new Set([1, 5, 8, 12, 15, 17, 20, 22, 25, 28, 30]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronLeft size={14} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-[10px] text-center font-semibold text-muted-foreground py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const active = activeDays.has(day);
          const sel = selected === `${year}-${month + 1}-${day}`;
          return (
            <button
              key={day}
              disabled={!active}
              onClick={() => onSelect(`${year}-${month + 1}-${day}`)}
              className={`
                text-xs font-mono py-1.5 rounded transition-all duration-150 relative
                ${sel ? "bg-primary text-primary-foreground font-bold" : ""}
                ${active && !sel ? "text-foreground hover:bg-primary/15 hover:text-primary" : ""}
                ${!active ? "text-muted-foreground/30 cursor-default" : ""}
              `}
            >
              {day}
              {active && !sel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StreamRewind() {
  const [selectedDate, setSelectedDate] = useState("2026-5-1");
  const [search, setSearch] = useState("");

  const filtered = MOCK_MESSAGES.filter(m =>
    !search || m.message.toLowerCase().includes(search.toLowerCase()) || m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-5 p-5 h-full min-h-0">
      {/* Left: calendar + top chatters */}
      <div className="flex flex-col gap-4 w-[260px] shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Stream Rewind</span>
        </div>

        <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />

        {/* Top contributors */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border flex-1">
          <div className="flex items-center gap-2">
            <Crown size={13} className="text-[var(--chart-4)]" />
            <span className="text-xs font-semibold text-foreground">Top Contributors</span>
          </div>
          <div className="flex flex-col gap-2">
            {TOP_CHATTERS.map((c, i) => (
              <div key={c.username} className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold font-mono text-muted-foreground w-4">{i + 1}</span>
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center" style={{ background: `${c.color}20` }}>
                  <span className="text-[9px] font-bold" style={{ color: c.color }}>{c.username[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{c.username}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{c.count.toLocaleString()} msgs</p>
                </div>
                {i === 0 && <Crown size={10} className="text-[var(--chart-4)] shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: chat log */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Date header + search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25">
            <Calendar size={12} className="text-primary" />
            <span className="text-xs font-semibold text-primary font-mono">{selectedDate}</span>
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border focus-within:border-primary/40 transition-colors">
            <Search size={12} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages or usernames..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <MessageSquare size={11} />
            <span>{filtered.length} msgs</span>
          </div>
        </div>

        {/* Log */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-card border border-border">
          <div className="sticky top-0 flex items-center gap-4 px-4 py-2.5 bg-card border-b border-border">
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase w-16">Time</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase w-28">User</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">Message</span>
          </div>

          {filtered.map((msg, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-4 py-2.5 border-b border-border/50 hover:bg-muted/20 transition-colors group"
            >
              <span className="text-[11px] font-mono text-muted-foreground w-16 shrink-0 mt-0.5">{msg.timestamp}</span>
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                {msg.subscriber && (
                  <span className="text-[8px] text-primary bg-primary/10 border border-primary/20 px-1 py-0.5 rounded font-bold">SUB</span>
                )}
                <span className="text-xs font-bold truncate" style={{ color: msg.color }}>{msg.username}</span>
              </div>
              <span className="text-xs text-foreground/80 flex-1">{msg.message}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Search size={24} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No messages found</p>
            </div>
          )}
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing {filtered.length} messages from MongoDB</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors">← Prev</button>
            <span className="px-3 text-foreground font-semibold">1</span>
            <button className="px-2.5 py-1 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}