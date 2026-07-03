import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/States";
import { formatNaira } from "../lib/format";
import { settlementsService } from "../services";
import { useAsync } from "../hooks/useAsync";

const statusOptions = ["All", "Completed", "Pending", "Failed"];
const badgeTone = { Completed: "success", Pending: "warning", Failed: "danger" };

export default function SettlementsPage() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const rowsState = useAsync(() => settlementsService.list({ status, search }), [status, search]);
  const summaryState = useAsync(() => settlementsService.getSummary(), []);

  return (
    <AppLayout title="Settlements" subtitle="View all your past and pending payouts">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-muted">Date Range</label>
          <input
            type="text"
            defaultValue="Last 30 days"
            readOnly
            className="rounded border border-border-strong bg-white px-3 py-2.5 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-border-strong bg-white px-3 py-2.5 text-sm text-ink"
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="min-w-55 flex-1">
          <label className="mb-1 block text-xs text-muted">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or amount"
            className="w-full rounded border border-border-strong bg-white px-3 py-2.5 text-sm text-ink"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("All");
            setSearch("");
          }}
          className="pb-2.5 text-sm text-primary hover:text-primary-dark"
        >
          Reset Filters
        </button>
      </div>

      <Card padded={false} className="mb-6 overflow-x-auto">
        {rowsState.status === "loading" && (
          <div className="space-y-3 p-6">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        )}
        {rowsState.status === "error" && (
          <ErrorState message={rowsState.error} onRetry={rowsState.reload} />
        )}
        {rowsState.status === "success" && rowsState.data.length === 0 && (
          <EmptyState title="No settlements match your filters" message="Try adjusting the date range, status, or search term." />
        )}
        {rowsState.status === "success" && rowsState.data.length > 0 && (
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="bg-surface-alt text-left font-bold text-ink">
                {["Date", "Time", "Amount", "Reference", "Status", "Receipt"].map((h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowsState.data.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-border ${index % 2 === 1 ? "bg-surface" : "bg-white"}`}
                >
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3 text-muted">{row.time}</td>
                  <td className="px-4 py-3 font-medium text-ink">{formatNaira(row.amount)}</td>
                  <td className="px-4 py-3 text-muted">{row.id}</td>
                  <td className="px-4 py-3">
                    <Badge tone={badgeTone[row.status]}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-primary hover:text-primary-dark">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Total Settled (30 days)</p>
          {summaryState.status === "loading" ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold text-ink">
              {formatNaira(summaryState.data?.totalSettled ?? 0)}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs text-muted">Pending Settlements</p>
          {summaryState.status === "loading" ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <>
              <p className="mt-1.5 text-2xl font-bold text-ink">
                {formatNaira(summaryState.data?.pendingAmount ?? 0)}
              </p>
              <p className="mt-1.5 text-xs text-success">None pending</p>
            </>
          )}
        </Card>
        <Card>
          <p className="text-xs text-muted">Settlements Count</p>
          {summaryState.status === "loading" ? (
            <Skeleton className="mt-2 h-7 w-16" />
          ) : (
            <>
              <p className="mt-1.5 text-2xl font-bold text-ink">{summaryState.data?.settledCount ?? 0}</p>
              <p className="mt-1.5 text-xs text-muted">transactions</p>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
