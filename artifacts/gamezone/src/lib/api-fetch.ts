const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

declare global {
  interface Window {
    Clerk?: {
      session?: { getToken: () => Promise<string | null> } | null;
    };
  }
}

/**
 * fetch() wrapper that attaches the current Clerk session as a Bearer token.
 * Frontend and backend live on different domains (GitHub Pages / Railway),
 * so browser cookies aren't reliably shared cross-origin — a bearer token is
 * the reliable way to authenticate these requests.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = (await window.Clerk?.session?.getToken()) ?? null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
}

export async function apiFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data && typeof data === "object" && "error" in data ? String(data.error) : null) ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}
