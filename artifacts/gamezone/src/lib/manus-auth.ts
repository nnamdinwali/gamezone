import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@workspace/api-client-react";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space";
const SESSION_QUERY_KEY = getGetCurrentUserQueryKey();

async function fetchCurrentUser(): Promise<User | null> {
  const isOAuthReturn = new URLSearchParams(window.location.search).get("gamezone_auth") === "1";
  const maxAttempts = isOAuthReturn ? 12 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(`${API_BASE}/api/users/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (response.status === 401 && attempt < maxAttempts - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        continue;
      }
      if (response.status === 401) return null;
      if (!response.ok) throw new Error(`Session request failed (${response.status})`);
      return (await response.json()) as User;
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return null;
}

export function startLogin() {
  const returnUrl = new URL(`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`);
  returnUrl.searchParams.set("gamezone_auth", "1");
  const url = new URL(`${API_BASE}/api/auth/login`);
  url.searchParams.set("returnUri", returnUrl.toString());
  // Navigation (rather than fetch) lets the API set its host-only OAuth state cookie.
  window.location.assign(url.toString());
}

export function useManusAuth() {
  const queryClient = useQueryClient();
  const me = useQuery<User | null, Error>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const logout = useCallback(async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });
    window.location.assign(`${import.meta.env.BASE_URL || "/"}`);
  }, [queryClient]);

  return {
    user: me.data ?? null,
    isLoaded: !me.isLoading,
    isSignedIn: Boolean(me.data),
    isLoading: me.isLoading,
    error: me.error,
    logout,
  };
}
