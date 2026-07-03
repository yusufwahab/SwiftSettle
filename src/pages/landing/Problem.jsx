const stats = [
  {
    number: "3-7 DAYS",
    label: "Average payment delay",
    description: "Workers wait a week to access earnings they need today",
  },
  {
    number: "20-30%",
    label: "Interest on emergency loans",
    description: "Forced to borrow at predatory rates just to survive the wait",
  },
  {
    number: "40%",
    label: "Platform attrition rate",
    description: "Workers switch platforms chasing faster payouts",
  },
];

export default function Problem() {
  return (
    <section className="px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-ink">The Problem is Real</h2>
        <p className="mt-3 text-base text-muted">
          15 million Nigerian gig workers face the same barrier every day
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-alt p-8 text-left shadow-[0_4px_6px_rgba(0,0,0,0.07)]"
            >
              <p className="text-4xl font-bold text-primary">{stat.number}</p>
              <p className="mt-3 text-sm font-medium text-ink">{stat.label}</p>
              <p className="mt-2 text-sm text-muted">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
