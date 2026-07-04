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
    <section className="relative z-10 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-text-1">The Problem is Real</h2>
        <p className="mt-3 text-base text-text-2">
          15 million Nigerian gig workers face the same barrier every day
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-panel p-8 text-left">
              <p className="text-4xl font-bold text-accent">{stat.number}</p>
              <p className="mt-3 text-sm font-medium text-text-1">{stat.label}</p>
              <p className="mt-2 text-sm text-text-3">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
