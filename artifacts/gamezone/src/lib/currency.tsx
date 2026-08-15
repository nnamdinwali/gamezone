import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Money is ALWAYS stored and calculated in one base currency (USD).
 * We only convert at display time. Never write a converted value back
 * to the database or balances will drift as exchange rates move.
 */
export const BASE_CURRENCY = "USD";

const RATES_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;
const CACHE_KEY = "rockcity:fx-rates";
const PREF_KEY = "rockcity:currency";
const LOCKED_CURRENCY_KEY = "gamezone:currency-locked";
const AUTO_CURRENCY_KEY = "gamezone:auto-currency";
const COUNTRY_KEY = "gamezone:country-code";
const IP_COUNTRY_URL = "https://ipapi.co/json/";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // refresh twice a day

type RatesCache = { fetchedAt: number; rates: Record<string, number> };

/** Region (from the browser locale) -> ISO currency code. */
const REGION_CURRENCY: Record<string, string> = {
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", EG: "EGP", TZ: "TZS", UG: "UGX",
  US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD", IN: "INR", PK: "PKR",
  BD: "BDT", PH: "PHP", ID: "IDR", MY: "MYR", SG: "SGD", JP: "JPY", CN: "CNY",
  KR: "KRW", BR: "BRL", MX: "MXN", AR: "ARS", TR: "TRY", RU: "RUB", UA: "UAH",
  AE: "AED", SA: "SAR", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  CZ: "CZK", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR",
  PT: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
};

function detectLocale() {
  if (typeof navigator === "undefined") return "en-US";
  return navigator.language || "en-US";
}

/**
 * IANA time zone -> region. The browser language is unreliable for location:
 * most phones report "en-US" no matter where the owner actually is, which is
 * why visitors in Lagos were being shown dollars. The device time zone tracks
 * where the person really is, so we read that first and only fall back to the
 * language tag.
 */
const TIMEZONE_REGION: Record<string, string> = {
  "Africa/Lagos": "NG", "Africa/Abidjan": "CI", "Africa/Accra": "GH",
  "Africa/Nairobi": "KE", "Africa/Kampala": "UG", "Africa/Dar_es_Salaam": "TZ",
  "Africa/Johannesburg": "ZA", "Africa/Cairo": "EG", "Africa/Casablanca": "MA",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Paris": "FR",
  "Europe/Berlin": "DE", "Europe/Madrid": "ES", "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL", "Europe/Lisbon": "PT", "Europe/Brussels": "BE",
  "Europe/Vienna": "AT", "Europe/Helsinki": "FI", "Europe/Athens": "GR",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH", "Europe/Warsaw": "PL", "Europe/Prague": "CZ",
  "Europe/Moscow": "RU", "Europe/Kiev": "UA", "Europe/Kyiv": "UA",
  "Europe/Istanbul": "TR", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Karachi": "PK", "Asia/Dhaka": "BD", "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN", "Asia/Manila": "PH", "Asia/Jakarta": "ID",
  "Asia/Kuala_Lumpur": "MY", "Asia/Singapore": "SG", "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN", "Asia/Seoul": "KR",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "America/Argentina/Buenos_Aires": "AR",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU",
  "Australia/Brisbane": "AU", "Pacific/Auckland": "NZ",
};

/** Region from the device time zone, e.g. "Africa/Lagos" -> "NG". */
function regionFromTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return null;
    if (TIMEZONE_REGION[zone]) return TIMEZONE_REGION[zone];
    // Unlisted zone: try the continent so at least Africa/* is not read as USD.
    return null;
  } catch {
    return null;
  }
}

/** Region from the browser language tag, e.g. "en-NG" -> "NG". */
function regionFromLocale(): string | null {
  try {
    const region = new Intl.Locale(detectLocale()).maximize().region;
    return region ?? null;
  } catch {
    const parts = detectLocale().split("-");
    const tail = parts[1];
    return tail && tail.length === 2 ? tail.toUpperCase() : null;
  }
}

function isCurrencyCode(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]{3}$/.test(value);
}

function readStoredCurrency(key: string): string | null {
  try {
    const value = localStorage.getItem(key)?.toUpperCase();
    return isCurrencyCode(value) ? value : null;
  } catch {
    return null;
  }
}

async function detectCurrencyFromIp(): Promise<{ countryCode: string; currency: string } | null> {
  try {
    const response = await fetch(IP_COUNTRY_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const body = (await response.json()) as { country_code?: string };
    const countryCode = body.country_code?.toUpperCase();
    const currency = countryCode ? REGION_CURRENCY[countryCode] : undefined;
    return countryCode && currency ? { countryCode, currency } : null;
  } catch {
    return null;
  }
}

async function resolveCurrency(): Promise<string> {
  const locked = readStoredCurrency(LOCKED_CURRENCY_KEY);
  if (locked) return locked;

  // Read the server-side preference so a saved choice follows the user to another device.
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space"}/api/users/me`, { credentials: "include", cache: "no-store" });
    if (response.ok) {
      const profile = (await response.json()) as { currencyCode?: string | null };
      if (isCurrencyCode(profile.currencyCode)) {
        localStorage.setItem(LOCKED_CURRENCY_KEY, profile.currencyCode);
        return profile.currencyCode;
      }
    }
  } catch {
    // Anonymous visitors and blocked third-party requests continue through local detection.
  }

  const automatic = readStoredCurrency(AUTO_CURRENCY_KEY);
  if (automatic) return automatic;

  const ipResult = await detectCurrencyFromIp();
  if (ipResult) {
    try {
      localStorage.setItem(AUTO_CURRENCY_KEY, ipResult.currency);
      if (!localStorage.getItem(COUNTRY_KEY)) localStorage.setItem(COUNTRY_KEY, ipResult.countryCode);
    } catch {
      /* private mode: continue without persistence */
    }
    void fetch(`${import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space"}/api/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode: ipResult.countryCode }),
    }).catch(() => undefined);
    return ipResult.currency;
  }

  // IP lookup can be blocked or masked by a VPN. Never infer a money unit from a
  // device timezone in that case; USD is the transparent, safe default.
  return BASE_CURRENCY;
}

function readCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RatesCache;
    if (!parsed?.rates || Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function loadRates(): Promise<Record<string, number>> {
  const cached = readCache();
  if (cached) return cached.rates;
  const res = await fetch(RATES_URL);
  if (!res.ok) throw new Error(`Rate lookup failed (${res.status})`);
  const body = (await res.json()) as { result?: string; rates?: Record<string, number> };
  if (body.result !== "success" || !body.rates) throw new Error("Rate lookup returned no rates");
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), rates: body.rates }));
  } catch {
    /* private mode: just skip caching */
  }
  return body.rates;
}

type CurrencyContextValue = {
  /** Currency actually being displayed. */
  currency: string;
  /** Units of `currency` per 1 base unit. 1 when showing the base currency. */
  rate: number;
  /** True once live rates arrived; false means we are showing base currency. */
  ready: boolean;
  /** Format a BASE-currency amount for this visitor. */
  format: (baseAmount: number) => string;
  /** Let the user pin a currency; pass null to go back to auto-detect. */
  setCurrency: (code: string | null) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(BASE_CURRENCY);
  const [rate, setRate] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolveCurrency().then((target) => {
      if (cancelled) return;
      setCurrencyState(target);

      if (target === BASE_CURRENCY) {
        setRate(1);
        setReady(true);
        return;
      }

      loadRates()
      .then((rates) => {
        if (cancelled) return;
        const found = rates[target];
        if (found && Number.isFinite(found)) {
          setRate(found);
          setReady(true);
        } else {
          // Unknown currency: fall back to base rather than showing a wrong number.
          setCurrencyState(BASE_CURRENCY);
          setRate(1);
          setReady(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Rates unavailable: show base currency honestly instead of guessing.
        setCurrencyState(BASE_CURRENCY);
        setRate(1);
        setReady(true);
      });
    }).catch(() => {
      if (!cancelled) {
        setCurrencyState(BASE_CURRENCY);
        setRate(1);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const locale = detectLocale();
    return {
      currency,
      rate,
      ready,
      format: (baseAmount: number) => {
        const amount = (Number(baseAmount) || 0) * rate;
        try {
          return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
          }).format(amount);
        } catch {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: BASE_CURRENCY,
            maximumFractionDigits: 2,
          }).format(Number(baseAmount) || 0);
        }
      },
      setCurrency: (code: string | null) => {
        try {
          if (code) {
            localStorage.setItem(PREF_KEY, code);
            localStorage.setItem(LOCKED_CURRENCY_KEY, code);
          } else {
            localStorage.removeItem(PREF_KEY);
            localStorage.removeItem(LOCKED_CURRENCY_KEY);
          }
        } catch {
          /* ignore */
        }
        window.location.reload();
      },
    };
  }, [currency, rate, ready]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}

/** Convenience hook for the common case: just format a base-currency amount. */
export function useMoney() {
  return useCurrency().format;
}
