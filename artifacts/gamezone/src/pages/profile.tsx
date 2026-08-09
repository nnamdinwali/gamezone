"use strict";
export default `import { useRoute, Link } from "wouter";
import { useGetUser, getGetUserQueryKey, useGetUserStats, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Gamepad2, Coins, Calendar, Flame } from "lucide-react";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";

export function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const id = params?.id ? parseInt(params.id, 10) : 1;

  const { data: user, isLoading: isUserLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) }
  });

  const { data: stats, isLoading: isStatsLoading } = useGetUserStats(id, {
    query: { enabled: !!id, queryKey: getGetUserStatsQueryKey(id) }
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
                PRO PLAYER
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm font-mono">
              <Calendar className="w-4 h-4" /> Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </p>
          </div>

          <div className="bg-background/80 backdrop-blur border border-border rounded-2xl p-4 flex flex-col items-center min-w-40">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-1">Lifetime Earned</span>
            <span className="font-mono font-bold text-3xl text-accent flex items-center gap-2 text-glow-accent">
              <Coins className="w-5 h-5" /> {formatNumber(stats.totalEarnings)}
            </span>
          </div>
        </div>
      </div>

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
                      <Link href={\`/games/\${session.gameId}\`}>
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
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJwcm9maWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IHVzZVJvdXRlLCBMaW5rIH0gZnJvbSBcXFwid291dGVyXFxcIjtcXG5pbXBvcnQgeyB1c2VHZXRVc2VyLCBnZXRHZXRVc2VyUXVlcnlLZXksIHVzZUdldFVzZXJTdGF0cywgZ2V0R2V0VXNlclN0YXRzUXVlcnlLZXkgfSBmcm9tIFxcXCJAd29ya3NwYWNlL2FwaS1jbGllbnQtcmVhY3RcXFwiO1xcbmltcG9ydCB7IEF2YXRhciwgQXZhdGFyRmFsbGJhY2ssIEF2YXRhckltYWdlIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2F2YXRhclxcXCI7XFxuaW1wb3J0IHsgQ2FyZCwgQ2FyZENvbnRlbnQgfSBmcm9tIFxcXCJAL2NvbXBvbmVudHMvdWkvY2FyZFxcXCI7XFxuaW1wb3J0IHsgU2tlbGV0b24gfSBmcm9tIFxcXCJAL2NvbXBvbmVudHMvdWkvc2tlbGV0b25cXFwiO1xcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2JhZGdlXFxcIjtcXG5pbXBvcnQgeyBUcm9waHksIENsb2NrLCBHYW1lcGFkMiwgQ29pbnMsIENhbGVuZGFyLCBGbGFtZSB9IGZyb20gXFxcImx1Y2lkZS1yZWFjdFxcXCI7XFxuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcXFwiZGF0ZS1mbnNcXFwiO1xcbmltcG9ydCB7IGZvcm1hdE51bWJlciB9IGZyb20gXFxcIkAvbGliL3V0aWxzXFxcIjtcXG5cXG5leHBvcnQgZnVuY3Rpb24gUHJvZmlsZVBhZ2UoKSB7XFxuICBjb25zdCBbLCBwYXJhbXNdID0gdXNlUm91dGUoXFxcIi9wcm9maWxlLzppZFxcXCIpO1xcbiAgY29uc3QgaWQgPSBwYXJhbXM/LmlkID8gcGFyc2VJbnQocGFyYW1zLmlkLCAxMCkgOiAxO1xcblxcbiAgY29uc3QgeyBkYXRhOiB1c2VyLCBpc0xvYWRpbmc6IGlzVXNlckxvYWRpbmcgfSA9IHVzZUdldFVzZXIoaWQsIHtcXG4gICAgcXVlcnk6IHsgZW5hYmxlZDogISFpZCwgcXVlcnlLZXk6IGdldEdldFVzZXJRdWVyeUtleShpZCkgfVxcbiAgfSk7XFxuXFxuICBjb25zdCB7IGRhdGE6IHN0YXRzLCBpc0xvYWRpbmc6IGlzU3RhdHNMb2FkaW5nIH0gPSB1c2VHZXRVc2VyU3RhdHMoaWQsIHtcXG4gICAgcXVlcnk6IHsgZW5hYmxlZDogISFpZCwgcXVlcnlLZXk6IGdldEdldFVzZXJTdGF0c1F1ZXJ5S2V5KGlkKSB9XFxuICB9KTtcXG5cXG4gIGlmIChpc1VzZXJMb2FkaW5nIHx8IGlzU3RhdHNMb2FkaW5nKSB7XFxuICAgIHJldHVybiAoXFxuICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInNwYWNlLXktOFxcXCI+XFxuICAgICAgICA8U2tlbGV0b24gY2xhc3NOYW1lPVxcXCJoLTY0IHctZnVsbCByb3VuZGVkLTN4bFxcXCIgLz5cXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0zIGdhcC02XFxcIj5cXG4gICAgICAgICAgPFNrZWxldG9uIGNsYXNzTmFtZT1cXFwiaC0zMiByb3VuZGVkLXhsXFxcIiAvPlxcbiAgICAgICAgICA8U2tlbGV0b24gY2xhc3NOYW1lPVxcXCJoLTMyIHJvdW5kZWQteGxcXFwiIC8+XFxuICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcImgtMzIgcm91bmRlZC14bFxcXCIgLz5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvZGl2PlxcbiAgICApO1xcbiAgfVxcblxcbiAgaWYgKCF1c2VyIHx8ICFzdGF0cykge1xcbiAgICByZXR1cm4gKFxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJweS0yMCB0ZXh0LWNlbnRlclxcXCI+XFxuICAgICAgICA8aDIgY2xhc3NOYW1lPVxcXCJ0ZXh0LTJ4bCBmb250LWJvbGRcXFwiPlVzZXIgTm90IEZvdW5kPC9oMj5cXG4gICAgICA8L2Rpdj5cXG4gICAgKTtcXG4gIH1cXG5cXG4gIHJldHVybiAoXFxuICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJzcGFjZS15LTggYW5pbWF0ZS1pbiBmYWRlLWluIGR1cmF0aW9uLTUwMCBwYi0xMlxcXCI+XFxuICAgICAgey8qIFByb2ZpbGUgSGVhZGVyICovfVxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJyZWxhdGl2ZSByb3VuZGVkLTN4bCBvdmVyZmxvdy1oaWRkZW4gYm9yZGVyIGJvcmRlci1ib3JkZXIgYmctY2FyZCBpc29sYXRlXFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJhYnNvbHV0ZSBpbnNldC0wIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tcHJpbWFyeS8xMCB2aWEtYmFja2dyb3VuZCB0by1hY2NlbnQvMTAgLXotMTBcXFwiIC8+XFxuICAgICAgICBcXG4gICAgICAgIHsvKiBCYW5uZXIgcGF0dGVybiAqL31cXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJhYnNvbHV0ZSBpbnNldC14LTAgdG9wLTAgaC0zMiBiZy1bdXJsKCdodHRwczovL3d3dy50cmFuc3BhcmVudHRleHR1cmVzLmNvbS9wYXR0ZXJucy9jdWJlcy5wbmcnKV0gb3BhY2l0eS0xMCAtei0xMFxcXCIgLz5cXG4gICAgICAgIFxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInAtOCBtZDpwLTEyIGZsZXggZmxleC1jb2wgbWQ6ZmxleC1yb3cgaXRlbXMtY2VudGVyIG1kOml0ZW1zLWVuZCBnYXAtNiB0ZXh0LWNlbnRlciBtZDp0ZXh0LWxlZnQgbXQtOCBtZDptdC0xNiByZWxhdGl2ZVxcXCI+XFxuICAgICAgICAgIDxBdmF0YXIgY2xhc3NOYW1lPVxcXCJ3LTMyIGgtMzIgbWQ6dy00MCBtZDpoLTQwIGJvcmRlci00IGJvcmRlci1iYWNrZ3JvdW5kIHNoYWRvdy14bCByb3VuZGVkLTJ4bCBiZy1jYXJkXFxcIj5cXG4gICAgICAgICAgICA8QXZhdGFySW1hZ2Ugc3JjPXt1c2VyLmF2YXRhclVybCB8fCAnJ30gY2xhc3NOYW1lPVxcXCJyb3VuZGVkLXhsIG9iamVjdC1jb3ZlclxcXCIgLz5cXG4gICAgICAgICAgICA8QXZhdGFyRmFsbGJhY2sgY2xhc3NOYW1lPVxcXCJ0ZXh0LTR4bCByb3VuZGVkLXhsIGJnLW11dGVkXFxcIj57dXNlci51c2VybmFtZS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKX08L0F2YXRhckZhbGxiYWNrPlxcbiAgICAgICAgICA8L0F2YXRhcj5cXG4gICAgICAgICAgXFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4LTEgc3BhY2UteS0yIG1iLTJcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4IGZsZXgtY29sIG1kOmZsZXgtcm93IG1kOml0ZW1zLWNlbnRlciBnYXAtMiBtZDpnYXAtNFxcXCI+XFxuICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVxcXCJ0ZXh0LTN4bCBtZDp0ZXh0LTV4bCBmb250LWJvbGQgZm9udC1oZWFkaW5nIHVwcGVyY2FzZSB0cmFja2luZy10aWdodGVyIHRleHQtZ2xvdy1wcmltYXJ5XFxcIj57dXNlci51c2VybmFtZX08L2gxPlxcbiAgICAgICAgICAgICAgPEJhZGdlIHZhcmlhbnQ9XFxcIm91dGxpbmVcXFwiIGNsYXNzTmFtZT1cXFwidy1maXQgbXgtYXV0byBtZDpteC0wIGJvcmRlci1wcmltYXJ5LzUwIHRleHQtcHJpbWFyeVxcXCI+XFxuICAgICAgICAgICAgICAgIFBSTyBQTEFZRVJcXG4gICAgICAgICAgICAgIDwvQmFkZ2U+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVxcXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWQ6anVzdGlmeS1zdGFydCBnYXAtMiB0ZXh0LXNtIGZvbnQtbW9ub1xcXCI+XFxuICAgICAgICAgICAgICA8Q2FsZW5kYXIgY2xhc3NOYW1lPVxcXCJ3LTQgaC00XFxcIiAvPiBKb2luZWQge2Zvcm1hdChuZXcgRGF0ZSh1c2VyLmNyZWF0ZWRBdCksIFxcXCJNTU1NIHl5eXlcXFwiKX1cXG4gICAgICAgICAgICA8L3A+XFxuICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiYmctYmFja2dyb3VuZC84MCBiYWNrZHJvcC1ibHVyIGJvcmRlciBib3JkZXItYm9yZGVyIHJvdW5kZWQtMnhsIHAtNCBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBtaW4tdy00MFxcXCI+XFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJ0ZXh0LXhzIHVwcGVyY2FzZSBmb250LWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRyYWNraW5nLXdpZGVzdCBtYi0xXFxcIj5MaWZldGltZSBFYXJuZWQ8L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJmb250LW1vbm8gZm9udC1ib2xkIHRleHQtM3hsIHRleHQtYWNjZW50IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtZ2xvdy1hY2NlbnRcXFwiPlxcbiAgICAgICAgICAgICAgPENvaW5zIGNsYXNzTmFtZT1cXFwidy01IGgtNVxcXCIgLz4ge2Zvcm1hdE51bWJlcihzdGF0cy50b3RhbEVhcm5pbmdzKX1cXG4gICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgey8qIFN0YXRzIEdyaWQgKi99XFxuICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTZcXFwiPlxcbiAgICAgICAgPENhcmQgY2xhc3NOYW1lPVxcXCJiZy1jYXJkLzUwIGhvdmVyOmJnLWNhcmQgdHJhbnNpdGlvbi1jb2xvcnNcXFwiPlxcbiAgICAgICAgICA8Q2FyZENvbnRlbnQgY2xhc3NOYW1lPVxcXCJwLTYgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJ3LTEyIGgtMTIgcm91bmRlZC14bCBiZy1wcmltYXJ5LzIwIHRleHQtcHJpbWFyeSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclxcXCI+XFxuICAgICAgICAgICAgICA8Q2xvY2sgY2xhc3NOYW1lPVxcXCJ3LTYgaC02XFxcIiAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXY+XFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtc20gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiPlRpbWUgUGxheWVkPC9wPlxcbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVxcXCJ0ZXh0LTJ4bCBmb250LW1vbm8gZm9udC1ib2xkXFxcIj57KHN0YXRzLnRvdGFsUGxheVRpbWUgLyA2MCkudG9GaXhlZCgxKX0gPHNwYW4gY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIGZvbnQtc2Fuc1xcXCI+aHJzPC9zcGFuPjwvcD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPC9DYXJkQ29udGVudD5cXG4gICAgICAgIDwvQ2FyZD5cXG4gICAgICAgIFxcbiAgICAgICAgPENhcmQgY2xhc3NOYW1lPVxcXCJiZy1jYXJkLzUwIGhvdmVyOmJnLWNhcmQgdHJhbnNpdGlvbi1jb2xvcnNcXFwiPlxcbiAgICAgICAgICA8Q2FyZENvbnRlbnQgY2xhc3NOYW1lPVxcXCJwLTYgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJ3LTEyIGgtMTIgcm91bmRlZC14bCBiZy1zZWNvbmRhcnkvMjAgdGV4dC1zZWNvbmRhcnkgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcXFwiPlxcbiAgICAgICAgICAgICAgPEdhbWVwYWQyIGNsYXNzTmFtZT1cXFwidy02IGgtNlxcXCIgLz5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2PlxcbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXFxcIj5HYW1lcyBQbGF5ZWQ8L3A+XFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtMnhsIGZvbnQtbW9ubyBmb250LWJvbGRcXFwiPntzdGF0cy5nYW1lc1BsYXllZH08L3A+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDwvQ2FyZENvbnRlbnQ+XFxuICAgICAgICA8L0NhcmQ+XFxuXFxuICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XFxcImJnLWNhcmQvNTAgaG92ZXI6YmctY2FyZCB0cmFuc2l0aW9uLWNvbG9yc1xcXCI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudCBjbGFzc05hbWU9XFxcInAtNiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctMTIgaC0xMiByb3VuZGVkLXhsIGJnLWFjY2VudC8yMCB0ZXh0LWFjY2VudCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclxcXCI+XFxuICAgICAgICAgICAgICA8RmxhbWUgY2xhc3NOYW1lPVxcXCJ3LTYgaC02XFxcIiAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXY+XFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtc20gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiPlRvcCBHZW5yZTwvcD5cXG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC0yeGwgZm9udC1oZWFkaW5nIGZvbnQtYm9sZCB1cHBlcmNhc2VcXFwiPntzdGF0cy5mYXZvcml0ZUdlbnJlIHx8IFxcXCJOL0FcXFwifTwvcD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPC9DYXJkQ29udGVudD5cXG4gICAgICAgIDwvQ2FyZD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICB7LyogUmVjZW50IFNlc3Npb25zICovfVxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJzcGFjZS15LTYgcHQtNlxcXCI+XFxuICAgICAgICA8aDIgY2xhc3NOYW1lPVxcXCJ0ZXh0LTJ4bCBmb250LWJvbGQgZm9udC1oZWFkaW5nIHVwcGVyY2FzZSB0cmFja2luZy10aWdodCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlxcXCI+XFxuICAgICAgICAgIDxUcm9waHkgY2xhc3NOYW1lPVxcXCJ3LTYgaC02IHRleHQtcHJpbWFyeVxcXCIgLz4gUmVjZW50IFNlc3Npb25zXFxuICAgICAgICA8L2gyPlxcbiAgICAgICAgXFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZ3JpZCBnYXAtNFxcXCI+XFxuICAgICAgICAgIHtzdGF0cy5yZWNlbnRTZXNzaW9ucy5sZW5ndGggPiAwID8gKFxcbiAgICAgICAgICAgIHN0YXRzLnJlY2VudFNlc3Npb25zLm1hcCgoc2Vzc2lvbikgPT4gKFxcbiAgICAgICAgICAgICAgPENhcmQga2V5PXtzZXNzaW9uLmlkfSBjbGFzc05hbWU9XFxcIm92ZXJmbG93LWhpZGRlbiBiZy1jYXJkLzYwIGJhY2tkcm9wLWJsdXItc20gYm9yZGVyLWJvcmRlci81MCBob3Zlcjpib3JkZXItYm9yZGVyIHRyYW5zaXRpb24tY29sb3JzXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInAtNCBzbTpwLTYgZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBzbTppdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC00XFxcIj5cXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctMTIgaC0xMiBiZy1tdXRlZCByb3VuZGVkLXhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPEdhbWVwYWQyIGNsYXNzTmFtZT1cXFwidy02IGgtNiB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XFxuICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9e2AvZ2FtZXMvJHtzZXNzaW9uLmdhbWVJZH1gfT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVxcXCJmb250LWJvbGQgdGV4dC1sZyBob3Zlcjp0ZXh0LXByaW1hcnkgdHJhbnNpdGlvbi1jb2xvcnMgY3Vyc29yLXBvaW50ZXJcXFwiPntzZXNzaW9uLmdhbWVOYW1lIHx8IFxcXCJVbmtub3duIEdhbWVcXFwifTwvaDM+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvTGluaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBmb250LW1vbm9cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXQobmV3IERhdGUoc2Vzc2lvbi5zdGFydGVkQXQpLCBcXFwiTU1NIGQsIGg6bW0gYVxcXCIpfSDigKIge3Nlc3Npb24uZHVyYXRpb25NaW51dGVzfSBtaW5zXFxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCBzbTpqdXN0aWZ5LWVuZFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD17c2Vzc2lvbi5zdGF0dXMgPT09ICdjb21wbGV0ZWQnID8gJ3N1Y2Nlc3MnIDogJ291dGxpbmUnfT5cXG4gICAgICAgICAgICAgICAgICAgICAge3Nlc3Npb24uc3RhdHVzfVxcbiAgICAgICAgICAgICAgICAgICAgPC9CYWRnZT5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmb250LW1vbm8gZm9udC1ib2xkIHRleHQteGwgdGV4dC1hY2NlbnQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgdy0yNCBqdXN0aWZ5LWVuZFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICt7c2Vzc2lvbi5wb2ludHNFYXJuZWR9XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICA8L0NhcmQ+XFxuICAgICAgICAgICAgKSlcXG4gICAgICAgICAgKSA6IChcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicC0xMiB0ZXh0LWNlbnRlciBib3JkZXItMiBib3JkZXItZGFzaGVkIGJvcmRlci1ib3JkZXIgcm91bmRlZC14bFxcXCI+XFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRleHQtbXV0ZWQtZm9yZWdyb3VuZFxcXCI+Tm8gcmVjZW50IHBsYXkgc2Vzc2lvbnMuPC9wPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICApfVxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgKTtcXG59XFxuXCIiXSwiZmlsZSI6Ii9ob21lL3J1bm5lci93b3Jrc3BhY2UvYXJ0aWZhY3RzL2dhbWV6b25lL3NyYy9wYWdlcy9wcm9maWxlLnRzeCJ9