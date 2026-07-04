import { Link } from "react-router-dom";
import Photo from "../../components/Photo";

export default function Hero() {
  return (
    <section className="relative z-10 grid items-stretch lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
        <h1 className="max-w-xl text-4xl font-bold leading-tight text-text-1 lg:text-5xl">
          Real-Time Earnings for Every Gig Worker
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-text-2">
          Stop waiting days for your money. Get paid instantly. SwiftSettle powers the settlement
          layer for Nigeria's gig economy.
        </p>
        <div className="mt-8">
          <Link
            to="/signup"
            className="inline-flex rounded-xl bg-accent px-8 py-4 text-sm font-medium text-white hover:bg-accent-dark"
          >
            Start Settling Now
          </Link>
        </div>
        <p className="mt-4 text-sm text-text-3">Join 10,000+ workers earning on their terms</p>
      </div>
      <Photo slot="heroRight" className="min-h-[320px] lg:min-h-0" />
    </section>
  );
}
