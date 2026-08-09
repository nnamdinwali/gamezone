"use strict";
export default `import { Link, useLocation } from "wouter";
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
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbInNpZGViYXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiaW1wb3J0IHsgTGluaywgdXNlTG9jYXRpb24gfSBmcm9tIFxcXCJ3b3V0ZXJcXFwiO1xcbmltcG9ydCB7IEdhbWVwYWQyLCBUcm9waHksIFdhbGxldCwgVXBsb2FkLCBVc2VyLCBMYXlvdXREYXNoYm9hcmQsIENpcmNsZURvdCB9IGZyb20gXFxcImx1Y2lkZS1yZWFjdFxcXCI7XFxuaW1wb3J0IHsgY24gfSBmcm9tIFxcXCJAL2xpYi91dGlsc1xcXCI7XFxuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2J1dHRvblxcXCI7XFxuXFxuZXhwb3J0IGZ1bmN0aW9uIFNpZGViYXIoKSB7XFxuICBjb25zdCBbbG9jYXRpb25dID0gdXNlTG9jYXRpb24oKTtcXG5cXG4gIGNvbnN0IGxpbmtzID0gW1xcbiAgICB7IGhyZWY6IFxcXCIvXFxcIiwgbGFiZWw6IFxcXCJIb21lXFxcIiwgaWNvbjogTGF5b3V0RGFzaGJvYXJkIH0sXFxuICAgIHsgaHJlZjogXFxcIi9nYW1lc1xcXCIsIGxhYmVsOiBcXFwiQWxsIEdhbWVzXFxcIiwgaWNvbjogR2FtZXBhZDIgfSxcXG4gICAgeyBocmVmOiBcXFwiL2xlYWRlcmJvYXJkXFxcIiwgbGFiZWw6IFxcXCJMZWFkZXJib2FyZFxcXCIsIGljb246IFRyb3BoeSB9LFxcbiAgICB7IGhyZWY6IFxcXCIvZWFybmluZ3NcXFwiLCBsYWJlbDogXFxcIkVhcm5pbmdzXFxcIiwgaWNvbjogV2FsbGV0IH0sXFxuICAgIHsgaHJlZjogXFxcIi91cGxvYWRcXFwiLCBsYWJlbDogXFxcIlVwbG9hZCBHYW1lXFxcIiwgaWNvbjogVXBsb2FkIH0sXFxuICAgIHsgaHJlZjogXFxcIi9wcm9maWxlLzFcXFwiLCBsYWJlbDogXFxcIlByb2ZpbGVcXFwiLCBpY29uOiBVc2VyIH0sXFxuICAgIHsgaHJlZjogXFxcIi9kYXNoYm9hcmRcXFwiLCBsYWJlbDogXFxcIlBsYXRmb3JtIFN0YXRzXFxcIiwgaWNvbjogTGF5b3V0RGFzaGJvYXJkIH0sXFxuICBdO1xcblxcbiAgcmV0dXJuIChcXG4gICAgPGFzaWRlIGNsYXNzTmFtZT1cXFwidy02NCBib3JkZXItciBib3JkZXItYm9yZGVyIGJnLXNpZGViYXIgaGlkZGVuIG1kOmZsZXggZmxleC1jb2wgZmxleC1zaHJpbmstMCBoLXNjcmVlbiBzdGlja3kgdG9wLTBcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJwLTYgYm9yZGVyLWIgYm9yZGVyLWJvcmRlclxcXCI+XFxuICAgICAgICA8TGluayBocmVmPVxcXCIvXFxcIiBjbGFzc05hbWU9XFxcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGdyb3VwXFxcIj5cXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctMTAgaC0xMCBiZy1wcmltYXJ5LzEwIHJvdW5kZWQteGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIGdyb3VwLWhvdmVyOmJnLXByaW1hcnkvMjAgdHJhbnNpdGlvbi1hbGxcXFwiPlxcbiAgICAgICAgICAgIDxDaXJjbGVEb3QgY2xhc3NOYW1lPVxcXCJ3LTUgaC01IHRleHQtcHJpbWFyeVxcXCIgLz5cXG4gICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwiZm9udC1oZWFkaW5nIGZvbnQtYm9sZCB0ZXh0LXhsIHRyYWNraW5nLXRpZ2h0XFxcIj5cXG4gICAgICAgICAgICBST0NLQ0lUWSBHQU1FU1xcbiAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICA8L0xpbms+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPG5hdiBjbGFzc05hbWU9XFxcImZsZXgtMSBweS02IHB4LTQgc3BhY2UteS0xIG92ZXJmbG93LXktYXV0b1xcXCI+XFxuICAgICAgICB7bGlua3MubWFwKChsaW5rKSA9PiB7XFxuICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gbG9jYXRpb24gPT09IGxpbmsuaHJlZiB8fCBcXG4gICAgICAgICAgICAobGluay5ocmVmICE9PSAnLycgJiYgbG9jYXRpb24uc3RhcnRzV2l0aChsaW5rLmhyZWYpKTtcXG4gICAgICAgICAgICBcXG4gICAgICAgICAgcmV0dXJuIChcXG4gICAgICAgICAgICA8TGluayBrZXk9e2xpbmsuaHJlZn0gaHJlZj17bGluay5ocmVmfT5cXG4gICAgICAgICAgICAgIDxCdXR0b25cXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cXFwiZ2hvc3RcXFwiXFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXFxuICAgICAgICAgICAgICAgICAgXFxcInctZnVsbCBqdXN0aWZ5LXN0YXJ0IGdhcC0zIGgtMTEgdGV4dC1zbSBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWNvbG9yc1xcXCIsXFxuICAgICAgICAgICAgICAgICAgaXNBY3RpdmUgXFxuICAgICAgICAgICAgICAgICAgICA/IFxcXCJiZy1wcmltYXJ5LzEwIHRleHQtcHJpbWFyeSBob3ZlcjpiZy1wcmltYXJ5LzE1IGhvdmVyOnRleHQtcHJpbWFyeVxcXCIgXFxuICAgICAgICAgICAgICAgICAgICA6IFxcXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6YmctbXV0ZWQvNTAgaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXFxcIlxcbiAgICAgICAgICAgICAgICApfVxcbiAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICA8bGluay5pY29uIGNsYXNzTmFtZT1cXFwidy01IGgtNVxcXCIgLz5cXG4gICAgICAgICAgICAgICAge2xpbmsubGFiZWx9XFxuICAgICAgICAgICAgICA8L0J1dHRvbj5cXG4gICAgICAgICAgICA8L0xpbms+XFxuICAgICAgICAgICk7XFxuICAgICAgICB9KX1cXG4gICAgICA8L25hdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicC00IGJvcmRlci10IGJvcmRlci1ib3JkZXJcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImJnLXNlY29uZGFyeSByb3VuZGVkLXhsIHAtNCBib3JkZXIgYm9yZGVyLWJvcmRlclxcXCI+XFxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSBmb250LWJvbGQgdHJhY2tpbmctd2lkZXIgbWItMlxcXCI+XFxuICAgICAgICAgICAgQWN0aXZlIFNlc3Npb25cXG4gICAgICAgICAgPC9wPlxcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJ3LTIgaC0yIHJvdW5kZWQtZnVsbCBiZy1zdWNjZXNzIGFuaW1hdGUtcHVsc2VcXFwiIC8+XFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIHRleHQtZm9yZWdyb3VuZCBmb250LW1lZGl1bVxcXCI+Q29ubmVjdGVkPC9zcGFuPlxcbiAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2FzaWRlPlxcbiAgKTtcXG59XFxuXCIiXSwiZmlsZSI6Ii9ob21lL3J1bm5lci93b3Jrc3BhY2UvYXJ0aWZhY3RzL2dhbWV6b25lL3NyYy9jb21wb25lbnRzL2xheW91dC9zaWRlYmFyLnRzeCJ9