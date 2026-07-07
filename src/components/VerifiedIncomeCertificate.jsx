import { Award, Download } from "lucide-react";
import Card from "./ui/Card";
import Skeleton from "./ui/dark/Skeleton";
import { ErrorState, EmptyState } from "./ui/dark/States";
import { formatNaira } from "../lib/format";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function VerifiedIncomeCertificate({ state }) {
  if (state.status === "loading") {
    return (
      <Card>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-8 w-32" />
        <Skeleton className="mt-4 h-16" />
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card>
        <ErrorState message={state.error} onRetry={state.reload} className="py-4" />
      </Card>
    );
  }

  if (!state.data) {
    return (
      <Card>
        <p className="mb-1 text-sm font-bold text-text-1">Verified Income Certificate</p>
        <EmptyState
          title="Not issued yet"
          message="Available once your platform earnings are verified for 30 days."
          className="py-6"
        />
      </Card>
    );
  }

  const { certificate_id: certificateId, monthly_income: monthlyIncome, verification_date: verificationDate, expires_at: expiresAt, download_url: downloadUrl } = state.data;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-1">Verified Income Certificate</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/12 text-accent">
          <Award className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-text-1">{formatNaira(monthlyIncome)}</p>
      <p className="text-xs text-text-3">Verified monthly income</p>

      <div className="mt-4 space-y-1.5 rounded-xl bg-white/5 p-4 text-xs">
        <div className="flex justify-between">
          <span className="text-text-3">Certificate ID</span>
          <span className="text-text-1">{certificateId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-3">Verified on</span>
          <span className="text-text-1">{formatDate(verificationDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-3">Expires</span>
          <span className="text-text-1">{formatDate(expiresAt)}</span>
        </div>
      </div>

      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark"
        >
          <Download className="h-4 w-4" strokeWidth={1.75} /> Download certificate
        </a>
      ) : (
        <p className="mt-4 text-xs text-text-3">Downloadable PDF coming soon.</p>
      )}
    </Card>
  );
}
