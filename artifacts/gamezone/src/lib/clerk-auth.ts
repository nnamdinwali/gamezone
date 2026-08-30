import { useEffect, useCallback } from "react";
import { useAuth as useClerkAuth, useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";

/**
 * Wires the shared API client's bearer-token getter to Clerk's session.
 * Must be mounted once, inside <ClerkProvider>, above anything that calls the API.
 */
export function useConfigureApiAuth() {
  const { getToken, isLoaded } = useClerkAuth();

  useEffect(() => {
    if (!isLoaded) return;
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [isLoaded, getToken]);
}

/**
 * Drop-in replacement for the old useManusAuth hook. Same shape
 * (user, isLoaded, isSignedIn, isLoading, error, logout) so existing
 * consumers don't need to change, but backed by Clerk + our own
 * /api/users/me record (which carries app-specific fields like role).
 */
export function useAppAuth() {
  const clerk = useClerk();
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const queryClient = useQueryClient();

  const me = useGetCurrentUser({
    query: {
      enabled: Boolean(clerkSignedIn),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  });

  const logout = useCallback(async () => {
    await clerk.signOut();
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
    window.location.assign(`${import.meta.env.BASE_URL || "/"}`);
  }, [clerk, queryClient]);

  return {
    user: clerkSignedIn ? me.data ?? null : null,
    isLoaded: clerkLoaded && (!clerkSignedIn || !me.isLoading),
    isSignedIn: Boolean(clerkSignedIn && me.data),
    isLoading: me.isLoading,
    error: me.error,
    logout,
  };
}
