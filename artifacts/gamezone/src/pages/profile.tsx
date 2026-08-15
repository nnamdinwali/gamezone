import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useGetUserStats, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useCurrency, useMoney, BASE_CURRENCY } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";
import { useManusAuth } from "@/lib/manus-auth";
import { User, Calendar, Gamepad2, Coins, ChevronDown, LogOut } from "lucide-react";

const COUNTRY_CODES = [
  { code: "US", label: "US" },
  { code: "NG", label: "NG" },
  { code: "GH", label: "GH" },
  { code: "KE", label: "KE" },
  { code: "ZA", label: "ZA" },
  { code: "GB", label: "GB" },
  { code: "CA", label: "CA" },
  { code: "AU", label: "AU" },
  { code: "DE", label: "DE" },
  { code: "FR", label: "FR" },
  { code: "IN", label: "IN" },
  { code: "BR", label: "BR" },
  { code: "MX", label: "MX" },
  { code: "JP", label: "JP" },
  { code: "CN", label: "CN" },
];

const CURRENCY_CODES = [
  BASE_CURRENCY,
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "GBP",
  "CAD",
  "AUD",
  "EUR",
  "INR",
  "BRL",
  "MXN",
  "JPY",
  "CNY",
];

const COUNTRY_KEY = "gamezone:country-code";
const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

export function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { logout } = useManusAuth();
  const formatCurrency = useMoney();
  const { currency, setCurrency } = useCurrency();
  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    isError: isCurrentUserError,
    refetch: refetchCurrentUser,
  } = useCurrentUser();

  const routeId = params?.id ? parseInt(params.id, 10) : NaN;
  const id = Number.isFinite(routeId) ? routeId : Number(currentUser?.id ?? 0);

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useGetUserStats(id, {
    query: { enabled: id > 0, retry: 1, refetchOnWindowFocus: false, queryKey: getGetUserStatsQueryKey(id) }
  });

  // The current-user response already contains the complete profile. Using it
  // directly prevents a second user request from trapping this page in loading.
  const user = currentUser;

  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [preferredCurrency, setPreferredCurrency] = useState(currency);
  const [payoutMethods, setPayoutMethods] = useState<string[]>([]);
  const [payoutProfiles, setPayoutProfiles] = useState<Array<{ id: number; method: string; label: string }>>([]);
  const [payoutMethod, setPayoutMethod] = useState("paypal");
  const [payoutDetails, setPayoutDetails] = useState({ accountName: "", email: "", bankName: "", accountNumber: "", iban: "", accountIdentifier: "", phone: "" });

  useEffect(() => {
    if (user?.username) setDisplayName(user.username);
  }, [user?.username]);

  useEffect(() => {
    setPreferredCurrency(currency);
  }, [currency]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/api/payout-methods`, { credentials: "include", cache: "no-store" }).then((response) => response.json()).then((data) => { setPayoutMethods(data.methods || []); setPayoutProfiles(data.profiles || []); setPayoutMethod((data.methods || ["paypal"])[0]); }).catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY);
      const persisted = (user as typeof user & { countryCode?: string | null })?.countryCode;
      if (persisted) setCountryCode(persisted);
      else if (saved) setCountryCode(saved);
    } catch {
      // ignore
    }
  }, [user]);

  if (isCurrentUserLoading || isStatsLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isCurrentUserError || isStatsError || !user || id <= 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Profile temporarily unavailable</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Your authenticated profile is still synchronizing. Retry without leaving this page.</p>
        <button type="button" onClick={() => { void refetchCurrentUser(); void refetchStats(); }} className="mt-6 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:opacity-90">Retry profile</button>
      </div>
    );
  }

  const gamesPlayed = stats?.gamesPlayed ?? 0;
  const totalEarnings = stats?.totalEarnings ?? 0;
  const memberSince = format(new Date(user.createdAt), "M/d/yyyy");
  const avatarInitial = (displayName || user.username || "?").charAt(0).toUpperCase();

  const handleSavePayout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/payout-methods`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ countryCode, method: payoutMethod, details: payoutDetails }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save payout method");
      setPayoutProfiles((current) => [data, ...current]);
      setPayoutDetails({ accountName: "", email: "", bankName: "", accountNumber: "", iban: "", accountIdentifier: "", phone: "" });
      toast({ title: "Payout method saved", description: "You can now select it when requesting a withdrawal." });
    } catch (error) { toast({ title: "Payout method not saved", description: error instanceof Error ? error.message : "Please check the details.", variant: "destructive" }); }
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(COUNTRY_KEY, countryCode);
      const response = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, currencyCode: preferredCurrency }),
      });
      if (!response.ok) throw new Error("Country preference could not be saved");
      if (preferredCurrency !== currency) setCurrency(preferredCurrency);
      toast({ title: "Saved", description: "Your country and profile preferences have been updated." });
    } catch {
      toast({ title: "Error", description: "Could not save your country preference.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <User className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Profile</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Your account details and payout preferences.
        </p>
      </div>

      {/* User Card */}
      <Card className="rounded-3xl border border-border bg-card overflow-hidden">
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="w-20 h-20 rounded-full border-2 border-primary/50 bg-primary/20 text-primary">
            <AvatarImage src={user.avatarUrl || ""} className="rounded-full object-cover" />
            <AvatarFallback className="rounded-full bg-primary text-primary-foreground text-3xl font-bold">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-bold font-heading truncate">{displayName || user.username}</h2>
            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="rounded-2xl border border-border bg-card">
          <CardContent className="p-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Member Since
            </p>
            <p className="text-2xl font-bold font-heading">{memberSince}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card">
          <CardContent className="p-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Games Played
            </p>
            <p className="text-2xl font-bold font-heading">{gamesPlayed}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card">
          <CardContent className="p-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lifetime Earnings
            </p>
            <p className="text-2xl font-bold font-heading">{formatCurrency(totalEarnings)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Details */}
      <Card className="rounded-2xl border border-border bg-card">
        <CardContent className="p-5 space-y-6">
          <h3 className="text-lg font-bold font-heading">Edit details</h3>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm text-muted-foreground font-normal">
              Display name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 bg-input border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode" className="text-sm text-muted-foreground font-normal">
              Country code
            </Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger id="countryCode" className="h-12 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredCurrency" className="text-sm text-muted-foreground font-normal">
              Preferred currency
            </Label>
            <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
              <SelectTrigger id="preferredCurrency" className="h-12 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Detected once from your IP when available. Save a currency to lock your choice across devices.
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider rounded-xl"
          >
            Save changes
          </Button>
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div><h3 className="text-lg font-bold font-heading">Payout methods</h3><p className="text-sm text-muted-foreground">Available for {countryCode}: {payoutMethods.join(", ") || "PayPal"}. No payment is sent automatically.</p></div>
            {payoutProfiles.length > 0 && <div className="space-y-2">{payoutProfiles.map((profile) => <div key={profile.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"><span>{profile.label}</span><span className="text-xs text-muted-foreground">Saved</span></div>)}</div>}
            <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="h-12 w-full rounded-md border border-border bg-input px-3 text-sm">{payoutMethods.map((method) => <option key={method} value={method}>{method === "bank_transfer" ? "Direct bank transfer" : method === "paypal" ? "PayPal" : method === "opay" ? "Opay" : "PalmPay"}</option>)}</select>
            <Input placeholder="Account holder name" value={payoutDetails.accountName} onChange={(event) => setPayoutDetails({ ...payoutDetails, accountName: event.target.value })} />
            {payoutMethod === "paypal" ? <Input type="email" placeholder="PayPal email" value={payoutDetails.email} onChange={(event) => setPayoutDetails({ ...payoutDetails, email: event.target.value })} /> : payoutMethod === "bank_transfer" ? <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Bank name" value={payoutDetails.bankName} onChange={(event) => setPayoutDetails({ ...payoutDetails, bankName: event.target.value })} /><Input placeholder="Account number or IBAN" value={payoutDetails.accountNumber || payoutDetails.iban} onChange={(event) => setPayoutDetails({ ...payoutDetails, accountNumber: event.target.value, iban: event.target.value })} /></div> : <Input placeholder={`${payoutMethod === "opay" ? "Opay" : "PalmPay"} phone or account ID`} value={payoutDetails.accountIdentifier} onChange={(event) => setPayoutDetails({ ...payoutDetails, accountIdentifier: event.target.value, phone: event.target.value })} />}
            <Button type="button" onClick={() => void handleSavePayout()} className="w-full">Save payout method</Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void logout()}
            className="w-full h-12 rounded-xl border-destructive/40 bg-transparent font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
