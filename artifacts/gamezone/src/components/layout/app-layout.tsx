import { useUser, useClerk } from "@clerk/react";
import { Link } from "wouter";
import { LogOut, UserRound } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/lib/current-user";
import { ErrorBoundary } from "@/components/error-boundary";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: currentUser } = useCurrentUser();
  const profileId = currentUser?.id;
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 max-w-full relative">
        <header className="flex items-center justify-end gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur md:px-8">
          <Link href={profileId ? `/profile/${profileId}` : "/dashboard"} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="link-session-profile">
            <UserRound className="h-4 w-4" /> {user?.firstName || user?.username || "Your profile"}
          </Link>
          <button type="button" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL || "/" })} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary" data-testid="button-session-logout">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
