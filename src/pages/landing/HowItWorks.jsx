import Photo from "../../components/Photo";

const steps = [
  {
    number: "01",
    slot: "step1",
    heading: "Worker logs in",
    description: "Simple mobile or web login. One-time setup of your bank account.",
  },
  {
    number: "02",
    slot: "step2",
    heading: "Earnings accumulate in real-time",
    description: "As you complete deliveries, your balance updates instantly. No waiting for end-of-day reconciliation.",
  },
  {
    number: "03",
    slot: "step3",
    heading: "Tap “Cash Out Now”",
    description: "One button. Any time. Your money settles to your bank account within minutes.",
  },
  {
    number: "04",
    slot: "step4",
    heading: "Confirmation & receipt",
    description: "Push notification and SMS confirmation. Your money is there. You're done.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative z-10 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-text-1">How SwiftSettle Works</h2>

        <div className="mt-16 space-y-16">
          {steps.map((step, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={step.number}
                className={`grid items-center gap-10 lg:grid-cols-2 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <span className="text-5xl font-bold text-white/10">{step.number}</span>
                  <h3 className="mt-4 text-xl font-bold text-text-1">{step.heading}</h3>
                  <p className="mt-3 text-base text-text-2">{step.description}</p>
                </div>
                <Photo slot={step.slot} className="h-[280px] rounded-2xl" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
