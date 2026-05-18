import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const MAX_POINTS = 40;

function generatePoint() {
  return Math.floor(Math.random() * 80 + 10);
}

export default function HypeMeter() {
  const canvasRef = useRef(null);
  const [data, setData] = useState(() => Array(MAX_POINTS).fill(0));
  const [current, setCurrent] = useState(0);

  const msgCountRef = useRef(0);

  useEffect(() => {
    const handleNewMessage = () => {
      msgCountRef.current += 1;
    };

    socket.on("chat_message", handleNewMessage);

    return () => {
      socket.off("chat_message", handleNewMessage);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const msgsThisSecond = msgCountRef.current;
      msgCountRef.current = 0; 

      setData(prev => [...prev.slice(1), msgsThisSecond]);
      setCurrent(msgsThisSecond);
    }, 1000);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pad = { top: 12, bottom: 12, left: 4, right: 4 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    const pts = data.map((v, i) => ({
      x: pad.left + (i / (data.length - 1)) * w,
      y: pad.top + h - ((v - min) / range) * h,
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "oklch(0.65 0.22 290 / 0.4)");
    grad.addColorStop(1, "oklch(0.65 0.22 290 / 0)");

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cp = { x: (pts[i - 1].x + pts[i].x) / 2, y: (pts[i - 1].y + pts[i].y) / 2 };
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, cp.x, cp.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(pts[pts.length - 1].x, height - pad.bottom);
    ctx.lineTo(pts[0].x, height - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cp = { x: (pts[i - 1].x + pts[i].x) / 2, y: (pts[i - 1].y + pts[i].y) / 2 };
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, cp.x, cp.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = "oklch(0.65 0.22 290)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "oklch(0.65 0.22 290 / 0.8)";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // End dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "oklch(0.65 0.22 290)";
    ctx.shadowColor = "oklch(0.65 0.22 290)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [data]);

  const hypeLabel = current > 70 ? "INSANE" : current > 50 ? "HYPE" : current > 30 ? "ACTIVE" : "CHILL";
  const hypeColor = current > 70 ? "text-[var(--hype-high)]" : current > 50 ? "text-[var(--hype-mid)]" : current > 30 ? "text-primary" : "text-[var(--hype-low)]";

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Hype Meter</span>
          <span className="text-xs text-muted-foreground">msgs/sec</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold tracking-widest ${hypeColor}`}>{hypeLabel}</span>
          <span className="text-xl font-bold font-mono text-foreground">{current}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-[100px] rounded-lg"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* Scale markers */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
        <span>40s ago</span>
        <span>now</span>
      </div>
    </div>
  );
}