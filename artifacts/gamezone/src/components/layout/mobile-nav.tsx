import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
        data-testid="button-mobile-menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="relative z-10 flex h-full w-72 max-w-[80%] flex-col border-r border-border bg-sidebar">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <CircleDot className="h-5 w-5 text-primary" />
                </div>
                <span className="font-heading text-lg font-bold tracking-tight">ROCKCITY GAMES</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-4">
              {navLinks.map((link) => {
                const isActive =
                  location === link.href ||
                  (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
