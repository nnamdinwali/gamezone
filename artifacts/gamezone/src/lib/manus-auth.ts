import { useCallback } from "react";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const OAUTH_STATE_COOKIE = "__Host-oauth_state";

export function startLogin() {
  const portal = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://manus.im";
  // Public OAuth client identifier for the hosted GameZone Manus project.
  // Keep the fallback so GitHub Pages remains functional if the optional CI env is absent.
  const appId = import.meta.env.VITE_APP_ID || "Cp623UB2atBZci58ThtrZQ";
  const apiBase = import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space";
  const redirectUri = `${apiBase}/api/oauth/callback`;
  const returnUri = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = btoa(JSON.stringify({ redirectUri, returnUri, nonce }));
  const url = new URL(`${portal}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  window.location.assign(url.toString());
}

export function useManusAuth() {
  const queryClient = useQueryClient();
  const me = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      refetchOnWindowFocus: false,
    },
  });

  const logout = useCallback(async () => {
    await fetch(`${import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space"}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
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
