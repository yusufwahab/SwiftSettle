import { Smartphone, Landmark, Link2, Clock3, TrendingUp } from "lucide-react";
import Card from "./ui/Card";

const steps = [
  { icon: Smartphone, title: "Verify your identity", detail: "Phone and bank verification lay the foundation of your score." },
  { icon: Link2, title: "Connect your platform", detail: "Linking Uber, Bolt, Jumia Food or another platform verifies your real income." },
  { icon: Clock3, title: "Settle consistently", detail: "Settling earnings regularly builds your reliability and consistency score." },
  { icon: TrendingUp, title: "Grow your score", detail: "After 30 days, your score, certificate, and credit access unlock automatically — no paperwork." },
  { icon: Landmark, title: "Access credit", detail: "Once your score crosses 600, request a micro-loan and get auto-approved instantly." },
];

export default function CreditGuide() {
  return (
    <Card>
      <p className="text-sm font-bold text-text-1">How credit-building works</p>
      <p className="mt-1 text-xs text-text-3">Your everyday earnings become your financial identity.</p>

      <div className="mt-5 flex flex-col gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
              <s.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-text-1">
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-xs text-text-3">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
