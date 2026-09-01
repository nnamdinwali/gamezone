import { useEffect } from "react";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import { apiFetch } from "./api-fetch";

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

    void apiFetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode: detectedCountry }),
    }).catch(() => undefined);
  }, [query.data]);

  return query;
}
