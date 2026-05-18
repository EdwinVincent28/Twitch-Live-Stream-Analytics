import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function LiveFeed() {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("chat_message", (incomingMsg) => {
      const formattedMsg = {
        id: Date.now() + Math.random(), 
        username: incomingMsg.username,
        message: incomingMsg.message,
        color: incomingMsg.tags?.color || "#ffffff",
        subscriber: incomingMsg.tags?.subscriber || false,
        timestamp: new Date(incomingMsg.timestamp).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit" 
        }),
      };

      setMessages(prev => [...prev.slice(-49), formattedMsg]);
    });

    // 5. Cleanup the listener when the component unmounts
    return () => {
      socket.off("chat_message");
    };
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