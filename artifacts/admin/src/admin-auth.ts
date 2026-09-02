import { useClerk, useUser } from "@clerk/react";

const ADMIN_OWNER_EMAIL = "jacksonmich972@gmail.com";

type AdminSession = {
  openId: string;
  email: string | null;
  name: string | null;
};

/**
 * Opens Clerk's sign-in UI. Real authorization is enforced server-side by
 * requireAdmin() on every /api/admin/* route — this client-side email check
 * is only for showing/hiding the dashboard UI.
 */
export function startAdminLogin() {
  window.Clerk?.openSignIn({});
}

export function useAdminAuth() {
  const clerk = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
  const isOwner = isSignedIn && email?.trim().toLowerCase() === ADMIN_OWNER_EMAIL;

  const session: AdminSession | null = isOwner
    ? { openId: user!.id, email, name: user?.fullName ?? null }
    : null;

  const signOut = async () => {
    await clerk.signOut();
    window.location.assign(`${import.meta.env.BASE_URL || "/"}admin/`);
  };

  return {
    isLoaded,
    isSignedIn: Boolean(session),
    user: session,
    error: isSignedIn && !isOwner ? "This account is not authorized for Rockcity Admin. Sign in with the owner account." : "",
    reload: async () => undefined,
    signOut,
  };
}
