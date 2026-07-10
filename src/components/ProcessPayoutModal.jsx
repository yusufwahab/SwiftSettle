import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { TextField } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { payoutsService } from "../services";

const STATUS_COPY = {
  matched: { title: "Payout Matched", tone: "text-accent-2" },
  underpaid: { title: "Payout Underpaid", tone: "text-warning-vivid" },
  overpaid: { title: "Payout Overpaid", tone: "text-warning-vivid" },
};

export default function ProcessPayoutModal({ open, onClose, payoutRequest, onProcessed }) {
  const [amount, setAmount] = useState(payoutRequest?.requested_total ? String(payoutRequest.requested_total) : "");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setResult(null);
      setAmount(payoutRequest?.requested_total ? String(payoutRequest.requested_total) : "");
    }, 200);
  };

  const handleProcess = async () => {
    setStatus("loading");
    try {
      const data = await payoutsService.process(payoutRequest.id, Number(amount));
      setResult(data.payout_request);
      setStatus("success");
      onProcessed?.();
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    const copy = STATUS_COPY[result.status] || STATUS_COPY.matched;
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className={`text-xl font-bold ${copy.tone}`}>{copy.title}</h2>
          <p className="mt-4 text-sm text-text-2">
            Paid {formatNaira(result.received_amount)} of {formatNaira(result.requested_total)} requested.
          </p>
          <p className="mt-3 text-xs text-text-3">
            Worker notified in-app and by email. Reconciled via a real signed Nomba webhook call.
          </p>
          <Button onClick={close} className="mt-8 w-full">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  if (status === "error") {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className="text-xl font-bold text-text-1">Processing Failed</h2>
          <p className="mt-4 text-sm text-text-2">{errorMessage}</p>
          <Button onClick={close} className="mt-8 w-full">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  if (!payoutRequest) return null;

  return (
    <Modal open={open} onClose={close}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-panel/95">
          <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.75} />
          <p className="text-sm text-text-1">Sending payment via Nomba webhook…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Process Payout</h2>
      <p className="mt-1 text-sm text-text-3">
        {payoutRequest.worker?.full_name} requested {formatNaira(payoutRequest.requested_total)} for{" "}
        {(payoutRequest.earnings || []).length} order{(payoutRequest.earnings || []).length === 1 ? "" : "s"}.
      </p>

      <TextField
        className="mt-6"
        label="Amount to pay"
        type="number"
        inputMode="numeric"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        help="Can be paid in full, partially, or in excess of what was requested"
      />

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleProcess} disabled={!Number(amount)} className="flex-1">
          Process Payment
        </Button>
      </div>
    </Modal>
  );
}
