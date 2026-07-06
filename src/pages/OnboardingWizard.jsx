import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/dark/Button";
import { TextField, SelectField, Checkbox, Toggle } from "../components/ui/dark/Field";
import { onboardingService, banksService } from "../services";
import { useAuth } from "../context/AuthContext";

const platforms = ["Uber", "Bolt", "Jumia Food", "Glovo", "Chowdeck", "DoorDash", "Other"];
const nigerianStates = ["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Kaduna", "Ogun", "Enugu", "Delta", "Edo"];

const steps = [
  { number: 1, title: "Personal & Contact" },
  { number: 2, title: "Bank Details" },
  { number: 3, title: "Security" },
  { number: 4, title: "Terms & Consent" },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { worker, updateWorker } = useAuth();

  const [step, setStep] = useState(Math.min(worker?.onboardingStep || 1, 4));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [personal, setPersonal] = useState({ date_of_birth: "", state: "", platform: "", phone_number: "" });
  const [bank, setBank] = useState({ bank_name: "", bank_code: "", account_number: "", account_holder_name: worker?.fullName || "" });
  const [security, setSecurity] = useState({ pin: "", confirmPin: "", two_factor_enabled: false });
  const [consent, setConsent] = useState({ data_sharing_consent: false, terms_accepted: false });

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBanksLoading(true);
    banksService
      .list()
      .then((result) => {
        if (!cancelled) setBanks(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBanksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBankChange = (e) => {
    const selected = banks.find((b) => b.code === e.target.value);
    setBank((f) => ({ ...f, bank_name: selected?.name || "", bank_code: e.target.value }));
  };

  const goToDashboard = () => navigate("/app/dashboard");

  const submitStep = async (data) => {
    setError("");
    setSubmitting(true);
    try {
      const result = await onboardingService.submitStep(step, data);
      updateWorker(result.worker);
      if (step === 4) {
        goToDashboard();
      } else {
        setStep(step + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    submitStep(personal);
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    submitStep(bank);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (security.pin !== security.confirmPin) {
      setError("PINs do not match.");
      return;
    }
    if (!/^[0-9]{4,6}$/.test(security.pin)) {
      setError("PIN must be 4-6 digits.");
      return;
    }
    submitStep({ pin: security.pin, two_factor_enabled: security.two_factor_enabled });
  };

  const handleConsentSubmit = (e) => {
    e.preventDefault();
    if (!consent.data_sharing_consent || !consent.terms_accepted) {
      setError("Both agreements are required to finish setup.");
      return;
    }
    submitStep(consent);
  };

  return (
    <AppLayout title="Complete Your Profile" breadcrumb="Onboarding" subtitle="A few more details to unlock settlements and credit">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s) => (
            <div
              key={s.number}
              className={`h-1.5 flex-1 rounded-full ${s.number <= step ? "bg-accent" : "bg-white/8"}`}
            />
          ))}
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-3">
          Step {step} of {steps.length}
        </p>
        <h2 className="mb-6 text-xl font-bold text-text-1">{steps[step - 1].title}</h2>

        <Card>
          {step === 1 && (
            <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-5">
              <TextField
                label="Date of Birth"
                type="date"
                value={personal.date_of_birth}
                onChange={(e) => setPersonal((f) => ({ ...f, date_of_birth: e.target.value }))}
                required
              />
              <SelectField
                label="State"
                value={personal.state}
                onChange={(e) => setPersonal((f) => ({ ...f, state: e.target.value }))}
                required
              >
                <option value="">Select your state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Platform"
                value={personal.platform}
                onChange={(e) => setPersonal((f) => ({ ...f, platform: e.target.value }))}
                required
              >
                <option value="">Which platform do you work for?</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Phone Number"
                type="tel"
                value={personal.phone_number}
                onChange={(e) => setPersonal((f) => ({ ...f, phone_number: e.target.value }))}
                placeholder="+234 (0) 800 000 0000"
                required
              />
              {error && <p className="text-sm text-danger-vivid">{error}</p>}
              <StepActions submitting={submitting} onSkip={goToDashboard} />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleBankSubmit} className="flex flex-col gap-5">
              <SelectField
                label="Select Your Bank"
                value={bank.bank_code}
                onChange={handleBankChange}
                required
              >
                <option value="">{banksLoading ? "Loading banks…" : "Choose your bank"}</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Bank Account Number"
                value={bank.account_number}
                onChange={(e) => setBank((f) => ({ ...f, account_number: e.target.value }))}
                placeholder="1234567890"
                help="Where we'll settle your earnings"
                required
              />
              <TextField
                label="Account Holder Name"
                value={bank.account_holder_name}
                onChange={(e) => setBank((f) => ({ ...f, account_holder_name: e.target.value }))}
                required
              />
              {error && <p className="text-sm text-danger-vivid">{error}</p>}
              <StepActions submitting={submitting} onSkip={goToDashboard} />
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-5">
              <TextField
                label="Create PIN"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={security.pin}
                onChange={(e) => setSecurity((f) => ({ ...f, pin: e.target.value }))}
                placeholder="••••"
                help="4-6 digits"
                required
              />
              <TextField
                label="Confirm PIN"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={security.confirmPin}
                onChange={(e) => setSecurity((f) => ({ ...f, confirmPin: e.target.value }))}
                placeholder="••••"
                required
              />
              <Toggle
                checked={security.two_factor_enabled}
                onChange={(v) => setSecurity((f) => ({ ...f, two_factor_enabled: v }))}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
              />
              {error && <p className="text-sm text-danger-vivid">{error}</p>}
              <StepActions submitting={submitting} onSkip={goToDashboard} />
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleConsentSubmit} className="flex flex-col gap-5">
              <Checkbox
                checked={consent.data_sharing_consent}
                onChange={(e) => setConsent((f) => ({ ...f, data_sharing_consent: e.target.checked }))}
                label="I agree to share my platform earnings data to build my financial identity score."
              />
              <Checkbox
                checked={consent.terms_accepted}
                onChange={(e) => setConsent((f) => ({ ...f, terms_accepted: e.target.checked }))}
                label={
                  <>
                    I agree to the <a href="#" className="text-accent">Terms of Service</a> and{" "}
                    <a href="#" className="text-accent">Privacy Policy</a>
                  </>
                }
              />
              {error && <p className="text-sm text-danger-vivid">{error}</p>}
              <StepActions submitting={submitting} onSkip={goToDashboard} finalStep />
            </form>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function StepActions({ submitting, onSkip, finalStep = false }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-4">
      <button type="button" onClick={onSkip} className="text-sm text-text-3 hover:text-text-1">
        Complete later
      </button>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : finalStep ? "Finish Setup" : "Save & Continue"}
      </Button>
    </div>
  );
}
