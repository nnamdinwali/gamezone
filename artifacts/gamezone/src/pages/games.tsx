import { Link } from "wouter";
import { useListGames, getListGamesQueryKey, useListPlaySessions, getListPlaySessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Coins, Users } from "lucide-react";
import { useCurrentUser } from "@/lib/current-user";
import { resolveGameImageUrl } from "@/lib/media";
import { openStoreUrl } from "@/lib/store-links";

export function GamesPage() {
  const { data: currentUser } = useCurrentUser();
  const playerId = currentUser?.id;
  const { data: games = [], isLoading: isGamesLoading } = useListGames(undefined, {
    query: { queryKey: getListGamesQueryKey() },
  });
  const { data: sessions = [], isLoading: isSessionsLoading } = useListPlaySessions(
    playerId ? { userId: playerId } : undefined,
    { query: { enabled: Boolean(playerId), queryKey: getListPlaySessionsQueryKey(playerId ? { userId: playerId } : undefined) } },
  );

  const activeGameIds = new Set(sessions.filter((session) => session.status === "active").map((session) => session.gameId));
  const activeGames = games.filter((game) => activeGameIds.has(game.id));
  const isLoading = isGamesLoading || isSessionsLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter">My Offers</h1>
        <p className="text-muted-foreground">Games you are currently playing appear here.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-4"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-24" /></div>
              </CardContent>
            </Card>
          ))
        ) : activeGames.length ? (
          activeGames.map((game) => {
            const gameWithLinks = game as typeof game & { storeUrl?: string | null; gameUrl?: string | null };
            const storeUrl = typeof gameWithLinks.storeUrl === "string" && /^https?:\/\//i.test(gameWithLinks.storeUrl)
              ? gameWithLinks.storeUrl
              : typeof gameWithLinks.gameUrl === "string" && /^https?:\/\//i.test(gameWithLinks.gameUrl)
                ? gameWithLinks.gameUrl
                : null;
            const card = (
              <Card key={game.id} className="group flex h-full cursor-pointer flex-col overflow-hidden bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:box-glow">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={resolveGameImageUrl(game.thumbnailUrl) || `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`; }}
                  />
                </div>
                <CardContent className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 line-clamp-1 font-heading text-xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">{game.title}</h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-accent"><Coins className="h-4 w-4" />{game.rewardPerMinute} pts/min</div>
                    <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Users className="h-3 w-3" />{game.playCount.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            );
            return storeUrl
              ? <a key={game.id} href={storeUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => openStoreUrl(storeUrl, event)}>{card}</a>
              : <Link key={game.id} href={`/play/${game.id}`}>{card}</Link>;
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/30 py-20 text-center">
            <Gamepad2 className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 font-heading text-xl font-bold uppercase">No active games</h3>
            <p className="text-muted-foreground">Start a game from Earn and it will appear here while you are playing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
