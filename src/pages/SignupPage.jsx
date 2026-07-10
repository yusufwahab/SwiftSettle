import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "../components/Photo";
import Button from "../components/ui/dark/Button";
import { TextField } from "../components/ui/dark/Field";
import { useAuth } from "../context/AuthContext";

const RESEND_COOLDOWN_SECONDS = 60;

export default function SignupPage() {
  const navigate = useNavigate();
  const { startSignup, verifySignupOtp } = useAuth();

  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await startSignup(form);
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Reuses the same signup call — the backend already treats a repeat
  // signup for an unverified email as "resend a fresh code" (it updates the
  // existing unverified worker row rather than erroring), so no separate
  // resend endpoint is needed.
  const handleResend = async () => {
    setError("");
    setResendMessage("");
    setResending(true);
    try {
      await startSignup(form);
      setResendMessage("A new code has been sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifySignupOtp(form.email, otp);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-appbg lg:flex-row">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[130px]"
      />
      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-16 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="text-xl font-bold text-text-1">
            SwiftSettle
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-text-1">Get Started</h1>
          <p className="mb-8 mt-2 text-base text-text-3">
            {step === "form"
              ? "Create your account in under a minute."
              : `Enter the code we emailed to ${form.email}.`}
          </p>

          {step === "form" ? (
            <form onSubmit={handleCreateAccount} className="flex flex-col gap-5">
              <TextField label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Chioma Adeyemi" required />
              <TextField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="chioma@example.com" required />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                help="Minimum 8 characters"
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

              {error && <p className="text-sm text-danger-vivid">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Creating…" : "Create Account"}
              </Button>

              <p className="text-center text-xs text-text-3">
                You'll finish setting up your bank details and security afterward — no rush.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <TextField
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />

              {resendMessage && !error && <p className="text-sm text-accent-2">{resendMessage}</p>}
              {error && <p className="text-sm text-danger-vivid">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Verifying…" : "Verify & Continue"}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-xs text-text-3 hover:text-text-1"
                >
                  Wrong email? Go back
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="text-xs text-accent hover:text-accent-dark disabled:opacity-50 disabled:hover:text-accent"
                >
                  {resending ? "Sending…" : cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-text-3">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 hidden lg:block lg:w-1/2">
        <Photo slot="signupRight" className="h-screen" />
        <div className="absolute bottom-8 right-8 max-w-60 bg-black/30 p-4">
          <p className="text-sm text-white">“I now get paid same day. Life has changed.”</p>
          <p className="mt-1 text-xs text-white/80">— Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
