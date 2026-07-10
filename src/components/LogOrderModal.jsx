import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { TextField } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { earningsService } from "../services";

// Realistic order-size presets rather than one arbitrary random amount —
// each is a real value passed straight through to earningsService.log(),
// same as typing a custom one. Not a platform picker: a worker only has one
// registered platform (set at onboarding), so that's shown as context, not
// as another choice to make per order.
const PRESETS = [
  { label: "Short trip", amount: 850 },
  { label: "Standard delivery", amount: 1400 },
  { label: "Long distance", amount: 2100 },
  { label: "Premium order", amount: 2800 },
];

export default function LogOrderModal({ open, onClose, platform, onLogged }) {
  const [selected, setSelected] = useState(null); // index into PRESETS, or "custom"
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const amount = selected === "custom" ? Number(customAmount) || 0 : selected != null ? PRESETS[selected].amount : 0;

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setSelected(null);
      setCustomAmount("");
    }, 200);
  };

  const handleSubmit = async () => {
    setStatus("loading");
    try {
      await earningsService.log({ amount });
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-2/12 text-accent-2">
            <Check className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-text-1">Order Logged</h2>
          <p className="mt-3 text-sm text-text-2">
            {formatNaira(amount)} added to Today's Activity as a completed order awaiting payout.
          </p>
          <Button
            onClick={() => {
              close();
              onLogged?.();
            }}
            className="mt-8 w-full"
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  if (status === "error") {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className="text-xl font-bold text-text-1">Couldn't Log Order</h2>
          <p className="mt-4 text-sm text-text-2">{errorMessage}</p>
          <Button onClick={() => setStatus("idle")} className="mt-8 w-full">
            Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} width="520px">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-panel/95">
          <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.75} />
          <p className="text-sm text-text-1">Logging your order…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Log a Completed Order</h2>
      <p className="mt-1 text-sm text-text-3">
        Record a delivery or trip you've completed{platform ? ` on ${platform}` : ""}. It'll appear in Today's
        Activity, ready to bundle into a payout request.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {PRESETS.map((preset, index) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setSelected(index)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selected === index ? "border-accent bg-accent/8" : "border-white/8 bg-white/5 hover:border-white/20"
            }`}
          >
            <p className="text-xs text-text-3">{preset.label}</p>
            <p className="mt-1 text-lg font-bold text-text-1">{formatNaira(preset.amount)}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSelected("custom")}
        className={`mt-3 w-full rounded-xl border p-4 text-left transition-colors ${
          selected === "custom" ? "border-accent bg-accent/8" : "border-white/8 bg-white/5 hover:border-white/20"
        }`}
      >
        <p className="text-xs text-text-3">Custom amount</p>
        <p className="mt-1 text-sm font-medium text-text-1">Enter the exact amount for this order</p>
      </button>

      {selected === "custom" && (
        <TextField
          className="mt-3"
          type="number"
          inputMode="numeric"
          min={0}
          autoFocus
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="0"
        />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={!amount} className="flex-1">
          Log Order
        </Button>
      </div>
    </Modal>
  );
}
