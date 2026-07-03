import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold text-primary">SwiftSettle</span>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="text-sm text-body hover:text-primary">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
