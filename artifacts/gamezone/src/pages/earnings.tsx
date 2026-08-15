import { useEffect, useState } from "react";
import { 
  useListEarnings, getListEarningsQueryKey, 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Wallet, ArrowDownToLine, History, Coins, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";

export function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethods, setPayoutMethods] = useState<string[]>([]);
  const [payoutProfiles, setPayoutProfiles] = useState<Array<{ id: number; method: string; label: string; maskedDetails: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");
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
    fetch(`${API_BASE}/api/payout-methods`, { credentials: "include", cache: "no-store" })
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

    if (!selectedProfileId) {
      toast({ title: "Payout method required", description: "Save a payout method in your profile before requesting a withdrawal.", variant: "destructive" });
      return;
    }

    if (user && amount > user.balance) {
      toast({ title: "Insufficient Funds", description: "You cannot withdraw more than your balance.", variant: "destructive" });
      return;
    }

    setIsSubmittingWithdrawal(true);
    fetch(`${API_BASE}/api/withdrawals`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, payoutProfileId: Number(selectedProfileId) }) })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || data.error || "Withdrawal failed"); return data; })
      .then(() => { toast({ title: "Withdrawal Requested", description: `${formatMoney(amount)} is pending owner review. No payment has been sent yet.`, variant: "success" }); setWithdrawAmount(""); void refetchUser(); void refetchEarnings(); })
      .catch((error: Error) => toast({ title: error.message.includes("banned") ? "Account Banned" : "Withdrawal Failed", description: error.message, variant: "destructive" }))
      .finally(() => setIsSubmittingWithdrawal(false));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter text-glow-accent">Your Vault</h1>
        <p className="text-muted-foreground">Manage your earnings and withdraw to your wallet.</p>
      </div>

      {isBanned && (
        <section role="alert" className="rounded-2xl border-2 border-red-500/80 bg-red-950/70 p-5 text-red-100 shadow-[0_0_28px_rgba(239,68,68,.18)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Account restricted</p>
          <h2 className="mt-2 text-xl font-bold">Withdrawals are unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-red-100/90">Your GameZone account has been banned, so you cannot access earnings or request a withdrawal. {bannedUser?.banReason ? `Reason: ${bannedUser.banReason}` : "Please contact support if you believe this is a mistake."}</p>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-card to-card/50 border-accent/20 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground tracking-widest font-sans flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative z-10">
            <div>
              {isUserLoading ? (
                <Skeleton className="h-16 w-48" />
              ) : (
                <div className="flex items-baseline gap-2 text-glow-accent text-accent">
                  <Coins className="w-8 h-8" />
                  <span className="text-5xl font-mono font-bold tracking-tighter">{formatMoney(user?.balance || 0)}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                Total lifetime earned: {isUserLoading ? <Skeleton className="w-16 h-4 inline-block" /> : formatMoney(user?.totalEarnings || 0)}
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payoutProfile" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Payout method</Label>
                  {payoutProfiles.length ? <select id="payoutProfile" value={selectedProfileId} onChange={(event) => setSelectedProfileId(event.target.value)} disabled={isBanned} className="h-12 w-full rounded-md border border-border bg-input px-3 text-sm"><option value="">Select saved method</option>{payoutProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label || profile.maskedDetails}</option>)}</select> : <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">No saved payout method. Add one from your Profile page. Available here: {payoutMethods.join(", ") || "PayPal"}.</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Withdraw Amount ({currency})</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10 font-mono text-lg h-12"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={isBanned || isSubmittingWithdrawal}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="w-full h-12 text-base"
                  disabled={isBanned || isSubmittingWithdrawal || !withdrawAmount}
                >
                  {isBanned ? "WITHDRAWAL LOCKED" : isSubmittingWithdrawal ? "PROCESSING..." : "REQUEST WITHDRAWAL"} <ArrowDownToLine className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-xl flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Transaction History
            </CardTitle>
            <CardDescription>Your recent gameplay rewards and withdrawals.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border">
              {isEarningsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-24 h-3" />
                      </div>
                    </div>
                    <Skeleton className="w-20 h-6" />
                  </div>
                ))
              ) : earnings?.length ? (
                earnings.map((earning) => {
                  const isWithdrawal = earning.type === 'withdrawal';
                  return (
                    <div key={earning.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          isWithdrawal ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-success/10 border-success/30 text-success'
                        }`}>
                          {isWithdrawal ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wide text-sm">{isWithdrawal ? 'Withdrawal' : 'Game Reward'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{format(new Date(earning.createdAt), "MMM d, yyyy • h:mm a")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`font-mono font-bold text-lg flex items-center gap-1 ${
                          isWithdrawal ? 'text-destructive' : 'text-success'
                        }`}>
                          {isWithdrawal ? '-' : '+'}{formatMoney(earning.amount)}
                        </div>
                        
                        <Badge variant={
                          earning.status === 'completed' ? 'success' : 
                          earning.status === 'pending' ? 'outline' : 'destructive'
                        } className="hidden sm:inline-flex text-[10px]">
                          {earning.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No transactions found. Start playing games to earn!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
