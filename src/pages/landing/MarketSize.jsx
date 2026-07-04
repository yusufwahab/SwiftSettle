const metrics = [
  { number: "15M+", description: "Gig workers in Nigeria waiting for real-time settlement", subtext: "And growing 25% annually" },
  { number: "₦500B+", description: "Annual economic impact of payment delays", subtext: "Estimated cost to Nigeria's gig economy" },
  { number: "30%", description: "Estimated reduction in platform attrition", subtext: "When workers get paid same-day" },
];

export default function MarketSize() {
  return (
    <section className="relative z-10 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-text-1">The Opportunity</h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.number}>
              <p className="text-5xl font-bold text-accent">{metric.number}</p>
              <p className="mt-3 text-base text-text-1">{metric.description}</p>
              <p className="mt-2 text-sm text-text-3">{metric.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
