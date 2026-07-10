import Modal from "./ui/dark/Modal";
import Badge from "./ui/dark/Badge";
import Button from "./ui/dark/Button";
import { formatNaira } from "../lib/format";

const badgeTone = { Completed: "success", Pending: "warning", Failed: "danger" };

export default function SettlementDetailModal({ settlement, onClose }) {
  if (!settlement) return null;

  return (
    <Modal open={Boolean(settlement)} onClose={onClose} width="440px">
      <h2 className="text-xl font-bold text-text-1">Settlement Details</h2>

      <div className="mt-6 space-y-3 rounded-xl bg-white/5 p-4 text-sm">
        <Row label="Reference" value={settlement.id} />
        <Row label="Amount" value={formatNaira(settlement.amount)} />
        <Row label="Date" value={`${settlement.date} · ${settlement.time}`} />
        <Row label="Status" value={<Badge tone={badgeTone[settlement.status]}>{settlement.status}</Badge>} />
        {settlement.bank && <Row label="Bank" value={settlement.bank} />}
        {settlement.account && <Row label="Account" value={settlement.account} />}
        {settlement.settledAt && <Row label="Settled" value={settlement.settledAt} />}
        {settlement.errorMessage && <Row label="Failure reason" value={settlement.errorMessage} danger />}
      </div>

      <Button onClick={onClose} className="mt-6 w-full">
        Close
      </Button>
    </Modal>
  );
}

function Row({ label, value, danger }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-0 last:pb-0">
      <span className="text-text-3">{label}</span>
      <span className={`text-right font-medium ${danger ? "text-danger-vivid" : "text-text-1"}`}>{value}</span>
    </div>
  );
}
