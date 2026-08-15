import { useCallback, useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");
const ADMIN_OWNER_EMAIL = "jacksonmich972@gmail.com";

type AdminSession = {
  openId: string;
  email: string | null;
  name: string | null;
};

export function startAdminLogin() {
  const basePath = import.meta.env.BASE_URL || "/";
  const adminPath = basePath.endsWith("/admin/") ? basePath : `${basePath.replace(/\/$/, "")}/admin/`;
  const returnUri = `${window.location.origin}${adminPath}`;
  const url = new URL(`${API_BASE}/api/auth/login`);
  url.searchParams.set("returnUri", returnUri);
  window.location.assign(url.toString());
}

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadSession = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        credentials: "include",
        cache: "no-store",
      });
      if (response.status === 401) {
        setSession(null);
        return;
      }
      if (!response.ok) throw new Error(`Session request failed (${response.status})`);
      const nextSession = (await response.json()) as AdminSession;
      if (nextSession.email?.trim().toLowerCase() !== ADMIN_OWNER_EMAIL) {
        await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
        setSession(null);
        setError("This account is not authorized for Rockcity Admin. Sign in with the owner account.");
        return;
      }
      setSession(nextSession);
    } catch (cause) {
      setSession(null);
      setError(cause instanceof Error ? cause.message : "Unable to load admin session");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const signOut = useCallback(async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
    setSession(null);
    window.location.assign(`${import.meta.env.BASE_URL || "/"}admin/`);
  }, []);

  return {
    isLoaded,
    isSignedIn: Boolean(session),
    user: session,
    error,
    reload: loadSession,
    signOut,
  };
}
