import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { 
  useGetGame, getGetGameQueryKey, 
  useStartPlaySession,
  useEndPlaySession 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Coins, Clock, AlertTriangle, Play, SquareSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";
import { useCurrentUser } from "@/lib/current-user";
import { resolveGameImageUrl } from "@/lib/media";

export function PlayPage() {
  const [, params] = useRoute("/play/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const [sessionState, setSessionState] = useState<"idle" | "playing" | "ended">("idle");
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const [secondsPlayed, setSecondsPlayed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: user } = useCurrentUser();

  const { data: game, isLoading: isGameLoading } = useGetGame(id, {
    query: {
      enabled: !!id,
      queryKey: getGetGameQueryKey(id)
    }
  });

  const startSession = useStartPlaySession();
  const endSession = useEndPlaySession();

  // Handle timer
  useEffect(() => {
    if (sessionState === "playing") {
      timerRef.current = setInterval(() => {
        setSecondsPlayed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const handleStart = () => {
    if (!user) return;

    startSession.mutate(
      { data: { gameId: id, userId: user.id } },
      {
        onSuccess: (session) => {
          setSessionId(session.id);
          setSessionState("playing");
          toast({
            title: "Session Started",
            description: "You are now earning points!",
            variant: "default",
          });
        },
        onError: () => {
          toast({
            title: "Failed to start",
            description: "Could not initialize play session.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleEnd = () => {
    if (!sessionId) return;
    
    const minutes = Math.max(1, Math.ceil(secondsPlayed / 60)); // at least 1 minute recorded for demo
    
    endSession.mutate(
      { id: sessionId, data: { durationMinutes: minutes } },
      {
        onSuccess: (result) => {
          setSessionState("ended");
          toast({
            title: "Session Ended",
            description: `You earned ${result.pointsEarned} points!`,
            variant: "success",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save session.",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Format timer
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isGameLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Game Not Found</h2>
      </div>
    );
  }

  const currentPoints = Math.floor((secondsPlayed / 60) * game.rewardPerMinute);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
      {/* Top HUD */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <img 
              src={resolveGameImageUrl(game.thumbnailUrl) || `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`} 
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          </div>
          <div>
            <h1 className="font-heading font-bold uppercase tracking-tight leading-none text-lg text-glow-primary">{game.title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-accent" /> {game.rewardPerMinute} pts/min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center bg-background px-4 py-1.5 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Time</span>
            <span className="font-mono font-bold text-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {formatTime(secondsPlayed)}
            </span>
          </div>
          <div className="flex flex-col items-center bg-background px-4 py-1.5 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Earned</span>
            <span className="font-mono font-bold text-xl flex items-center gap-2 text-accent">
              <Coins className="w-4 h-4" />
              {formatNumber(currentPoints)}
            </span>
          </div>

          {sessionState === "idle" && (
            <Button onClick={handleStart} size="lg" className="min-w-32 animate-pulse shadow-[0_0_20px_-5px_hsl(var(--primary))]">
              <Play className="w-4 h-4 mr-2 fill-current" /> START
            </Button>
          )}
          {sessionState === "playing" && (
            <Button onClick={handleEnd} variant="destructive" size="lg" className="min-w-32">
              <SquareSquare className="w-4 h-4 mr-2 fill-current" /> STOP
            </Button>
          )}
          {sessionState === "ended" && (
            <Button onClick={() => setLocation(`/games/${game.id}`)} variant="outline" size="lg" className="min-w-32">
              Return
            </Button>
          )}
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 bg-black rounded-xl border border-border overflow-hidden relative group">
        {sessionState === "idle" && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Gamepad2 className="w-16 h-16 text-primary mb-4 opacity-50" />
            <h2 className="text-3xl font-heading font-bold uppercase mb-2">Ready to play?</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start the session to begin earning points. Make sure to hit stop when you're done to save your progress.
            </p>
            <Button onClick={handleStart} size="lg" className="h-14 px-10 text-lg">
              START SESSION
            </Button>
          </div>
        )}
        
        {sessionState === "ended" && (
          <div className="absolute inset-0 z-10 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-6 animate-bounce">
              <Trophy className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-4xl font-heading font-bold uppercase mb-2 text-glow-accent text-accent">Session Complete!</h2>
            <p className="text-xl font-mono mb-8">
              You earned <span className="font-bold text-accent">+{currentPoints}</span> points
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="lg">Play Again</Button>
              <Button onClick={() => setLocation("/earnings")} variant="secondary" size="lg">View Earnings</Button>
            </div>
          </div>
        )}

        {/* If iframe fails to load or for visual demo, fallback to a placeholder */}
        {game.gameUrl ? (
          <iframe 
            src={game.gameUrl}
            className="w-full h-full border-0"
            title={game.title}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 border-4 border-dashed border-border/50 m-4 rounded-xl max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)]">
             <AlertTriangle className="w-12 h-12 mb-4" />
             <p className="font-mono">Invalid Game URL</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Gamepad2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
}

function Trophy(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
}
