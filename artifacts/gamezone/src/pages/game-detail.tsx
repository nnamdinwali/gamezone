import { useRoute, Link } from "wouter";
import { useEffect, useState } from "react";
import { useGetGame, getGetGameQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Coins, Users, Star, ArrowLeft, Calendar, User, Circle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { resolveGameImageUrl } from "@/lib/media";

const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");
type GameMilestone = { id: number; level: number; title: string; rewardAmount: number; currency: string; countryCode: string; isActive: boolean; completed?: boolean };

export function GameDetailPage() {
  const [, params] = useRoute("/games/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [milestones, setMilestones] = useState<GameMilestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  const { data: game, isLoading, error } = useGetGame(id, {
    query: {
      enabled: !!id,
      queryKey: getGetGameQueryKey(id)
    }
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setMilestonesLoading(true);
    fetch(`${API_BASE}/api/games/${id}/milestones`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load milestones");
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) setMilestones(Array.isArray(payload) ? payload : Array.isArray(payload?.milestones) ? payload.milestones : []);
      })
      .catch(() => { if (!cancelled) setMilestones([]); })
      .finally(() => { if (!cancelled) setMilestonesLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handlePlayAndEarn = () => {
    if (!game) return;
    const gameWithLinks = game as typeof game & { storeUrl?: string | null; gameUrl?: string | null };
    const storeUrl = gameWithLinks.storeUrl || gameWithLinks.gameUrl;

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
              src={resolveGameImageUrl(game.thumbnailUrl) || `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`} 
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

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold uppercase text-sm text-muted-foreground tracking-wider">Milestone rewards</h3>
              {milestones.length > 0 && <span className="text-xs text-muted-foreground">{milestones.length} goals</span>}
            </div>
            {milestonesLoading ? <p className="text-sm text-muted-foreground">Loading milestones…</p> : milestones.length === 0 ? <p className="text-sm text-muted-foreground">Milestones will appear here when they are configured.</p> : <div className="space-y-3">{milestones.map((milestone) => { const completed = Boolean(milestone.completed); return <div key={milestone.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${completed ? "border-primary/50 bg-primary/10" : "border-border/70 bg-background/40"}`}><span aria-label={completed ? "Milestone completed" : "Milestone not completed"} title={completed ? "Completed" : "Not completed"} className={completed ? "text-primary" : "text-muted-foreground/70"}>{completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</span><span className="min-w-24 rounded-lg bg-primary/15 px-3 py-2 text-center font-mono font-bold text-primary">{milestone.currency} {Number(milestone.rewardAmount).toFixed(2)}</span><span className="font-medium">{milestone.title || `Complete Level ${milestone.level}`}</span></div>; })}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
