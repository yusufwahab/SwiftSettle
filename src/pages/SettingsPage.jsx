import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { TextField, Toggle, Checkbox } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { preferencesService } from "../services";
import { useAsync } from "../hooks/useAsync";

export default function SettingsPage() {
  const { worker } = useAuth();
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const prefsState = useAsync(() => preferencesService.getNotifications(), []);
  const [notifs, setNotifs] = useState(null);
  const active = notifs ?? prefsState.data;

  const setPref = (key) => (value) => {
    const next = { ...active, [key]: value };
    setNotifs(next);
    preferencesService.updateNotifications(next);
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Personal Information</p>
          <button
            type="button"
            onClick={() => setEditingPersonal((v) => !v)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            {editingPersonal ? "Cancel" : "Edit"}
          </button>
        </div>

        {[
          { label: "Full Name", value: worker?.fullName },
          { label: "Email", value: worker?.email },
          { label: "Phone", value: worker?.phone },
          { label: "Date of Birth", value: worker?.dateOfBirth },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <span className="w-32 text-xs text-muted">{label}</span>
            {editingPersonal ? (
              <TextField defaultValue={value} className="flex-1" />
            ) : (
              <span className="text-sm text-ink">{value}</span>
            )}
          </div>
        ))}
        {editingPersonal && (
          <Button className="mt-4 px-6 py-2.5" onClick={() => setEditingPersonal(false)}>
            Save Changes
          </Button>
        )}

        <p className="mb-4 mt-8 text-sm font-bold text-ink">Bank Details</p>
        {[
          { label: "Bank Name", value: worker?.bank.name },
          { label: "Account Number", value: worker?.bank.accountNumberMasked },
          { label: "Account Holder", value: worker?.bank.accountHolder },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <span className="w-32 text-xs text-muted">{label}</span>
            <span className="text-sm text-ink">{value}</span>
          </div>
        ))}
      </Card>

      <Card className="mb-6">
        <p className="mb-4 text-sm font-bold text-ink">Change Password</p>
        <div className="mb-6 flex flex-col gap-4">
          <TextField label="Current Password" type="password" placeholder="••••••••" />
          <TextField label="New Password" type="password" placeholder="••••••••" />
          <TextField label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button className="w-full">Update Password</Button>
        </div>

        <div className="border-t border-border pt-4">
          <Toggle
            checked={twoFA}
            onChange={setTwoFA}
            label="Two-Factor Authentication"
            description={
              twoFA
                ? "2FA is enabled. You'll receive codes via SMS"
                : "Add an extra layer of security to your account"
            }
          />
          {twoFA && (
            <Button variant="danger" onClick={() => setTwoFA(false)} className="mt-2 px-5 py-2.5">
              Disable 2FA
            </Button>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <p className="mb-2 text-sm font-bold text-ink">Notifications</p>
        {prefsState.status === "loading" && (
          <div className="space-y-3 py-3">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        )}
        {prefsState.status === "error" && (
          <ErrorState message={prefsState.error} onRetry={prefsState.reload} className="py-6" />
        )}
        {active && (
          <>
            <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-subtle">Email</p>
            <Toggle checked={active.settlements} onChange={setPref("settlements")} label="Settlement Confirmations" />
            <Toggle checked={active.weekly} onChange={setPref("weekly")} label="Weekly Earnings Summary" />
            <Toggle checked={active.security} onChange={setPref("security")} label="Security Alerts" />
            <Toggle checked={active.marketing} onChange={setPref("marketing")} label="Marketing & Promotions" />

            <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-subtle">Push</p>
            <Toggle checked={active.orders} onChange={setPref("orders")} label="Order Updates" />
            <Toggle checked={active.settlementAlerts} onChange={setPref("settlementAlerts")} label="Settlement Alerts" />
            <Toggle checked={active.activity} onChange={setPref("activity")} label="Account Activity" />

            <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-subtle">SMS</p>
            <Toggle
              checked={active.sms}
              onChange={setPref("sms")}
              label="Critical Alerts Only"
              description="We'll only SMS you for urgent account issues"
            />
          </>
        )}
      </Card>

      <Card className="border-danger/40">
        <p className="mb-2 text-sm font-bold text-ink">Delete Account</p>
        <p className="mb-4 text-sm text-muted">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)} className="px-6 py-2.5">
          Delete Account
        </Button>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} width="440px">
        <h2 className="text-xl font-bold text-ink">Are you sure?</h2>
        <p className="mt-3 text-sm text-muted">
          Deleting your account will remove all your data. This cannot be undone.
        </p>
        <Checkbox
          className="mt-5"
          checked={deleteConfirmed}
          onChange={(e) => setDeleteConfirmed(e.target.checked)}
          label="I understand and want to delete my account"
        />
        <div className="mt-6 flex gap-3">
          <Button variant="subtle" onClick={() => setDeleteOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" disabled={!deleteConfirmed} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
