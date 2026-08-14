import { useRoute, Link } from "wouter";
import { useGetGame, getGetGameQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Coins, Users, Star, ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export function GameDetailPage() {
  const [, params] = useRoute("/games/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: game, isLoading, error } = useGetGame(id, {
    query: {
      enabled: !!id,
      queryKey: getGetGameQueryKey(id)
    }
  });

  const handlePlayAndEarn = () => {
    if (!game) return;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const storeUrl = /iphone|ipad|ipod/.test(userAgent)
      ? game.iosStoreUrl || game.androidStoreUrl
      : game.androidStoreUrl || game.iosStoreUrl;

    if (storeUrl) {
      window.location.assign(storeUrl);
      return;
    }

    window.location.assign(`/play/${game.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-32 h-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-video rounded-3xl" />
            <Skeleton className="w-3/4 h-12" />
            <Skeleton className="w-full h-24" />
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-3xl" />
            <Skeleton className="w-full h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading">Game Not Found</h2>
        <p className="text-muted-foreground">The game you're looking for doesn't exist or has been removed.</p>
        <Link href="/games">
          <Button variant="outline">Back to Games</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/games">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Game Cover */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border group">
            <img 
              src={game.thumbnailUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`} 
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <Badge variant="secondary" className="mb-3">{game.genre}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-heading uppercase tracking-tighter text-glow-primary">
                  {game.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading uppercase">About this game</h2>
            <div className="p-6 rounded-2xl bg-card border border-border/50 leading-relaxed text-muted-foreground">
              {game.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 flex flex-col gap-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Earning Rate</p>
              <div className="text-4xl font-mono font-bold text-accent flex items-center justify-center gap-2">
                <Coins className="w-8 h-8" />
                {game.rewardPerMinute}
              </div>
              <p className="text-xs text-muted-foreground">points per minute played</p>
            </div>

            <Button
              size="lg"
              onClick={handlePlayAndEarn}
              className="w-full h-16 text-lg font-bold shadow-[0_0_40px_-10px_hsl(var(--primary))]"
            >
              PLAY AND EARN <Play className="w-6 h-6 ml-2 fill-current" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center text-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div className="font-mono font-bold text-lg">{game.playCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Total Plays</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center text-center gap-2">
              <Star className="w-5 h-5 text-secondary" />
              <div className="font-mono font-bold text-lg">{game.rating.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground uppercase font-bold">User Rating</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="font-heading font-bold uppercase text-sm text-muted-foreground tracking-wider mb-4 border-b border-border pb-2">Game Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" /> Creator</span>
                <span className="font-bold">{game.creatorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Added</span>
                <span className="font-mono">{format(new Date(game.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
