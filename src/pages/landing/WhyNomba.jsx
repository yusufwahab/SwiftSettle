const nombaPoints = [
  "Virtual Accounts track earnings per worker",
  "Transfers API settles money same-day",
  "Webhooks automate the entire flow",
  "No custom payment infrastructure needed",
];

const swiftsettlePoints = [
  "Frictionless worker onboarding",
  "Real-time earnings visibility",
  "Automatic reconciliation",
  "Platform admin dashboard",
];

export default function WhyNomba() {
  return (
    <section className="bg-surface-alt px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-ink">Built on Nomba</h2>
          <p className="mt-1 text-sm font-medium text-primary">Infrastructure that scales</p>
          <p className="mt-4 text-base leading-relaxed text-body">
            SwiftSettle uses Nomba's Virtual Accounts, Transfers API, and Webhooks to power
            instant settlements. Nomba's infrastructure is proven, secure, and built for African
            fintech.
          </p>
          <ul className="mt-6 space-y-3">
            {nombaPoints.map((point) => (
              <li key={point} className="text-sm text-body">
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ink">The Platform Layer</h2>
          <p className="mt-1 text-sm font-medium text-primary">We do the hard work</p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Nomba handles payments. SwiftSettle handles the user experience, reconciliation,
            worker management, and platform integration.
          </p>
          <ul className="mt-6 space-y-3">
            {swiftsettlePoints.map((point) => (
              <li key={point} className="text-sm text-body">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
