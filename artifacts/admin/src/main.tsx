import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./styles.css";

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Rockcity admin render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="gate">
        <h1>Rockcity Admin</h1>
        <p>The dashboard encountered an unexpected error and was kept visible.</p>
        <div className="error">{this.state.error.message || "Unknown dashboard error"}</div>
        <button onClick={() => window.location.reload()}>Reload dashboard</button>
      </main>
    );
  }
}

const apiUrl = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

declare global {
  interface Window {
    Clerk?: {
      session?: { getToken: () => Promise<string | null> } | null;
      openSignIn: (options: Record<string, unknown>) => void;
    };
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = (await window.Clerk?.session?.getToken()) ?? null;
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body as T;
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <AdminErrorBoundary>
      <App />
    </AdminErrorBoundary>
  </ClerkProvider>,
);
