"use strict";
export default `import { useState } from "react";
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
import { formatCurrency, formatNumber } from "@/lib/utils";
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
          toast({ title: "Withdrawal Requested", description: \`\${formatNumber(amount)} points are being processed.\`, variant: "success" });
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
                        <div className={\`w-10 h-10 rounded-full flex items-center justify-center border \${
                          isWithdrawal ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-success/10 border-success/30 text-success'
                        }\`}>
                          {isWithdrawal ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wide text-sm">{isWithdrawal ? 'Withdrawal' : 'Game Reward'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{format(new Date(earning.createdAt), "MMM d, yyyy • h:mm a")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={\`font-mono font-bold text-lg flex items-center gap-1 \${
                          isWithdrawal ? 'text-destructive' : 'text-success'
                        }\`}>
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
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbImVhcm5pbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcXFwicmVhY3RcXFwiO1xcbmltcG9ydCB7IFxcbiAgdXNlTGlzdEVhcm5pbmdzLCBnZXRMaXN0RWFybmluZ3NRdWVyeUtleSwgXFxuICB1c2VHZXRVc2VyLCBnZXRHZXRVc2VyUXVlcnlLZXksXFxuICB1c2VSZXF1ZXN0V2l0aGRyYXdhbCBcXG59IGZyb20gXFxcIkB3b3Jrc3BhY2UvYXBpLWNsaWVudC1yZWFjdFxcXCI7XFxuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2J1dHRvblxcXCI7XFxuaW1wb3J0IHsgQ2FyZCwgQ2FyZENvbnRlbnQsIENhcmRIZWFkZXIsIENhcmRUaXRsZSwgQ2FyZERlc2NyaXB0aW9uIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2NhcmRcXFwiO1xcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2JhZGdlXFxcIjtcXG5pbXBvcnQgeyBTa2VsZXRvbiB9IGZyb20gXFxcIkAvY29tcG9uZW50cy91aS9za2VsZXRvblxcXCI7XFxuaW1wb3J0IHsgSW5wdXQgfSBmcm9tIFxcXCJAL2NvbXBvbmVudHMvdWkvaW5wdXRcXFwiO1xcbmltcG9ydCB7IExhYmVsIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2xhYmVsXFxcIjtcXG5pbXBvcnQgeyB0b2FzdCB9IGZyb20gXFxcIkAvaG9va3MvdXNlLXRvYXN0XFxcIjtcXG5pbXBvcnQgeyBXYWxsZXQsIEFycm93RG93blRvTGluZSwgSGlzdG9yeSwgQ29pbnMsIEFycm93VXBSaWdodCB9IGZyb20gXFxcImx1Y2lkZS1yZWFjdFxcXCI7XFxuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcXFwiZGF0ZS1mbnNcXFwiO1xcbmltcG9ydCB7IGZvcm1hdEN1cnJlbmN5LCBmb3JtYXROdW1iZXIgfSBmcm9tIFxcXCJAL2xpYi91dGlsc1xcXCI7XFxuaW1wb3J0IHsgdXNlQ3VycmVudFVzZXIgfSBmcm9tIFxcXCJAL2xpYi9jdXJyZW50LXVzZXJcXFwiO1xcblxcbmV4cG9ydCBmdW5jdGlvbiBFYXJuaW5nc1BhZ2UoKSB7XFxuICBjb25zdCBbd2l0aGRyYXdBbW91bnQsIHNldFdpdGhkcmF3QW1vdW50XSA9IHVzZVN0YXRlKFxcXCJcXFwiKTtcXG5cXG4gIGNvbnN0IHsgZGF0YTogdXNlciwgaXNMb2FkaW5nOiBpc1VzZXJMb2FkaW5nLCByZWZldGNoOiByZWZldGNoVXNlciB9ID0gdXNlQ3VycmVudFVzZXIoKTtcXG4gIGNvbnN0IHVzZXJJZCA9IHVzZXI/LmlkO1xcblxcbiAgY29uc3QgeyBkYXRhOiBlYXJuaW5ncywgaXNMb2FkaW5nOiBpc0Vhcm5pbmdzTG9hZGluZywgcmVmZXRjaDogcmVmZXRjaEVhcm5pbmdzIH0gPSB1c2VMaXN0RWFybmluZ3MoXFxuICAgIHsgdXNlcklkIH0sXFxuICAgIHsgcXVlcnk6IHsgZW5hYmxlZDogISF1c2VySWQsIHF1ZXJ5S2V5OiBnZXRMaXN0RWFybmluZ3NRdWVyeUtleSh7IHVzZXJJZCB9KSB9IH1cXG4gICk7XFxuXFxuICBjb25zdCB3aXRoZHJhdyA9IHVzZVJlcXVlc3RXaXRoZHJhd2FsKCk7XFxuXFxuICBjb25zdCBoYW5kbGVXaXRoZHJhdyA9IChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUludCh3aXRoZHJhd0Ftb3VudCwgMTApO1xcbiAgICBcXG4gICAgaWYgKGlzTmFOKGFtb3VudCkgfHwgYW1vdW50IDw9IDApIHtcXG4gICAgICB0b2FzdCh7IHRpdGxlOiBcXFwiSW52YWxpZCBBbW91bnRcXFwiLCBkZXNjcmlwdGlvbjogXFxcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGFtb3VudC5cXFwiLCB2YXJpYW50OiBcXFwiZGVzdHJ1Y3RpdmVcXFwiIH0pO1xcbiAgICAgIHJldHVybjtcXG4gICAgfVxcblxcbiAgICBpZiAodXNlciAmJiBhbW91bnQgPiB1c2VyLmJhbGFuY2UpIHtcXG4gICAgICB0b2FzdCh7IHRpdGxlOiBcXFwiSW5zdWZmaWNpZW50IEZ1bmRzXFxcIiwgZGVzY3JpcHRpb246IFxcXCJZb3UgY2Fubm90IHdpdGhkcmF3IG1vcmUgdGhhbiB5b3VyIGJhbGFuY2UuXFxcIiwgdmFyaWFudDogXFxcImRlc3RydWN0aXZlXFxcIiB9KTtcXG4gICAgICByZXR1cm47XFxuICAgIH1cXG5cXG4gICAgd2l0aGRyYXcubXV0YXRlKFxcbiAgICAgIHsgZGF0YTogeyB1c2VySWQ6IHVzZXJJZCA/PyAwLCBhbW91bnQgfSB9LFxcbiAgICAgIHtcXG4gICAgICAgIG9uU3VjY2VzczogKCkgPT4ge1xcbiAgICAgICAgICB0b2FzdCh7IHRpdGxlOiBcXFwiV2l0aGRyYXdhbCBSZXF1ZXN0ZWRcXFwiLCBkZXNjcmlwdGlvbjogYCR7Zm9ybWF0TnVtYmVyKGFtb3VudCl9IHBvaW50cyBhcmUgYmVpbmcgcHJvY2Vzc2VkLmAsIHZhcmlhbnQ6IFxcXCJzdWNjZXNzXFxcIiB9KTtcXG4gICAgICAgICAgc2V0V2l0aGRyYXdBbW91bnQoXFxcIlxcXCIpO1xcbiAgICAgICAgICByZWZldGNoVXNlcigpO1xcbiAgICAgICAgICByZWZldGNoRWFybmluZ3MoKTtcXG4gICAgICAgIH0sXFxuICAgICAgICBvbkVycm9yOiAoKSA9PiB7XFxuICAgICAgICAgIHRvYXN0KHsgdGl0bGU6IFxcXCJXaXRoZHJhd2FsIEZhaWxlZFxcXCIsIGRlc2NyaXB0aW9uOiBcXFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuXFxcIiwgdmFyaWFudDogXFxcImRlc3RydWN0aXZlXFxcIiB9KTtcXG4gICAgICAgIH1cXG4gICAgICB9XFxuICAgICk7XFxuICB9O1xcblxcbiAgcmV0dXJuIChcXG4gICAgPGRpdiBjbGFzc05hbWU9XFxcInNwYWNlLXktOCBhbmltYXRlLWluIGZhZGUtaW4gZHVyYXRpb24tNTAwXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwic3BhY2UteS0yXFxcIj5cXG4gICAgICAgIDxoMSBjbGFzc05hbWU9XFxcInRleHQtNHhsIGZvbnQtYm9sZCBmb250LWhlYWRpbmcgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0ZXIgdGV4dC1nbG93LWFjY2VudFxcXCI+WW91ciBWYXVsdDwvaDE+XFxuICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtbXV0ZWQtZm9yZWdyb3VuZFxcXCI+TWFuYWdlIHlvdXIgZWFybmluZ3MgYW5kIHdpdGhkcmF3IHRvIHlvdXIgd2FsbGV0LjwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMyBnYXAtOFxcXCI+XFxuICAgICAgICB7LyogQmFsYW5jZSBDYXJkICovfVxcbiAgICAgICAgPENhcmQgY2xhc3NOYW1lPVxcXCJsZzpjb2wtc3Bhbi0xIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tY2FyZCB0by1jYXJkLzUwIGJvcmRlci1hY2NlbnQvMjAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGgtZml0XFxcIj5cXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgcC04IG9wYWNpdHktMTBcXFwiPlxcbiAgICAgICAgICAgIDxXYWxsZXQgY2xhc3NOYW1lPVxcXCJ3LTMyIGgtMzJcXFwiIC8+XFxuICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICA8Q2FyZEhlYWRlcj5cXG4gICAgICAgICAgICA8Q2FyZFRpdGxlIGNsYXNzTmFtZT1cXFwidGV4dC1sZyB0ZXh0LW11dGVkLWZvcmVncm91bmQgdHJhY2tpbmctd2lkZXN0IGZvbnQtc2FucyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlxcXCI+XFxuICAgICAgICAgICAgICA8V2FsbGV0IGNsYXNzTmFtZT1cXFwidy01IGgtNSB0ZXh0LWFjY2VudFxcXCIgLz4gQXZhaWxhYmxlIEJhbGFuY2VcXG4gICAgICAgICAgICA8L0NhcmRUaXRsZT5cXG4gICAgICAgICAgPC9DYXJkSGVhZGVyPlxcbiAgICAgICAgICA8Q2FyZENvbnRlbnQgY2xhc3NOYW1lPVxcXCJzcGFjZS15LTggcmVsYXRpdmUgei0xMFxcXCI+XFxuICAgICAgICAgICAgPGRpdj5cXG4gICAgICAgICAgICAgIHtpc1VzZXJMb2FkaW5nID8gKFxcbiAgICAgICAgICAgICAgICA8U2tlbGV0b24gY2xhc3NOYW1lPVxcXCJoLTE2IHctNDhcXFwiIC8+XFxuICAgICAgICAgICAgICApIDogKFxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleCBpdGVtcy1iYXNlbGluZSBnYXAtMiB0ZXh0LWdsb3ctYWNjZW50IHRleHQtYWNjZW50XFxcIj5cXG4gICAgICAgICAgICAgICAgICA8Q29pbnMgY2xhc3NOYW1lPVxcXCJ3LTggaC04XFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwidGV4dC01eGwgZm9udC1tb25vIGZvbnQtYm9sZCB0cmFja2luZy10aWdodGVyXFxcIj57Zm9ybWF0TnVtYmVyKHVzZXI/LmJhbGFuY2UgfHwgMCl9PC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvbnQtc2FucyB0ZXh0LXNtIHVwcGVyY2FzZSBmb250LWJvbGQgbWwtMVxcXCI+cHRzPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICl9XFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTIgZm9udC1tb25vXFxcIj5cXG4gICAgICAgICAgICAgICAgVG90YWwgbGlmZXRpbWUgZWFybmVkOiB7aXNVc2VyTG9hZGluZyA/IDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMTYgaC00IGlubGluZS1ibG9ja1xcXCIgLz4gOiBmb3JtYXROdW1iZXIodXNlcj8udG90YWxFYXJuaW5ncyB8fCAwKX1cXG4gICAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicHQtNiBib3JkZXItdCBib3JkZXItYm9yZGVyXFxcIj5cXG4gICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVXaXRoZHJhd30gY2xhc3NOYW1lPVxcXCJzcGFjZS15LTRcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwic3BhY2UteS0yXFxcIj5cXG4gICAgICAgICAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cXFwiYW1vdW50XFxcIiBjbGFzc05hbWU9XFxcInVwcGVyY2FzZSB0ZXh0LXhzIGZvbnQtYm9sZCB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiPldpdGhkcmF3IEFtb3VudCAocHRzKTwvTGFiZWw+XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInJlbGF0aXZlXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxDb2lucyBjbGFzc05hbWU9XFxcImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdy00IGgtNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8SW5wdXQgXFxuICAgICAgICAgICAgICAgICAgICAgIGlkPVxcXCJhbW91bnRcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XFxcIm51bWJlclxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgbWluPVxcXCIxXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cXFwiMTAwMFxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJwbC0xMCBmb250LW1vbm8gdGV4dC1sZyBoLTEyXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17d2l0aGRyYXdBbW91bnR9XFxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0V2l0aGRyYXdBbW91bnQoZS50YXJnZXQudmFsdWUpfVxcbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17d2l0aGRyYXcuaXNQZW5kaW5nfVxcbiAgICAgICAgICAgICAgICAgICAgLz5cXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDxCdXR0b24gXFxuICAgICAgICAgICAgICAgICAgdHlwZT1cXFwic3VibWl0XFxcIiBcXG4gICAgICAgICAgICAgICAgICB2YXJpYW50PVxcXCJhY2NlbnRcXFwiIFxcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwidy1mdWxsIGgtMTIgdGV4dC1iYXNlXFxcIlxcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt3aXRoZHJhdy5pc1BlbmRpbmcgfHwgIXdpdGhkcmF3QW1vdW50fVxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAge3dpdGhkcmF3LmlzUGVuZGluZyA/IFxcXCJQUk9DRVNTSU5HLi4uXFxcIiA6IFxcXCJSRVFVRVNUIFdJVEhEUkFXQUxcXFwifSA8QXJyb3dEb3duVG9MaW5lIGNsYXNzTmFtZT1cXFwidy00IGgtNCBtbC0yXFxcIiAvPlxcbiAgICAgICAgICAgICAgICA8L0J1dHRvbj5cXG4gICAgICAgICAgICAgIDwvZm9ybT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPC9DYXJkQ29udGVudD5cXG4gICAgICAgIDwvQ2FyZD5cXG5cXG4gICAgICAgIHsvKiBUcmFuc2FjdGlvbiBIaXN0b3J5ICovfVxcbiAgICAgICAgPENhcmQgY2xhc3NOYW1lPVxcXCJsZzpjb2wtc3Bhbi0yIGZsZXggZmxleC1jb2xcXFwiPlxcbiAgICAgICAgICA8Q2FyZEhlYWRlciBjbGFzc05hbWU9XFxcImJvcmRlci1iIGJvcmRlci1ib3JkZXIgYmctbXV0ZWQvMjBcXFwiPlxcbiAgICAgICAgICAgIDxDYXJkVGl0bGUgY2xhc3NOYW1lPVxcXCJ0ZXh0LXhsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXFxcIj5cXG4gICAgICAgICAgICAgIDxIaXN0b3J5IGNsYXNzTmFtZT1cXFwidy01IGgtNSB0ZXh0LXByaW1hcnlcXFwiIC8+IFRyYW5zYWN0aW9uIEhpc3RvcnlcXG4gICAgICAgICAgICA8L0NhcmRUaXRsZT5cXG4gICAgICAgICAgICA8Q2FyZERlc2NyaXB0aW9uPllvdXIgcmVjZW50IGdhbWVwbGF5IHJld2FyZHMgYW5kIHdpdGhkcmF3YWxzLjwvQ2FyZERlc2NyaXB0aW9uPlxcbiAgICAgICAgICA8L0NhcmRIZWFkZXI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudCBjbGFzc05hbWU9XFxcInAtMCBmbGV4LTFcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJkaXZpZGUteSBkaXZpZGUtYm9yZGVyXFxcIj5cXG4gICAgICAgICAgICAgIHtpc0Vhcm5pbmdzTG9hZGluZyA/IChcXG4gICAgICAgICAgICAgICAgQXJyYXkoNSkuZmlsbCgwKS5tYXAoKF8sIGkpID0+IChcXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVxcXCJwLTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4IGdhcC00IGl0ZW1zLWNlbnRlclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMTAgaC0xMCByb3VuZGVkLWZ1bGxcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJzcGFjZS15LTJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMzIgaC00XFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMjQgaC0zXFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPFNrZWxldG9uIGNsYXNzTmFtZT1cXFwidy0yMCBoLTZcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICkpXFxuICAgICAgICAgICAgICApIDogZWFybmluZ3M/Lmxlbmd0aCA/IChcXG4gICAgICAgICAgICAgICAgZWFybmluZ3MubWFwKChlYXJuaW5nKSA9PiB7XFxuICAgICAgICAgICAgICAgICAgY29uc3QgaXNXaXRoZHJhd2FsID0gZWFybmluZy50eXBlID09PSAnd2l0aGRyYXdhbCc7XFxuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtlYXJuaW5nLmlkfSBjbGFzc05hbWU9XFxcInAtNCBzbTpwLTYgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGhvdmVyOmJnLW11dGVkLzMwIHRyYW5zaXRpb24tY29sb3JzXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImZsZXggZ2FwLTQgaXRlbXMtY2VudGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHctMTAgaC0xMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYm9yZGVyICR7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1dpdGhkcmF3YWwgPyAnYmctZGVzdHJ1Y3RpdmUvMTAgYm9yZGVyLWRlc3RydWN0aXZlLzMwIHRleHQtZGVzdHJ1Y3RpdmUnIDogJ2JnLXN1Y2Nlc3MvMTAgYm9yZGVyLXN1Y2Nlc3MvMzAgdGV4dC1zdWNjZXNzJ1xcbiAgICAgICAgICAgICAgICAgICAgICAgIH1gfT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtpc1dpdGhkcmF3YWwgPyA8QXJyb3dEb3duVG9MaW5lIGNsYXNzTmFtZT1cXFwidy01IGgtNVxcXCIgLz4gOiA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cXFwidy01IGgtNVxcXCIgLz59XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cXFwiZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIHRleHQtc21cXFwiPntpc1dpdGhkcmF3YWwgPyAnV2l0aGRyYXdhbCcgOiAnR2FtZSBSZXdhcmQnfTwvcD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9udC1tb25vXFxcIj57Zm9ybWF0KG5ldyBEYXRlKGVhcm5pbmcuY3JlYXRlZEF0KSwgXFxcIk1NTSBkLCB5eXl5IOKAoiBoOm1tIGFcXFwiKX08L3A+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICBcXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImZsZXggaXRlbXMtY2VudGVyIGdhcC00XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGZvbnQtbW9ubyBmb250LWJvbGQgdGV4dC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSAke1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNXaXRoZHJhd2FsID8gJ3RleHQtZGVzdHJ1Y3RpdmUnIDogJ3RleHQtc3VjY2VzcydcXG4gICAgICAgICAgICAgICAgICAgICAgICB9YH0+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7aXNXaXRoZHJhd2FsID8gJy0nIDogJysnfXtmb3JtYXROdW1iZXIoZWFybmluZy5hbW91bnQpfVxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxCYWRnZSB2YXJpYW50PXtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVhcm5pbmcuc3RhdHVzID09PSAnY29tcGxldGVkJyA/ICdzdWNjZXNzJyA6IFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZWFybmluZy5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICdvdXRsaW5lJyA6ICdkZXN0cnVjdGl2ZSdcXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNsYXNzTmFtZT1cXFwiaGlkZGVuIHNtOmlubGluZS1mbGV4IHRleHQtWzEwcHhdXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtlYXJuaW5nLnN0YXR1c31cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JhZGdlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICk7XFxuICAgICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgICApIDogKFxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicC0xMiB0ZXh0LWNlbnRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiPlxcbiAgICAgICAgICAgICAgICAgIE5vIHRyYW5zYWN0aW9ucyBmb3VuZC4gU3RhcnQgcGxheWluZyBnYW1lcyB0byBlYXJuIVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICl9XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDwvQ2FyZENvbnRlbnQ+XFxuICAgICAgICA8L0NhcmQ+XFxuICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgKTtcXG59XFxuXCIiXSwiZmlsZSI6Ii9ob21lL3J1bm5lci93b3Jrc3BhY2UvYXJ0aWZhY3RzL2dhbWV6b25lL3NyYy9wYWdlcy9lYXJuaW5ncy50c3gifQ==