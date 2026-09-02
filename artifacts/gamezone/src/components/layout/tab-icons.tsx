import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { active?: boolean };

/** Freecash-style magnifying glass (Earn) */
export function IconEarn({ active, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <circle cx="10.5" cy="10.5" r="6.25" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15.2 15.2L20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Freecash-style list / offers (two bars) */
export function IconOffers({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <rect x="5" y="7" width="14" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="5" y="14.6" width="14" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}

/** Freecash-style dollar cashout */
export function IconCashout({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M12 4v16M15.5 8.2c0-1.7-1.6-3-3.5-3s-3.5 1.2-3.5 2.8c0 3.8 7 1.6 7 5.4 0 1.7-1.6 3.1-3.5 3.1S8.5 15.3 8.5 13.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Freecash-style trophy / rewards */
export function IconRewards({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M8 5h8v3.2a4 4 0 0 1-8 0V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 6.5H5.5A2.5 2.5 0 0 0 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 6.5h2.5A2.5 2.5 0 0 1 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12.2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 15h3c.8 0 1.5.7 1.5 1.5v.5H9v-.5c0-.8.7-1.5 1.5-1.5z" fill="currentColor" />
    </svg>
  );
}
