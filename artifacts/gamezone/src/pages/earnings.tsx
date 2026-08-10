import { useState } from "react";
import { 
  useListEarnings, getListEarningsQueryKey, 
  useGetUser, getGetUserQueryKey,
  useRequestWithdrawal 
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
import { formatNumber } from "@/lib/utils";
import { useCurrentUser } from "@/lib/current-user";

export function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useCurrentUser();
  const userId = user?.id;

  const { data: earnings, isLoading: isEarningsLoading, refetch: refetchEarnings } = useListEarnings(
    { userId },
    { query: { enabled: !!userId, queryKey: getListEarningsQueryKey({ userId }) } }
  );

  const withdraw = useRequestWithdrawal();

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount, 10);
    
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    if (user && amount > user.balance) {
      toast({ title: "Insufficient Funds", description: "You cannot withdraw more than your balance.", variant: "destructive" });
      return;
    }

    withdraw.mutate(
      { data: { userId: userId ?? 0, amount } },
      {
        onSuccess: () => {
          toast({ title: "Withdrawal Requested", description: `${formatNumber(amount)} points are being processed.`, variant: "success" });
          setWithdrawAmount("");
          refetchUser();
          refetchEarnings();
        },
        onError: () => {
          toast({ title: "Withdrawal Failed", description: "Something went wrong.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter text-glow-accent">Your Vault</h1>
        <p className="text-muted-foreground">Manage your earnings and withdraw to your wallet.</p>
      </div>

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
                  <span className="text-5xl font-mono font-bold tracking-tighter">{formatNumber(user?.balance || 0)}</span>
                  <span className="text-muted-foreground font-sans text-sm uppercase font-bold ml-1">pts</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                Total lifetime earned: {isUserLoading ? <Skeleton className="w-16 h-4 inline-block" /> : formatNumber(user?.totalEarnings || 0)}
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Withdraw Amount (pts)</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="amount"
                      type="number"
                      min="1"
                      placeholder="1000"
                      className="pl-10 font-mono text-lg h-12"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={withdraw.isPending}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="w-full h-12 text-base"
                  disabled={withdraw.isPending || !withdrawAmount}
                >
                  {withdraw.isPending ? "PROCESSING..." : "REQUEST WITHDRAWAL"} <ArrowDownToLine className="w-4 h-4 ml-2" />
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
                          {isWithdrawal ? '-' : '+'}{formatNumber(earning.amount)}
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
