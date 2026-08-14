import { useCallback } from "react";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function startLogin() {
  const apiBase = import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space";
  const returnUri = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;
  const url = new URL(`${apiBase}/api/auth/login`);
  url.searchParams.set("returnUri", returnUri);
  // Navigation (rather than fetch) lets the API set its host-only OAuth state cookie.
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
