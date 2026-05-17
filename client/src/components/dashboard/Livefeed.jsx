import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";

const SAMPLE_MSGS = [
  { username: "xG0dSlayer", message: "W W W W PogChamp", color: "#9b59b6", subscriber: true },
  { username: "lowkeyfan99", message: "chat is so dead lol", color: "#3498db", subscriber: false },
  { username: "ValorantPro44", message: "KEKW KEKW he's cooked", color: "#e74c3c", subscriber: true },
  { username: "chillvibes_", message: "this is actually insane bro", color: "#2ecc71", subscriber: false },
  { username: "NotABot1234", message: "BAND BAND BAND", color: "#f39c12", subscriber: true },
  { username: "MATSUZAKA", message: "o7 o7 respect the goat", color: "#1abc9c", subscriber: false },
  { username: "Reaper0096", message: "W only W players here", color: "#e74c3c", subscriber: true },
  { username: "streamsnipr", message: "Copium Copium Copium", color: "#9b59b6", subscriber: false },
  { username: "FloBuerste", message: "bro what is this gameplay LULW", color: "#3498db", subscriber: true },
  { username: "ToasteyAF", message: "ACE ACE ACE PogChamp", color: "#f39c12", subscriber: false },
];

let msgIndex = 0;

export default function LiveFeed() {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      const msg = {
        ...SAMPLE_MSGS[msgIndex % SAMPLE_MSGS.length],
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      msgIndex++;
      setMessages(prev => [...prev.slice(-49), msg]);
    }, 400 + Math.random() * 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Live Chat Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--live-red)] live-dot" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-0 max-h-[280px] pr-1">
        {messages.map(msg => (
          <div key={msg.id} className="msg-enter flex items-start gap-2 py-1 px-2 rounded hover:bg-muted/30 transition-colors group">
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {msg.timestamp}
            </span>
            {msg.subscriber && (
              <span className="shrink-0 mt-0.5 w-3 h-3 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-[7px] text-primary font-bold">★</span>
              </span>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold mr-1.5" style={{ color: msg.color }}>
                {msg.username}
              </span>
              <span className="text-xs text-foreground/80 break-words">{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}