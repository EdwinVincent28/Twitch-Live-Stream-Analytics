import { useState, useEffect } from "react";
import { Calendar, Search, ChevronLeft, ChevronRight, Crown, Flame, MessageSquare, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CalendarPicker({ selected, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); 

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeDays = new Set([1, 5, 8, 12, 15, 17, 18, 19, 20, 22, 25, 28, 30]);

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
  const today = new Date();
  const initialDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [search, setSearch] = useState("");
  
  const [messages, setMessages] = useState([]);
  const [topChatters, setTopChatters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/history?date=${selectedDate}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        
        const formattedMsgs = data.map(msg => ({
          username: msg.username,
          message: msg.message,
          color: msg.tags?.color || "#ffffff",
          subscriber: msg.tags?.subscriber || false,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));

        setMessages(formattedMsgs);

        const counts = {};
        data.forEach(m => {
          if (!counts[m.username]) {
            counts[m.username] = { count: 0, color: m.tags?.color || "#ffffff" };
          }
          counts[m.username].count += 1;
        });

        const sortedChatters = Object.entries(counts)
          .map(([username, info]) => ({ username, count: info.count, color: info.color }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); 

        setTopChatters(sortedChatters);

      } catch (err) {
        console.error("Failed to fetch history:", err);
        setMessages([]);
        setTopChatters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedDate]);

  const filtered = messages.filter(m =>
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
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="text-muted-foreground animate-spin" />
              </div>
            ) : topChatters.length > 0 ? (
              topChatters.map((c, i) => (
                <div key={c.username} className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center" style={{ background: `${c.color}20` }}>
                    <span className="text-[9px] font-bold" style={{ color: c.color }}>{c.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{c.username}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.count.toLocaleString()} msgs</p>
                  </div>
                  {i === 0 && <Crown size={10} className="text-[var(--chart-4)] shrink-0" />}
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground pt-2 text-center">No chatters found.</span>
            )}
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
            {loading ? <Loader2 size={11} className="animate-spin" /> : <MessageSquare size={11} />}
            <span>{filtered.length} msgs</span>
          </div>
        </div>

        {/* Log */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-card border border-border">
          <div className="sticky top-0 flex items-center gap-4 px-4 py-2.5 bg-card border-b border-border z-10">
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase w-16">Time</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase w-28">User</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">Message</span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-16 gap-3">
               <Loader2 size={24} className="text-primary animate-spin" />
               <p className="text-sm text-muted-foreground">Pulling archive from MongoDB...</p>
             </div>
          ) : filtered.map((msg, i) => (
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

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Search size={24} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {search ? "No matching messages found." : "No messages recorded for this date."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing {filtered.length} messages from MongoDB</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50" disabled>← Prev</button>
            <span className="px-3 text-foreground font-semibold">1</span>
            <button className="px-2.5 py-1 rounded border border-border hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50" disabled>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}