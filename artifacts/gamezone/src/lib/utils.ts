import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  const locale = navigator.language || 'en-US';
  const currencyMap: Record<string, string> = {
    'en-NG': 'NGN', 'en-GB': 'GBP', 'en-CA': 'CAD', 'en-AU': 'AUD',
    'en-IN': 'INR', 'en-ZA': 'ZAR', 'en-GH': 'GHS', 'en-KE': 'KES',
    'fr-FR': 'EUR', 'de-DE': 'EUR', 'es-ES': 'EUR',
  };
  const currency = currencyMap[locale] ?? 'USD';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
