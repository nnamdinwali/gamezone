const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

export function resolveGameImageUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/manus-storage/")) return `${API_BASE}${value}`;
  return value;
}
