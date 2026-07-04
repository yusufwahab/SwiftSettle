import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold text-text-1">SwiftSettle</span>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="text-sm text-text-2 hover:text-text-1">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
