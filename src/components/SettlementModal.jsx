import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Building2 } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { Checkbox, TextField } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { walletService } from "../services";
import { useAuth } from "../context/AuthContext";

export default function SettlementModal({ open, onClose, balance, onSettled }) {
  const { worker } = useAuth();
  const [amount, setAmount] = useState(balance ? String(balance) : "");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Dashboard keeps this modal mounted permanently (just toggling `open`),
  // and `balance` genuinely changes between opens (each transfer reduces
  // it) — so re-sync fresh on every open rather than only once at mount.
  // Deliberately not a `key`-based remount here: that would also unmount
  // the success screen the moment onSettled's balance reload lands mid-
  // display, since it changes the very `balance` prop this depends on.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setAmount(balance ? String(balance) : "");
      setConfirmed(false);
      setStatus("idle");
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const numericAmount = Number(amount) || 0;
  const exceedsBalance = numericAmount > balance;
  const canSubmit = confirmed && numericAmount > 0 && !exceedsBalance;

  const close = () => {
    onClose();
  };

  const handleSettle = async () => {
    setStatus("loading");
    try {
      const data = await walletService.settle(numericAmount);
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
          <h2 className="text-xl font-bold text-text-1">Transfer Successful</h2>
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
          <h2 className="text-xl font-bold text-text-1">Transfer Failed</h2>
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
          <p className="text-sm text-text-1">Sending your transfer…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Transfer to Your Bank</h2>

      <div className="mt-6 space-y-2 rounded-xl bg-white/5 p-4">
        <div className="flex justify-between">
          <span className="text-sm text-text-3">Available Balance</span>
          <span className="text-lg font-bold text-text-1">{formatNaira(balance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-text-3">Transfer Fee</span>
          <span className="text-sm text-text-3">Free</span>
        </div>
      </div>

      <TextField
        className="mt-6"
        label="Amount to transfer"
        type="number"
        inputMode="numeric"
        min={0}
        max={balance}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        help={exceedsBalance ? undefined : `Up to ${formatNaira(balance)} — the rest stays available`}
        error={exceedsBalance ? "Amount exceeds your available balance" : undefined}
      />

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-text-1">Transfer To</p>
        <label className="mb-2 flex items-start gap-3 rounded-xl border border-accent bg-accent/6 p-3">
          <input type="radio" name="bank" defaultChecked className="mt-1 accent-accent" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
            <Building2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-text-1">{worker?.bank?.name || "No bank on file"}</p>
            <p className="text-xs text-text-3">
              {worker?.bank?.accountNumberMasked} · {worker?.bank?.accountHolder}
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
        label="I confirm that the above details are correct and authorize this transfer"
      />

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleSettle} disabled={!canSubmit} className="flex-1">
          Transfer
        </Button>
      </div>
    </Modal>
  );
}
