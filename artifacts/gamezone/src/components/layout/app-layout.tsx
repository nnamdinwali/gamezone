import { useManusAuth } from "@/lib/manus-auth";
import { Link, useLocation } from "wouter";
import { Bell, Gift, LayoutGrid, LogOut, Ticket, Trophy, UserRound, WalletCards } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/lib/current-user";
import { ErrorBoundary } from "@/components/error-boundary";

const bottomLinks = [
  { href: "/", label: "Earn", icon: LayoutGrid },
  { href: "/games", label: "My Offers", icon: Ticket },
  { href: "/earnings", label: "Cashout", icon: WalletCards },
  { href: "/leaderboard", label: "Rewards", icon: Trophy },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: sessionUser, logout } = useManusAuth();
  const { data: currentUser } = useCurrentUser();
  const [location] = useLocation();
  const profileHref = currentUser?.id ? `/profile/${currentUser.id}` : "/profile";
  const avatar = currentUser?.avatarUrl || sessionUser?.avatarUrl;
  const initials = (currentUser?.username || sessionUser?.username || "P").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#10111f] text-white">
      <Sidebar />
      <main className="relative min-h-screen min-w-0 md:ml-64">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#10111f]/95 px-4 py-4 backdrop-blur-xl sm:px-6 md:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href={profileHref} className="flex items-center gap-3 rounded-2xl" data-testid="link-session-profile">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-[#2b2c3c]">
                {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold text-[#d5d4df]">{initials}</div>}
              </div>
              <span className="hidden text-sm font-semibold text-white sm:block">{currentUser?.username || sessionUser?.username || "Player"}</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/earnings" className="hidden items-center gap-2 rounded-xl border border-[#00c978] px-3 py-2 text-sm font-bold text-white sm:flex"><span className="text-[#00d57e]">$</span>{Number(currentUser?.balance ?? 0).toFixed(2)}</Link>
              <Link href="/games" className="hidden items-center gap-2 rounded-xl border border-[#8584a4] px-3 py-2 text-sm font-bold text-white sm:flex"><Ticket className="h-4 w-4 text-[#b9b8df]" />0</Link>
              <button type="button" aria-label="Notifications" className="rounded-full p-2 text-[#9998aa] hover:bg-white/5 hover:text-white"><Bell className="h-6 w-6 fill-current" strokeWidth={1.5} /></button>
              <button type="button" onClick={() => void logout()} aria-label="Log out" className="hidden rounded-full p-2 text-[#9998aa] hover:bg-white/5 hover:text-white md:block"><LogOut className="h-5 w-5" /></button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6 md:px-10 md:pb-10">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-[#111322]/98 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden" aria-label="Primary">
        <div className="mx-auto grid max-w-xl grid-cols-4">
          {bottomLinks.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${active ? "text-[#00d57e]" : "text-[#9998aa]"}`}><Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 1.8} />{label}</Link>;
          })}
        </div>
      </nav>
      <Toaster />
    </div>
  );
}
