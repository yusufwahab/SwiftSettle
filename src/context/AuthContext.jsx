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
      async completeLogin(phone, otp) {
        const { worker: w } = await authService.verifyOtp(phone, otp);
        persist(w);
        return w;
      },
      async completeSignup(payload) {
        const { worker: w } = await authService.signup(payload);
        persist(w);
        return w;
      },
      async signOut() {
        await authService.logout();
        persist(null);
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
