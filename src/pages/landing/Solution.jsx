import Photo from "../../components/Photo";

const columns = [
  {
    slot: "solutionDashboard",
    title: "Real-Time Earnings",
    description: "See your balance update live as orders complete. No refresh. No delay. Just instant visibility.",
  },
  {
    slot: "solutionPayment",
    title: "Instant Settlement",
    description: "Hit “Cash Out Now” and your money transfers to your bank within minutes. Same day. Every time.",
  },
  {
    slot: "solutionTeam",
    title: "Platform Loyalty",
    description: "Workers stop chasing other platforms. Platforms reduce attrition by 30%. Everyone wins.",
  },
];

export default function Solution() {
  return (
    <section id="solution" className="relative z-10 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold text-text-1">Introducing SwiftSettle</h2>
        <p className="mt-3 text-base text-text-2">Instant settlement. Built on Nomba. For everyone.</p>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title} className="overflow-hidden rounded-2xl bg-panel">
              <Photo slot={col.slot} className="h-[200px]" />
              <div className="p-5">
                <h3 className="text-base font-semibold text-text-1">{col.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-3">{col.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
