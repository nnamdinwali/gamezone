import { useUser } from "@clerk/react";

/**
 * Admin check for UI purposes only.
 *
 * Set `publicMetadata: { role: "admin" }` on your own account in the Clerk
 * dashboard (Users -> your user -> Metadata -> Public).
 *
 * IMPORTANT: this only hides UI. The API server must run its own check before
 * accepting any admin action, because anyone can call the API directly.
 */
export function useIsAdmin() {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  return { isAdmin: role === "admin", isLoaded };
}
