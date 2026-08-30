import { useAppAuth } from "@/lib/clerk-auth";

/**
 * Admin check for UI purposes only. The API server remains the authoritative
 * authorization boundary for every administrative mutation.
 */
export function useIsAdmin() {
  const { user, isLoaded } = useAppAuth();
  const role = (user as ({ role?: string } | null | undefined))?.role;
  return { isAdmin: role === "admin", isLoaded };
}
