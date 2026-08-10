import { useRoute, Link } from "wouter";
import { useGetUser, getGetUserQueryKey, useGetUserStats, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Gamepad2, Coins, Calendar, Flame, Mail, Wallet, Hash } from "lucide-react";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";
import { useMoney } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";

export function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const formatCurrency = useMoney();
  const { data: currentUser } = useCurrentUser();

  // Fall back to the signed-in player's own profile when no id is in the URL.
  const routeId = params?.id ? parseInt(params.id, 10) : NaN;
  const id = Number.isFinite(routeId) ? routeId : Number(currentUser?.id ?? 0);
  const isOwnProfile = Boolean(currentUser?.id && Number(currentUser.id) === id);

  const { data: user, isLoading: isUserLoading } = useGetUser(id, {
    query: { enabled: id > 0, queryKey: getGetUserQueryKey(id) }
  });

  const { data: stats, isLoading: isStatsLoading } = useGetUserStats(id, {
    query: { enabled: id > 0, queryKey: getGetUserStatsQueryKey(id) }
  });

  if (isUserLoading || isStatsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">User Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Profile Header */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 -z-10" />
        
        {/* Banner pattern */}
        <div className="absolute inset-x-0 top-0 h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10" />
        
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left mt-8 md:mt-16 relative">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl bg-card">
            <AvatarImage src={user.avatarUrl || ''} className="rounded-xl object-cover" />
            <AvatarFallback className="text-4xl rounded-xl bg-muted">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2 mb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-3xl md:text-5xl font-bold font-heading uppercase tracking-tighter text-glow-primary">{user.username}</h1>
              <Badge variant="outline" className="w-fit mx-auto md:mx-0 border-primary/50 text-primary">
                {isOwnProfile ? "YOUR PROFILE" : "PLAYER"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm font-mono">
              <Calendar className="w-4 h-4" /> Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </p>
          </div>

          <div className="bg-background/80 backdrop-blur border border-border rounded-2xl p-4 flex flex-col items-center min-w-40">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">Lifetime Earned</span>
            <span className="font-mono font-bold text-3xl text-accent flex items-center gap-2 text-glow-accent">
              <Coins className="w-5 h-5" /> {formatCurrency(stats.totalEarnings)}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details - only the owner sees private fields like email */}
      {isOwnProfile && (
        <Card className="bg-card/50">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold font-heading uppercase tracking-tight">Account Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Available Balance</p>
                  <p className="text-sm font-mono font-bold">{formatCurrency(user.balance || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Player ID</p>
                  <p className="text-sm font-mono font-bold">#{user.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 hover:bg-card transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Time Played</p>
              <p className="text-2xl font-mono font-bold">{(stats.totalPlayTime / 60).toFixed(1)} <span className="text-sm font-sans">hrs</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 hover:bg-card transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Games Played</p>
              <p className="text-2xl font-mono font-bold">{stats.gamesPlayed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 hover:bg-card transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Genre</p>
              <p className="text-2xl font-heading font-bold uppercase">{stats.favoriteGenre || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-bold font-heading uppercase tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" /> Recent Sessions
        </h2>
        
        <div className="grid gap-4">
          {stats.recentSessions.length > 0 ? (
            stats.recentSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden bg-card/60 backdrop-blur-sm border-border/50 hover:border-border transition-colors">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <Link href={`/games/${session.gameId}`}>
                        <h3 className="font-bold text-lg hover:text-primary transition-colors cursor-pointer">{session.gameName || "Unknown Game"}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
                        {format(new Date(session.startedAt), "MMM d, h:mm a")} • {session.durationMinutes} mins
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:justify-end">
                    <Badge variant={session.status === 'completed' ? 'success' : 'outline'}>
                      {session.status}
                    </Badge>
                    <div className="font-mono font-bold text-xl text-accent flex items-center gap-1 w-24 justify-end">
                      +{session.pointsEarned}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No recent play sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
