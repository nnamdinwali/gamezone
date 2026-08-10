import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Coins, Gamepad2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 py-8 border-b border-border/50">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading uppercase tracking-tighter text-glow-primary">Global Leaderboard</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The elite. The dedicated. The top earners on Rockcity Games. Play more to climb the ranks and secure your legacy.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2 text-right">Games Played</div>
          <div className="col-span-3 text-right">Total Earnings</div>
        </div>

        {/* List */}
        {isLoading ? (
          Array(10).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-card/50 flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-32 h-5" />
              </div>
              <Skeleton className="w-24 h-6" />
            </Card>
          ))
        ) : leaderboard?.length ? (
          leaderboard.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <Card 
                key={entry.userId} 
                className={`p-4 md:p-0 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                  entry.rank === 1 ? 'border-primary shadow-[0_0_30px_-10px_hsl(var(--primary))]' : 
                  entry.rank === 2 ? 'border-accent shadow-[0_0_20px_-10px_hsl(var(--accent))]' :
                  entry.rank === 3 ? 'border-secondary shadow-[0_0_20px_-10px_hsl(var(--secondary))]' : ''
                }`}
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4">
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center font-heading text-2xl md:text-xl font-bold text-muted-foreground">
                    {entry.rank === 1 ? <Medal className="w-8 h-8 text-primary" /> :
                     entry.rank === 2 ? <Medal className="w-7 h-7 text-accent" /> :
                     entry.rank === 3 ? <Medal className="w-6 h-6 text-secondary" /> :
                     `#${entry.rank}`}
                  </div>
                  
                  {/* Player */}
                  <div className="col-span-6 flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                    <Avatar className={`w-12 h-12 md:w-10 md:h-10 border-2 ${
                      entry.rank === 1 ? 'border-primary' : 
                      entry.rank === 2 ? 'border-accent' :
                      entry.rank === 3 ? 'border-secondary' : 'border-border'
                    }`}>
                      <AvatarImage src={entry.avatarUrl || ''} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={`font-bold text-lg md:text-base ${isTop3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {entry.username}
                    </span>
                  </div>

                  {/* Mobile divider */}
                  <div className="w-full h-px bg-border md:hidden my-2" />

                  {/* Games Played */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end w-full md:w-auto text-sm text-muted-foreground font-mono">
                    <span className="md:hidden uppercase text-xs font-bold">Games</span>
                    <span className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 md:hidden" /> {formatNumber(entry.gamesPlayed)}</span>
                  </div>

                  {/* Earnings */}
                  <div className="col-span-3 flex items-center justify-between md:justify-end w-full md:w-auto">
                    <span className="md:hidden uppercase text-xs font-bold text-muted-foreground">Earnings</span>
                    <span className={`font-mono font-bold text-lg md:text-xl flex items-center gap-2 ${
                      entry.rank === 1 ? 'text-primary text-glow-primary' : 
                      entry.rank === 2 ? 'text-accent text-glow-accent' :
                      entry.rank === 3 ? 'text-secondary' : 'text-foreground'
                    }`}>
                      <Coins className="w-4 h-4 md:w-5 md:h-5" />
                      {formatNumber(entry.totalEarnings)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl border-border">
            No leaderboard data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
