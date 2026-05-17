import { LayoutDashboard, MessageSquareText, History, Radio, Zap } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chatbot", label: "Vibe Search", icon: MessageSquareText },
  { id: "rewind", label: "Stream Rewind", icon: History },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="relative flex flex-col w-[220px] shrink-0 bg-sidebar border-r border-sidebar-border overflow-hidden">
      {/* Subtle gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/30">
          <Zap size={16} className="text-primary" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary live-dot" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">VibeCheck</p>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Analytics</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase px-2 mb-1 mt-1">
          Navigation
        </p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                transition-all duration-150 text-left w-full group
                ${active
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
              <Icon size={16} className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent">
          <div className="relative">
            <Radio size={13} className="text-[var(--live-red)]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--live-red)] live-dot" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">LIVE</p>
            <p className="text-[10px] text-muted-foreground">#jynxzi</p>
          </div>
        </div>
      </div>
    </aside>
  );
}