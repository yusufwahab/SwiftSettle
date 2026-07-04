import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({ title, breadcrumb, subtitle, rightRail, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-appbg text-text-1">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/25 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-accent-2/15 blur-[130px]"
      />

      <div className="relative z-10 lg:flex">
        <aside className="hidden w-[264px] shrink-0 border-r border-white/6 lg:block">
          <div className="fixed h-screen w-[264px]">
            <Sidebar />
          </div>
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="w-[264px] border-r border-white/6">
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
            <button
              type="button"
              aria-label="Close menu"
              className="flex-1 bg-black/60"
              onClick={() => setDrawerOpen(false)}
            />
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <TopBar
            title={title}
            breadcrumb={breadcrumb}
            subtitle={subtitle}
            onMenuClick={() => setDrawerOpen(true)}
          />
          <div className="flex gap-6">
            <div className="min-w-0 flex-1">{children}</div>
            {rightRail && (
              <div className="hidden w-[300px] shrink-0 flex-col gap-5 xl:flex">{rightRail}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
