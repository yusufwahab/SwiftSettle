import { useEffect, useState } from "react";
import { Loader2, Check, Home, GraduationCap, Dumbbell, MoreHorizontal } from "lucide-react";
import Modal from "./ui/dark/Modal";
import Button from "./ui/dark/Button";
import { TextField, SelectField } from "./ui/dark/Field";
import { formatNaira } from "../lib/format";
import { billPaymentsService, banksService } from "../services";
import { useAsync } from "../hooks/useAsync";

const CATEGORIES = [
  { value: "rent", label: "Rent", icon: Home },
  { value: "school_fees", label: "School Fees", icon: GraduationCap },
  { value: "gym", label: "Gym", icon: Dumbbell },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function BillPaymentModal({ open, onClose, balance, onPaid }) {
  const banksState = useAsync(() => banksService.list(), []);

  const [category, setCategory] = useState(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [recipient, setRecipient] = useState(null); // { account_number, account_name }

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // This modal is always mounted by Dashboard (just toggling `open`) — reset
  // fresh every time it's opened, same reasoning as SettlementModal.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setCategory(null);
      setBankCode("");
      setAccountNumber("");
      setAmount("");
      setVerifyError("");
      setRecipient(null);
      setStatus("idle");
      setResult(null);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const numericAmount = Number(amount) || 0;
  const exceedsBalance = numericAmount > balance;
  const canSend = category && recipient && numericAmount > 0 && !exceedsBalance;

  const close = () => onClose();

  // Recipient must be re-verified any time the bank or account number
  // changes — a previously verified name for a different account number
  // must never carry over to a new one.
  const handleAccountNumberChange = (value) => {
    setAccountNumber(value);
    setRecipient(null);
  };
  const handleBankChange = (value) => {
    setBankCode(value);
    setRecipient(null);
  };

  const handleVerify = async () => {
    setVerifyError("");
    setVerifying(true);
    try {
      const data = await billPaymentsService.verifyRecipient(accountNumber, bankCode);
      setRecipient(data);
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSend = async () => {
    setStatus("loading");
    try {
      const bank = (banksState.data || []).find((b) => b.code === bankCode);
      const data = await billPaymentsService.create({
        category,
        accountNumber: recipient.account_number,
        bankCode,
        bankName: bank?.name,
        accountName: recipient.account_name,
        amount: numericAmount,
      });
      setResult({ ...data, amount: numericAmount, accountName: recipient.account_name });
      setStatus("success");
      onPaid?.();
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    return (
      <Modal open={open} onClose={close}>
        <div className="py-2 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-2/12 text-accent-2">
            <Check className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-text-1">Payment Sent</h2>
          <p className="mt-3 text-sm text-text-2">
            {formatNaira(result.amount)} sent to {result.accountName}
          </p>
          <p className="mt-1 text-xs text-text-3">Reference: {result.reference}</p>
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
          <h2 className="text-xl font-bold text-text-1">Payment Failed</h2>
          <p className="mt-4 text-sm text-text-2">{errorMessage}</p>
          <Button onClick={() => setStatus("idle")} className="mt-8 w-full">
            Try Again
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} width="480px">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-panel/95">
          <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.75} />
          <p className="text-sm text-text-1">Sending your payment…</p>
        </div>
      )}

      <h2 className="text-xl font-bold text-text-1">Pay a Bill</h2>
      <p className="mt-1 text-sm text-text-3">
        Send part of your balance straight to a bill — paying the same recipient regularly builds your financial
        identity score.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-colors ${
              category === c.value ? "border-accent bg-accent/8" : "border-white/8 bg-white/5 hover:border-white/20"
            }`}
          >
            <c.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <span className="text-sm font-medium text-text-1">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <SelectField
          className="flex-1"
          label="Bank"
          value={bankCode}
          onChange={(e) => handleBankChange(e.target.value)}
        >
          <option value="">Select bank</option>
          {(banksState.data || []).map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <TextField
          className="flex-1"
          label="Account Number"
          value={accountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="0123456789"
          inputMode="numeric"
        />
        <Button
          variant="outline"
          onClick={handleVerify}
          disabled={verifying || accountNumber.length !== 10 || !bankCode}
          className="mb-0 shrink-0 px-4 py-3"
        >
          {verifying ? "Checking…" : "Verify"}
        </Button>
      </div>
      {verifyError && <p className="mt-1.5 text-xs text-danger-vivid">{verifyError}</p>}
      {recipient && (
        <p className="mt-2 rounded-lg bg-accent-2/10 px-3 py-2 text-sm font-medium text-accent-2">
          Paying: {recipient.account_name}
        </p>
      )}

      <TextField
        className="mt-4"
        label="Amount"
        type="number"
        inputMode="numeric"
        min={0}
        max={balance}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        help={exceedsBalance ? undefined : `Available balance: ${formatNaira(balance)}`}
        error={exceedsBalance ? "Amount exceeds your available balance" : undefined}
      />

      <div className="mt-6 flex gap-3">
        <Button variant="subtle" onClick={close} className="flex-1">
          Cancel
        </Button>
        <Button variant="success" onClick={handleSend} disabled={!canSend} className="flex-1">
          Send Payment
        </Button>
      </div>
    </Modal>
  );
}
