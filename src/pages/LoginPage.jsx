import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "../components/Photo";
import Button from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { authService } from "../services";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (step === "phone") {
        await authService.requestOtp(phone);
        setStep("otp");
      } else {
        await completeLogin(phone, otp);
        navigate("/app/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="text-xl font-bold text-primary">
            SwiftSettle
          </Link>
          <h1 className="mt-10 text-3xl font-bold text-ink">Welcome Back</h1>
          <p className="mb-10 mt-2 text-base text-muted">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 (0) 800 000 0000"
              help="We'll send you an OTP to verify"
              disabled={step === "otp"}
              required
            />

            {step === "otp" && (
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                help="Check your phone or email"
                autoFocus
                required
              />
            )}

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Please wait…" : step === "phone" ? "Send OTP" : "Sign In"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="relative w-full lg:w-1/2">
        <Photo slot="loginRight" className="h-64 lg:h-screen" />
        <div className="absolute bottom-8 right-8 max-w-60 bg-black/30 p-4">
          <p className="text-sm text-white">“I now get paid same day. Life has changed.”</p>
          <p className="mt-1 text-xs text-white/80">— Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
