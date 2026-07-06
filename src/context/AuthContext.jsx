import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services";

const AuthContext = createContext(null);

const STORAGE_KEY = "swiftsettle_worker";

export function AuthProvider({ children }) {
  const [worker, setWorker] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWorker(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = (value) => {
    setWorker(value);
    if (value) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      worker,
      ready,
      isAuthenticated: Boolean(worker),
      // Step 1 of signup: sends the email OTP. No session yet.
      async startSignup({ fullName, email, password }) {
        return authService.signup({ fullName, email, password });
      },
      // Step 2: confirms the OTP and logs the new account in.
      async verifySignupOtp(email, otp) {
        const { worker: w } = await authService.verifySignupOtp(email, otp);
        persist(w);
        return w;
      },
      async login(email, password) {
        const { worker: w } = await authService.login(email, password);
        persist(w);
        return w;
      },
      async signOut() {
        await authService.logout();
        persist(null);
      },
      // Onboarding wizard steps merge their result into the current
      // worker rather than replacing it outright.
      updateWorker(partial) {
        persist({ ...worker, ...partial });
      },
    }),
    [worker, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
