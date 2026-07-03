import { useEffect, useState } from "react";

function format(date) {
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart} | ${timePart}`;
}

export default function TopBar({ title, subtitle, onMenuClick }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 block rounded border border-border-strong px-2.5 py-1.5 text-sm text-ink lg:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink lg:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      <p className="hidden shrink-0 pt-1 text-sm text-muted sm:block">{format(now)}</p>
    </div>
  );
}
