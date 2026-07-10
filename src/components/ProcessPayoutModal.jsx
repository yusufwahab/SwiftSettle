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

function defaultAmount(payoutRequest) {
  if (!payoutRequest) return "";
  const isTopUp = payoutRequest.status === "underpaid";
  const remaining = Number(payoutRequest.requested_total) - Number(payoutRequest.received_amount || 0);
  return String(isTopUp ? Math.max(remaining, 0) : payoutRequest.requested_total);
}

export default function ProcessPayoutModal({ open, onClose, payoutRequest, onProcessed }) {
  const [amount, setAmount] = useState(defaultAmount(payoutRequest));
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const isTopUp = payoutRequest?.status === "underpaid";

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setResult(null);
      setAmount(defaultAmount(payoutRequest));
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

      <h2 className="text-xl font-bold text-text-1">{isTopUp ? "Complete Underpaid Request" : "Process Payout"}</h2>
      <p className="mt-1 text-sm text-text-3">
        {payoutRequest.worker?.full_name} requested {formatNaira(payoutRequest.requested_total)} for{" "}
        {(payoutRequest.earnings || []).length} order{(payoutRequest.earnings || []).length === 1 ? "" : "s"}.
      </p>
      {isTopUp && (
        <p className="mt-2 rounded-lg bg-warning-vivid/12 px-3 py-2 text-xs text-warning-vivid">
          Already received {formatNaira(payoutRequest.received_amount)} — this payment adds to that total.
        </p>
      )}

      <TextField
        className="mt-6"
        label={isTopUp ? "Additional amount to pay" : "Amount to pay"}
        type="number"
        inputMode="numeric"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        help={
          isTopUp
            ? "Prefilled to the exact remaining balance — change it to deliberately leave this underpaid or overpay it"
            : "Can be paid in full, partially, or in excess of what was requested"
        }
      />

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleProcess} disabled={!Number(amount)} className="flex-1">
          {isTopUp ? "Pay Remaining" : "Process Payment"}
        </Button>
      </div>
    </Modal>
  );
}
