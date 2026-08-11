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
import { User, Calendar, Gamepad2, Coins, ChevronDown } from "lucide-react";

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

export function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const formatCurrency = useMoney();
  const { currency, setCurrency } = useCurrency();
  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    isError: isCurrentUserError,
  } = useCurrentUser();

  const routeId = params?.id ? parseInt(params.id, 10) : NaN;
  const id = Number.isFinite(routeId) ? routeId : Number(currentUser?.id ?? 0);

  const { data: stats } = useGetUserStats(id, {
    query: { enabled: id > 0, queryKey: getGetUserStatsQueryKey(id) }
  });

  // The current-user response already contains the complete profile. Using it
  // directly prevents a second user request from trapping this page in loading.
  const user = currentUser;

  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [preferredCurrency, setPreferredCurrency] = useState(currency);

  useEffect(() => {
    if (user?.username) setDisplayName(user.username);
  }, [user?.username]);

  useEffect(() => {
    setPreferredCurrency(currency);
  }, [currency]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY);
      if (saved) setCountryCode(saved);
    } catch {
      // ignore
    }
  }, []);

  if (isCurrentUserLoading) {
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

  if (isCurrentUserError || !user || id <= 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Profile unavailable</h2>
      </div>
    );
  }

  const gamesPlayed = stats?.gamesPlayed ?? 0;
  const totalEarnings = stats?.totalEarnings ?? 0;
  const memberSince = format(new Date(user.createdAt), "M/d/yyyy");
  const avatarInitial = (displayName || user.username || "?").charAt(0).toUpperCase();

  const handleSave = () => {
    try {
      localStorage.setItem(COUNTRY_KEY, countryCode);
      if (preferredCurrency !== currency) {
        setCurrency(preferredCurrency);
      } else {
        toast({ title: "Saved", description: "Your profile details have been updated." });
      }
    } catch {
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
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
              Detected automatically from your device — change it any time
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider rounded-xl"
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
