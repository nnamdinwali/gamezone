import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown } from "lucide-react";
import { useMoney } from "@/lib/currency";
import { 
  useGetUserStats, 
  getGetUserStatsQueryKey, 
  useGetLeaderboard, 
  getGetLeaderboardQueryKey 
} from "@workspace/api-client-react";
import { useCurrentUser } from "@/lib/current-user";

export function HomePage() {
  const formatCurrency = useMoney();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const userId = user?.id;

  const { data: stats, isLoading: isStatsLoading } = useGetUserStats(userId ?? 0, {
    query: { enabled: !!userId, queryKey: getGetUserStatsQueryKey(userId ?? 0) }
  });

  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() }
  });

  const progress = Math.min((stats?.gamesPlayed || 0) * 5, 100) || 0; // Simple calc for visual progress

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-[#107033] border-none text-primary-foreground overflow-hidden rounded-[2rem] relative shadow-lg">
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <p className="text-primary-foreground/80 text-xs md:text-sm font-semibold uppercase tracking-wider">Available Balance</p>
            {isUserLoading ? (
              <Skeleton className="h-14 w-48 bg-primary-foreground/20 rounded-xl" />
            ) : (
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">{formatCurrency(user?.balance || 0)}</h2>
            )}
            <Link href="/earnings">
              <Button variant="outline" className="rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-medium px-8 h-12 mt-2">
                Withdraw <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between gap-6 md:gap-8 bg-black/15 p-6 rounded-3xl backdrop-blur-sm w-full md:w-auto border border-white/10">
            <div className="space-y-1">
              <p className="text-primary-foreground/70 text-[10px] md:text-xs font-semibold uppercase tracking-wide">Total Earned</p>
              {isUserLoading ? (
                <Skeleton className="h-7 w-24 bg-primary-foreground/20 rounded-md" />
              ) : (
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(user?.totalEarnings || 0)}</p>
              )}
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="space-y-1">
              <p className="text-primary-foreground/70 text-[10px] md:text-xs font-semibold uppercase tracking-wide">Total Withdrawn</p>
              {isUserLoading ? (
                <Skeleton className="h-7 w-24 bg-primary-foreground/20 rounded-md" />
              ) : (
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(Math.max((user?.totalEarnings || 0) - (user?.balance || 0), 0))}</p>
              )}
            </div>
          </div>
        </CardContent>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      </Card>

      {/* Account Progress Card */}
      <Card className="bg-card border-border rounded-3xl shadow-sm overflow-hidden relative">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            {isStatsLoading ? (
              <Skeleton className="w-32 h-32 rounded-full" />
            ) : (
              <>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-muted fill-none" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * progress / 100)} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold">{progress}%</span>
                </div>
              </>
            )}
          </div>
          <div className="space-y-3 flex-1 text-center md:text-left w-full">
            <h3 className="text-xl font-bold">Account Progress</h3>
            <p className="text-muted-foreground text-sm">Start playing games to earn! Complete games to level up your account and increase your earning potential.</p>
            <div className="w-full bg-muted h-2.5 rounded-full mt-4 overflow-hidden border border-border">
              <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium text-right mt-1">{progress}% Complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Leaderboard */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
               <Crown className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Weekly Leaderboard</h2>
          </div>
          <Badge variant="outline" className="text-primary border-primary bg-primary/10 px-3 py-1 font-bold text-xs">
            WEEKLY
          </Badge>
        </div>

        {isLeaderboardLoading ? (
          <div className="h-[280px] flex items-end justify-center gap-4">
            <Skeleton className="w-1/3 h-48 rounded-t-2xl" />
            <Skeleton className="w-1/3 h-64 rounded-t-3xl" />
            <Skeleton className="w-1/3 h-40 rounded-t-2xl" />
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="flex items-end justify-center gap-3 md:gap-6 mt-12 h-[280px] max-w-4xl mx-auto px-2">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="w-1/3 flex flex-col items-center group relative z-10 animate-in slide-in-from-bottom-4 duration-500 delay-100 h-[75%]">
                <div className="relative mb-4">
                  <Avatar className="w-14 h-14 md:w-16 md:h-16 border-4 border-card shadow-lg ring-2 ring-border">
                    <AvatarImage src={leaderboard[1].avatarUrl} />
                    <AvatarFallback>{leaderboard[1].username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full shadow-sm">2</div>
                </div>
                <div className="bg-card border-x border-t border-border rounded-t-2xl w-full flex-1 flex flex-col items-center pt-8 pb-4 relative overflow-hidden transition-colors shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50 pointer-events-none" />
                  <p className="font-bold text-foreground truncate w-full px-2 text-center text-xs md:text-sm">{leaderboard[1].username}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 font-semibold">
                    {leaderboard[1].gamesPlayed} plays
                  </Badge>
                  <p className="text-primary font-mono text-sm font-bold mt-auto drop-shadow-sm">{formatCurrency(leaderboard[1].totalEarnings)}</p>
                </div>
              </div>
            )}
            
            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="w-[38%] md:w-1/3 flex flex-col items-center group relative z-20 animate-in slide-in-from-bottom-8 duration-700 h-full">
                <div className="relative mb-5 md:mb-6">
                  <Crown className="w-8 h-8 text-primary absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-md" strokeWidth={2.5} />
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-card shadow-xl ring-4 ring-primary">
                    <AvatarImage src={leaderboard[0].avatarUrl} />
                    <AvatarFallback>{leaderboard[0].username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full shadow-lg">1</div>
                </div>
                <div className="bg-gradient-to-b from-primary/10 to-card border-x border-t border-primary/30 rounded-t-[2rem] w-full flex-1 flex flex-col items-center pt-10 pb-4 relative overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-30 pointer-events-none" />
                  <p className="font-bold text-foreground text-sm md:text-base truncate w-full px-2 text-center">{leaderboard[0].username}</p>
                  <Badge className="mt-2 text-[10px] md:text-xs bg-primary text-primary-foreground px-2 py-0.5 font-bold">
                    {leaderboard[0].gamesPlayed} plays
                  </Badge>
                  <p className="text-primary font-mono text-base md:text-lg font-bold mt-auto drop-shadow-sm">{formatCurrency(leaderboard[0].totalEarnings)}</p>
                </div>
              </div>
            )}
            
            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="w-1/3 flex flex-col items-center group relative z-10 animate-in slide-in-from-bottom-4 duration-500 delay-200 h-[65%]">
                <div className="relative mb-4">
                  <Avatar className="w-14 h-14 md:w-16 md:h-16 border-4 border-card shadow-lg ring-2 ring-border">
                    <AvatarImage src={leaderboard[2].avatarUrl} />
                    <AvatarFallback>{leaderboard[2].username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full shadow-sm">3</div>
                </div>
                <div className="bg-card border-x border-t border-border rounded-t-2xl w-full flex-1 flex flex-col items-center pt-8 pb-4 relative overflow-hidden transition-colors shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50 pointer-events-none" />
                  <p className="font-bold text-foreground truncate w-full px-2 text-center text-xs md:text-sm">{leaderboard[2].username}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 font-semibold">
                    {leaderboard[2].gamesPlayed} plays
                  </Badge>
                  <p className="text-primary font-mono text-sm font-bold mt-auto drop-shadow-sm">{formatCurrency(leaderboard[2].totalEarnings)}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl border-border bg-card/30">
            No leaderboard data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
