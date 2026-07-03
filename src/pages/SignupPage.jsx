import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "../components/Photo";
import Button from "../components/ui/Button";
import { TextField, SelectField, Checkbox } from "../components/ui/Field";
import { nigerianBanks } from "../data/mockData";
import { authService } from "../services";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  accountNumber: "",
  bank: "",
  accountType: "Savings",
  password: "",
  confirmPassword: "",
  otp: "",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { completeSignup } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const sendOtp = async () => {
    setOtpError("");
    try {
      await authService.requestOtp(form.phone);
      setOtpSent(true);
      setCountdown(30);
    } catch (err) {
      setOtpError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await completeSignup({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        bank: { name: form.bank, accountNumber: form.accountNumber, accountHolder: form.fullName },
      });
      navigate("/app/dashboard");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="w-full px-6 py-16 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto max-w-sm">
          <Link to="/" className="text-xl font-bold text-primary">
            SwiftSettle
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-ink">Get Started</h1>
          <p className="mb-8 mt-2 text-base text-muted">Create your SwiftSettle account in 2 minutes</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Personal information
            </p>
            <TextField label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Chioma Adeyemi" required />
            <TextField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="chioma@example.com" required />
            <TextField label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 (0) 800 000 0000" required />
            <TextField label="Date of Birth" value={form.dob} onChange={set("dob")} placeholder="DD/MM/YYYY" required />

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-subtle">Bank details</p>
            <TextField
              label="Bank Account Number"
              value={form.accountNumber}
              onChange={set("accountNumber")}
              placeholder="1234567890"
              help="Where we'll settle your earnings"
              required
            />
            <SelectField label="Select Your Bank" value={form.bank} onChange={set("bank")} required>
              <option value="">Choose your bank</option>
              {nigerianBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </SelectField>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Account Type</span>
              <div className="flex gap-6">
                {["Savings", "Checking"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-body">
                    <input
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={form.accountType === type}
                      onChange={set("accountType")}
                      className="accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-subtle">Security</p>
            <TextField
              label="Create Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              help="Minimum 8 characters, 1 uppercase, 1 number"
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="••••••••"
              required
            />

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-subtle">Verification</p>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Verify Your Phone</span>
              <Button
                type="button"
                variant="outline"
                onClick={sendOtp}
                disabled={countdown > 0}
                className="px-4 py-2"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Send OTP"}
              </Button>
              {otpError && <p className="mt-2 text-xs text-danger">{otpError}</p>}
              {otpSent && (
                <TextField
                  className="mt-3"
                  value={form.otp}
                  onChange={set("otp")}
                  placeholder="000000"
                  maxLength={6}
                />
              )}
            </div>

            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              label={
                <>
                  I agree to the <a href="#" className="text-primary">Terms of Service</a> and{" "}
                  <a href="#" className="text-primary">Privacy Policy</a>
                </>
              }
            />

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button type="submit" disabled={submitting || !agreed} className="w-full">
              {submitting ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <Photo slot="signupRight" className="h-screen" />
        <div className="absolute bottom-8 right-8 max-w-60 bg-black/30 p-4">
          <p className="text-sm text-white">“I now get paid same day. Life has changed.”</p>
          <p className="mt-1 text-xs text-white/80">— Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
