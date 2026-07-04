import { useEffect, useState } from "react";
import { Home, ChevronRight, Bell, RefreshCw, Menu } from "lucide-react";

function format(date) {
  const datePart = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

export default function TopBar({ title, breadcrumb, subtitle, onMenuClick }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-text-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="mr-2 rounded-lg bg-white/5 p-1.5 text-text-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>App</span>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="text-text-2">{breadcrumb || title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-text-3 sm:inline">{format(now)}</span>
          <IconButton icon={RefreshCw} label="Refresh" />
          <IconButton icon={Bell} label="Notifications" dot />
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-1">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-3">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label, dot = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative rounded-lg bg-white/5 p-2 text-text-2 hover:bg-white/10 hover:text-text-1"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {dot && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-2" />}
    </button>
  );
}
