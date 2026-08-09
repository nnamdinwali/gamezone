import { Link, useLocation } from "wouter";
import { Gamepad2, Trophy, Wallet, Upload, User, LayoutDashboard, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/games", label: "All Games", icon: Gamepad2 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/earnings", label: "Earnings", icon: Wallet },
    { href: "/upload", label: "Upload Game", icon: Upload },
    { href: "/profile/1", label: "Profile", icon: User },
    { href: "/dashboard", label: "Platform Stats", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
            <CircleDot className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">
            ROCKCITY GAMES
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href || 
            (link.href !== '/' && location.startsWith(link.href));
            
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-secondary rounded-xl p-4 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
            Active Session
          </p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-foreground font-medium">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
