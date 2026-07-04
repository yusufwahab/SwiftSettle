import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Building2 } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { Checkbox } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { walletService } from "../services";
import { currentWorker } from "../data/mockData";

export default function SettlementModal({ open, onClose, balance, onSettled }) {
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setConfirmed(false);
      setResult(null);
    }, 200);
  };

  const handleSettle = async () => {
    setStatus("loading");
    try {
      const data = await walletService.settle();
      setResult(data);
      setStatus("success");
      onSettled?.();
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <h2 className="text-xl font-bold text-text-1">Settlement Successful</h2>
          <p className="mt-4 text-sm text-text-2">
            {formatNaira(result.amount)} has been sent to your {result.bank} account
          </p>
          <p className="mt-3 text-xs text-text-3">Reference: {result.reference}</p>
          <p className="mt-1 text-xs text-text-3">You'll see it in your bank within minutes</p>
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
          <h2 className="text-xl font-bold text-text-1">Settlement Failed</h2>
          <p className="mt-4 text-sm text-text-2">Something went wrong. Please try again.</p>
          <p className="mt-2 text-xs text-text-3">{errorMessage}</p>
          <div className="mt-8 flex gap-3">
            <Button onClick={handleSettle} className="flex-1">
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
          <p className="text-sm text-text-1">Processing your settlement…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Settle Your Earnings</h2>

      <div className="mt-6 space-y-2 rounded-xl bg-white/5 p-4">
        <div className="flex justify-between">
          <span className="text-sm text-text-3">Available Balance</span>
          <span className="text-2xl font-bold text-accent">{formatNaira(balance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-3">Settlement Fee</span>
          <span className="text-sm text-text-3">Free</span>
        </div>
        <div className="flex justify-between border-t border-white/8 pt-2">
          <span className="text-sm text-text-3">You'll Receive</span>
          <span className="text-2xl font-bold text-text-1">{formatNaira(balance)}</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-text-1">Settlement Method</p>
        <label className="mb-2 flex items-start gap-3 rounded-xl border border-accent bg-accent/6 p-3">
          <input type="radio" name="bank" defaultChecked className="mt-1 accent-accent" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
            <Building2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-text-1">{currentWorker.bank.name}</p>
            <p className="text-xs text-text-3">
              {currentWorker.bank.accountNumberMasked} · {currentWorker.bank.accountHolder}
            </p>
          </div>
        </label>
        <button type="button" className="text-sm text-accent hover:text-accent-dark">
          + Add New Account
        </button>
      </div>

      <Checkbox
        className="mt-6"
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
        label="I confirm that the above details are correct and authorize this settlement"
      />

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleSettle} disabled={!confirmed} className="flex-1">
          Settle Now
        </Button>
      </div>
    </Modal>
  );
}
