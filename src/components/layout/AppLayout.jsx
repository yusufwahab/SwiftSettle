import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({ title, subtitle, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-[280px] shrink-0 border-r border-border lg:block">
        <div className="fixed h-screen w-[280px]">
          <Sidebar />
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-[280px] border-r border-border">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}

      <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 sm:py-10">
        <TopBar title={title} subtitle={subtitle} onMenuClick={() => setDrawerOpen(true)} />
        {children}
      </main>
    </div>
  );
}
