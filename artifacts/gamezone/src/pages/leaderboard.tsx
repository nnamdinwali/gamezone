import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Top players by games played.</p>
      </div>

      <div className="divide-y divide-border/60">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))
        ) : leaderboard?.length ? (
          leaderboard.map((entry) => (
            <div key={entry.userId} className="flex items-center gap-3 py-3">
              <span className="w-6 text-center text-sm text-muted-foreground">{entry.rank}</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={entry.avatarUrl || ""} />
                <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
                  {(entry.username || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {entry.username}
              </span>
              <span className="text-sm text-muted-foreground">{entry.gamesPlayed} games</span>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No rankings yet.</p>
        )}
      </div>
    </div>
  );
}
