import { Link } from "react-router-dom";

export default function FinalCta() {
  return (
    <section className="bg-ink px-6 py-20 text-center text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold">Ready to stop waiting?</h2>
        <p className="mt-3 text-base text-white/70">Join the settlement revolution</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            to="/signup"
            className="w-full rounded border border-white px-8 py-3.5 text-sm font-medium text-white hover:bg-white hover:text-ink sm:w-auto"
          >
            Start as a Worker
          </Link>
          <a
            href="mailto:partners@swiftsettle.app"
            className="w-full rounded border border-white px-8 py-3.5 text-sm font-medium text-white hover:bg-white hover:text-ink sm:w-auto"
          >
            Integrate for Your Platform
          </a>
        </div>
      </div>
    </section>
  );
}
