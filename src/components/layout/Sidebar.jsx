import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, CheckCircle2, Settings as SettingsIcon, HelpCircle,
  Search, ChevronDown, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Photo from "../Photo";

const menuItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/earnings", label: "Earnings", icon: TrendingUp },
  { to: "/app/settlements", label: "Settlements", icon: CheckCircle2 },
];

const accountItems = [
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
  { to: "/app/support", label: "Support", icon: HelpCircle },
];

function NavGroup({ label, items, onNavigate }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-3">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-white font-medium"
                  : "text-text-2 hover:bg-white/5 hover:text-text-1"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const { worker, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="flex items-center gap-3 px-5 py-5">
        <Photo slot="workerAvatar" width={80} className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-1">{worker?.shortName}</p>
          <p className="truncate text-xs text-text-3">SwiftSettle</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-text-3" strokeWidth={1.75} />
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
          <Search className="h-4 w-4 text-text-3" strokeWidth={1.75} />
          <span className="flex-1 text-sm text-text-3">Search</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-text-3">⌘K</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <NavGroup label="Menu" items={menuItems} onNavigate={onNavigate} />
        <NavGroup label="Account" items={accountItems} onNavigate={onNavigate} />
      </nav>

      <div className="p-3">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-2 hover:bg-white/5 hover:text-text-1"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
