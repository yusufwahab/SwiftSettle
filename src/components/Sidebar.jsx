import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { path: '/earnings', label: 'Earnings', icon: '↗' },
  { path: '/settlements', label: 'Settlements', icon: '✓' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
  { path: '/support', label: 'Support', icon: '?' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col fixed top-0 left-0 h-screen z-10">
      <div className="p-5 border-b border-[#E5E7EB]">
        <span className="text-[20px] font-bold text-[#2563EB]">SwiftSettle</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 text-[14px] cursor-pointer border-l-[3px] transition-colors ${
                active
                  ? 'text-[#2563EB] bg-[#DBEAFE] border-[#2563EB]'
                  : 'text-[#6B7280] bg-transparent border-transparent hover:bg-[#F3F4F6]'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#D1D5DB] flex-shrink-0" />
          <div>
            <p className="text-[12px] font-medium text-[#1F2937]">Chioma A.</p>
            <p className="text-[12px] text-[#6B7280]">+234 801 234 5678</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#F3F4F6] text-[#6B7280] text-[14px] py-3 rounded cursor-pointer hover:bg-[#E5E7EB] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
