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

function detectCurrency(): string {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(PREF_KEY) : null;
  if (saved) return saved;
  try {
    const region = new Intl.Locale(detectLocale()).maximize().region;
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  } catch {
    /* older browsers: fall through to base */
  }
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
    const target = detectCurrency();
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
          if (code) localStorage.setItem(PREF_KEY, code);
          else localStorage.removeItem(PREF_KEY);
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
