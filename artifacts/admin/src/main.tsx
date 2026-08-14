import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const apiUrl = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body as T;
}

createRoot(document.getElementById("root")!).render(<App />);
