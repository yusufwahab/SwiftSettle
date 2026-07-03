import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/earnings", label: "Earnings" },
  { to: "/app/settlements", label: "Settlements" },
  { to: "/app/settings", label: "Settings" },
  { to: "/app/support", label: "Support" },
];

export default function Sidebar({ onNavigate }) {
  const { worker, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-5 py-5">
        <span className="text-lg font-bold text-primary">SwiftSettle</span>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block border-l-2 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted hover:bg-surface-alt hover:text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-full bg-surface-alt" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{worker?.shortName}</p>
            <p className="truncate text-xs text-muted">{worker?.phone}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded bg-surface-alt py-3 text-sm text-muted hover:bg-border"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
