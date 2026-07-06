import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "../components/Photo";
import Button from "../components/ui/dark/Button";
import { TextField } from "../components/ui/dark/Field";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
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
          <h1 className="mt-10 text-3xl font-bold text-text-1">Welcome Back</h1>
          <p className="mb-10 mt-2 text-base text-text-3">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chioma@example.com"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <p className="text-sm text-danger-vivid">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:text-accent-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full lg:w-1/2">
        <Photo slot="loginRight" className="h-64 lg:h-screen" />
        <div className="absolute bottom-8 right-8 max-w-60 bg-black/30 p-4">
          <p className="text-sm text-white">“I now get paid same day. Life has changed.”</p>
          <p className="mt-1 text-xs text-white/80">— Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
