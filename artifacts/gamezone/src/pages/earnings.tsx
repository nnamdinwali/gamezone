import { useEffect, useState } from "react";
import { 
  useListEarnings, getListEarningsQueryKey, 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { EmptyState } from "@/components/empty-state";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";
import { apiFetch, apiFetchJson } from "@/lib/api-fetch";
import { CASHOUT_TARGET } from "@/pages/home";

export function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethods, setPayoutMethods] = useState<string[]>([]);
  const [payoutProfiles, setPayoutProfiles] = useState<Array<{ id: number; method: string; label: string; maskedDetails: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  // Balances are stored in the base currency; the visitor sees their local one.
  const { currency, rate, format: formatMoney } = useCurrency();

  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useCurrentUser();
  const userId = user?.id;
  const bannedUser = user as (typeof user & { bannedAt?: string | null; banReason?: string | null }) | undefined;
  const isBanned = Boolean(bannedUser?.bannedAt);

  const { data: earnings, isLoading: isEarningsLoading, refetch: refetchEarnings } = useListEarnings(
    { userId },
    { query: { enabled: !!userId, queryKey: getListEarningsQueryKey({ userId }) } }
  );

  useEffect(() => {
    if (!userId) return;
    apiFetch("/api/payout-methods", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load payout methods")))
      .then((data) => { setPayoutMethods(data.methods || []); setPayoutProfiles(data.profiles || []); setSelectedProfileId((current) => current || String(data.profiles?.[0]?.id || "")); })
      .catch(() => undefined);
  }, [userId]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    // The field is typed in the visitor's local currency: convert back to the
    // base currency before it ever touches a balance.
    const localAmount = parseFloat(withdrawAmount);
    const amount = Math.round((localAmount / (rate || 1)) * 100) / 100;

    if (isBanned) {
      toast({ title: "Account Banned", description: "Earnings and withdrawals are unavailable while your account is banned.", variant: "destructive" });
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    if (amount < CASHOUT_TARGET) {
      toast({ title: "Below minimum", description: `The minimum withdrawal is ${formatMoney(CASHOUT_TARGET)}.`, variant: "destructive" });
      return;
    }

    if (!selectedProfileId) {
      toast({ title: "Payout method required", description: "Save a payout method in your profile before requesting a withdrawal.", variant: "destructive" });
      return;
    }

    if (user && amount > user.balance) {
      toast({ title: "Insufficient Funds", description: "You cannot withdraw more than your balance.", variant: "destructive" });
      return;
    }

    setIsSubmittingWithdrawal(true);
    apiFetch("/api/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, payoutProfileId: Number(selectedProfileId) }) })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || data.error || "Withdrawal failed"); return data; })
      .then(() => { toast({ title: "Withdrawal Requested", description: `${formatMoney(amount)} is pending owner review. No payment has been sent yet.`, variant: "success" }); setWithdrawAmount(""); void refetchUser(); void refetchEarnings(); })
      .catch((error: Error) => toast({ title: error.message.includes("banned") ? "Account Banned" : "Withdrawal Failed", description: error.message, variant: "destructive" }))
      .finally(() => setIsSubmittingWithdrawal(false));
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Cashout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Balance and withdrawals.</p>
      </div>

      {isBanned && (
        <section role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100">
          <p className="font-medium">Withdrawals unavailable</p>
          <p className="mt-1 text-red-100/80">
            Your account is restricted.
            {bannedUser?.banReason ? ` Reason: ${bannedUser.banReason}` : ""}
          </p>
        </section>
      )}

      <section className="space-y-5">
        <div>
          {isUserLoading ? (
            <Skeleton className="h-10 w-36" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatMoney(user?.balance || 0)}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Lifetime: {isUserLoading ? "—" : formatMoney(user?.totalEarnings || 0)}
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutProfile" className="text-xs font-medium text-muted-foreground">
              Payout method
            </Label>
            {payoutProfiles.length ? (
              <select
                id="payoutProfile"
                value={selectedProfileId}
                onChange={(event) => setSelectedProfileId(event.target.value)}
                disabled={isBanned}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Select saved method</option>
                {payoutProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label || profile.maskedDetails}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No saved payout method yet — add one from your profile.
                {payoutMethods.length ? ` Available: ${payoutMethods.join(", ")}.` : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
              Withdraw amount ({currency})
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="h-11 font-mono"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isBanned || isSubmittingWithdrawal}
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isBanned || isSubmittingWithdrawal || !withdrawAmount}
          >
            {isBanned
              ? "Withdrawal locked"
              : isSubmittingWithdrawal
                ? "Submitting…"
                : "Request withdrawal"}
          </Button>
        </form>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Transaction history</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Recent rewards and withdrawals.</p>
        </div>

        <div className="divide-y divide-border/60">
          {isEarningsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : earnings?.length ? (
            earnings.map((earning) => {
              const isWithdrawal = earning.type === "withdrawal";
              return (
                <div key={earning.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {isWithdrawal ? "Withdrawal" : "Reward"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(earning.createdAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono text-sm font-medium ${
                        isWithdrawal ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {isWithdrawal ? "-" : "+"}
                      {formatMoney(earning.amount)}
                    </p>
                    <p className="text-[11px] capitalize text-muted-foreground">{earning.status}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No transactions"
              message="Rewards and withdrawals will show up here."
            />
          )}
        </div>
      </section>
    </div>
  );
}
