import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { TextField } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { creditService } from "../services";

export default function CreditRequestModal({ open, onClose, eligibility, onApproved }) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const availableCredit = eligibility?.available_credit || 0;
  const numericAmount = Number(amount) || 0;
  const interestAmount = numericAmount * ((eligibility?.interest_rate || 0) / 100);
  const dailyRepaymentPreview =
    numericAmount > 0
      ? Math.ceil((numericAmount + interestAmount) / (eligibility?.terms?.repayment_period_days || 25))
      : 0;

  const canSubmit = numericAmount > 0 && numericAmount <= availableCredit;

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setAmount("");
      setResult(null);
    }, 200);
  };

  const handleRequest = async () => {
    setStatus("loading");
    try {
      const data = await creditService.requestCredit(numericAmount);
      setResult(data);
      setStatus("success");
      onApproved?.();
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className="text-xl font-bold text-text-1">Credit Approved</h2>
          <p className="mt-4 text-sm text-text-2">
            {formatNaira(result.amount)} at {result.interest_rate}% has been sent to your bank account
          </p>
          <p className="mt-3 text-xs text-text-3">
            {formatNaira(result.daily_repayment)}/day auto-deducted from settlements for {result.repayment_period}{" "}
            days
          </p>
          <Button onClick={close} className="mt-8 w-full">
            Back to Dashboard
          </Button>
        </div>
      </Modal>
    );
  }

  if (status === "error") {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className="text-xl font-bold text-text-1">Credit Request Failed</h2>
          <p className="mt-4 text-sm text-text-2">Something went wrong. Please try again.</p>
          <p className="mt-2 text-xs text-text-3">{errorMessage}</p>
          <div className="mt-8 flex gap-3">
            <Button onClick={handleRequest} className="flex-1">
              Retry
            </Button>
            <Button as={Link} to="/app/support" variant="outline" onClick={close} className="flex-1">
              Contact Support
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-panel/95">
          <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.75} />
          <p className="text-sm text-text-1">Processing your credit request…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Request Credit</h2>
      <p className="mt-1 text-sm text-text-3">Available credit: {formatNaira(availableCredit)}</p>

      <TextField
        className="mt-6"
        label="Amount"
        type="number"
        inputMode="numeric"
        min={0}
        max={availableCredit}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        help={`Max ${formatNaira(availableCredit)}`}
        error={numericAmount > availableCredit ? "Amount exceeds available credit" : undefined}
      />

      {numericAmount > 0 && (
        <div className="mt-4 space-y-2 rounded-xl bg-white/5 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-3">Interest ({eligibility?.interest_rate}%)</span>
            <span className="text-text-1">{formatNaira(interestAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-white/8 pt-2">
            <span className="text-text-3">Daily repayment</span>
            <span className="font-bold text-text-1">{formatNaira(dailyRepaymentPreview)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-3">Repayment period</span>
            <span className="text-text-1">{eligibility?.terms?.repayment_period_days} days</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleRequest} disabled={!canSubmit} className="flex-1">
          Request Now
        </Button>
      </div>
    </Modal>
  );
}
