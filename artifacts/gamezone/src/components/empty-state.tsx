import type { ReactNode } from "react";

/**
 * Rock City's own empty-state treatment: a soft radial glow behind a solid
 * card, no dashed borders, no generic centered-icon-in-a-box look. Built to
 * read as part of the product, not a placeholder a scaffolding tool left behind.
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card px-6 py-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
