import { useEffect } from "react";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from "@workspace/api-client-react";

const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");
const COUNTRY_KEY = "gamezone:country-code";

export function useCurrentUser() {
  const query = useGetCurrentUser({
    query: {
      enabled: true,
      retry: false,
      refetchOnWindowFocus: false,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  useEffect(() => {
    const profile = query.data as (typeof query.data & { countryCode?: string | null }) | undefined;
    if (!profile || profile.countryCode) return;
    let detectedCountry: string | null = null;
    try {
      const value = localStorage.getItem(COUNTRY_KEY)?.toUpperCase();
      if (value && /^[A-Z]{2}$/.test(value)) detectedCountry = value;
    } catch {
      return;
    }
    if (!detectedCountry) return;

    void fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode: detectedCountry }),
    }).catch(() => undefined);
  }, [query.data]);

  return query;
}
