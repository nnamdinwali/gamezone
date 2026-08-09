"use strict";
export default `import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Users, Coins, Activity, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter text-glow-primary flex items-center gap-3">
          <Activity className="w-8 h-8" /> Platform Stats
        </h1>
        <p className="text-muted-foreground">Global metrics and real-time activity across Rockcity Games.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-primary" /> Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono font-bold">{formatNumber(stats.totalGames)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-secondary/20 hover:border-secondary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" /> Registered Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono font-bold">{formatNumber(stats.totalPlayers)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-accent/20 hover:border-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" /> Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono font-bold text-accent text-glow-accent">{formatNumber(stats.totalPayouts)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-success/20 hover:border-success/50 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16 text-success animate-pulse" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-success" /> Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono font-bold text-success flex items-baseline gap-2">
              {formatNumber(stats.activeSessionsCount)}
              <span className="text-xs uppercase font-sans tracking-wider text-success/70 font-bold">Live</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Genre Distribution */}
      <Card className="bg-card/80 backdrop-blur border-border overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-xl flex items-center gap-2 font-heading uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-primary" /> Popular Genres
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {stats.topGenres.map((item, index) => {
              // Calculate percentage relative to the top genre for the bar width
              const maxCount = stats.topGenres[0]?.count || 1;
              const percentage = (item.count / maxCount) * 100;
              
              return (
                <div key={item.genre} className="p-6 flex items-center gap-6 group hover:bg-muted/30 transition-colors">
                  <div className="w-8 font-mono font-bold text-muted-foreground text-right">
                    #{index + 1}
                  </div>
                  <div className="w-32 font-bold uppercase tracking-wide">
                    {item.genre}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                      <div 
                        className={\`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 \${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-accent' : 
                          index === 2 ? 'bg-secondary' : 'bg-muted-foreground'
                        }\`}
                        style={{ width: \`\${percentage}%\` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right font-mono font-bold">
                    {formatNumber(item.count)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiZGFzaGJvYXJkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IHVzZUdldERhc2hib2FyZFN0YXRzLCBnZXRHZXREYXNoYm9hcmRTdGF0c1F1ZXJ5S2V5IH0gZnJvbSBcXFwiQHdvcmtzcGFjZS9hcGktY2xpZW50LXJlYWN0XFxcIjtcXG5pbXBvcnQgeyBDYXJkLCBDYXJkQ29udGVudCwgQ2FyZEhlYWRlciwgQ2FyZFRpdGxlIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL2NhcmRcXFwiO1xcbmltcG9ydCB7IFNrZWxldG9uIH0gZnJvbSBcXFwiQC9jb21wb25lbnRzL3VpL3NrZWxldG9uXFxcIjtcXG5pbXBvcnQgeyBHYW1lcGFkMiwgVXNlcnMsIENvaW5zLCBBY3Rpdml0eSwgVHJlbmRpbmdVcCB9IGZyb20gXFxcImx1Y2lkZS1yZWFjdFxcXCI7XFxuaW1wb3J0IHsgZm9ybWF0TnVtYmVyIH0gZnJvbSBcXFwiQC9saWIvdXRpbHNcXFwiO1xcblxcbmV4cG9ydCBmdW5jdGlvbiBEYXNoYm9hcmRQYWdlKCkge1xcbiAgY29uc3QgeyBkYXRhOiBzdGF0cywgaXNMb2FkaW5nIH0gPSB1c2VHZXREYXNoYm9hcmRTdGF0cyh7XFxuICAgIHF1ZXJ5OiB7IHF1ZXJ5S2V5OiBnZXRHZXREYXNoYm9hcmRTdGF0c1F1ZXJ5S2V5KCkgfVxcbiAgfSk7XFxuXFxuICBpZiAoaXNMb2FkaW5nKSB7XFxuICAgIHJldHVybiAoXFxuICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInNwYWNlLXktOFxcXCI+XFxuICAgICAgICA8U2tlbGV0b24gY2xhc3NOYW1lPVxcXCJoLTEyIHctNjRcXFwiIC8+XFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNlxcXCI+XFxuICAgICAgICAgIHtBcnJheSg0KS5maWxsKDApLm1hcCgoXywgaSkgPT4gPFNrZWxldG9uIGtleT17aX0gY2xhc3NOYW1lPVxcXCJoLTMyIHJvdW5kZWQteGxcXFwiIC8+KX1cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPFNrZWxldG9uIGNsYXNzTmFtZT1cXFwiaC05NiByb3VuZGVkLXhsIHctZnVsbFxcXCIgLz5cXG4gICAgICA8L2Rpdj5cXG4gICAgKTtcXG4gIH1cXG5cXG4gIGlmICghc3RhdHMpIHJldHVybiBudWxsO1xcblxcbiAgcmV0dXJuIChcXG4gICAgPGRpdiBjbGFzc05hbWU9XFxcInNwYWNlLXktOCBhbmltYXRlLWluIGZhZGUtaW4gZHVyYXRpb24tNTAwIHBiLTEyXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwic3BhY2UteS0yXFxcIj5cXG4gICAgICAgIDxoMSBjbGFzc05hbWU9XFxcInRleHQtNHhsIGZvbnQtYm9sZCBmb250LWhlYWRpbmcgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0ZXIgdGV4dC1nbG93LXByaW1hcnkgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcXFwiPlxcbiAgICAgICAgICA8QWN0aXZpdHkgY2xhc3NOYW1lPVxcXCJ3LTggaC04XFxcIiAvPiBQbGF0Zm9ybSBTdGF0c1xcbiAgICAgICAgPC9oMT5cXG4gICAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXFxcIj5HbG9iYWwgbWV0cmljcyBhbmQgcmVhbC10aW1lIGFjdGl2aXR5IGFjcm9zcyBSb2NrY2l0eSBHYW1lcy48L3A+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgey8qIEtQSSBDYXJkcyAqL31cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNlxcXCI+XFxuICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XFxcImJnLWNhcmQvNTAgYm9yZGVyLXByaW1hcnkvMjAgaG92ZXI6Ym9yZGVyLXByaW1hcnkvNTAgdHJhbnNpdGlvbi1jb2xvcnNcXFwiPlxcbiAgICAgICAgICA8Q2FyZEhlYWRlciBjbGFzc05hbWU9XFxcInBiLTJcXFwiPlxcbiAgICAgICAgICAgIDxDYXJkVGl0bGUgY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXFxcIj5cXG4gICAgICAgICAgICAgIDxHYW1lcGFkMiBjbGFzc05hbWU9XFxcInctNCBoLTQgdGV4dC1wcmltYXJ5XFxcIiAvPiBUb3RhbCBHYW1lc1xcbiAgICAgICAgICAgIDwvQ2FyZFRpdGxlPlxcbiAgICAgICAgICA8L0NhcmRIZWFkZXI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGV4dC00eGwgZm9udC1tb25vIGZvbnQtYm9sZFxcXCI+e2Zvcm1hdE51bWJlcihzdGF0cy50b3RhbEdhbWVzKX08L2Rpdj5cXG4gICAgICAgICAgPC9DYXJkQ29udGVudD5cXG4gICAgICAgIDwvQ2FyZD5cXG5cXG4gICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cXFwiYmctY2FyZC81MCBib3JkZXItc2Vjb25kYXJ5LzIwIGhvdmVyOmJvcmRlci1zZWNvbmRhcnkvNTAgdHJhbnNpdGlvbi1jb2xvcnNcXFwiPlxcbiAgICAgICAgICA8Q2FyZEhlYWRlciBjbGFzc05hbWU9XFxcInBiLTJcXFwiPlxcbiAgICAgICAgICAgIDxDYXJkVGl0bGUgY2xhc3NOYW1lPVxcXCJ0ZXh0LXNtIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXFxcIj5cXG4gICAgICAgICAgICAgIDxVc2VycyBjbGFzc05hbWU9XFxcInctNCBoLTQgdGV4dC1zZWNvbmRhcnlcXFwiIC8+IFJlZ2lzdGVyZWQgUGxheWVyc1xcbiAgICAgICAgICAgIDwvQ2FyZFRpdGxlPlxcbiAgICAgICAgICA8L0NhcmRIZWFkZXI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGV4dC00eGwgZm9udC1tb25vIGZvbnQtYm9sZFxcXCI+e2Zvcm1hdE51bWJlcihzdGF0cy50b3RhbFBsYXllcnMpfTwvZGl2PlxcbiAgICAgICAgICA8L0NhcmRDb250ZW50PlxcbiAgICAgICAgPC9DYXJkPlxcblxcbiAgICAgICAgPENhcmQgY2xhc3NOYW1lPVxcXCJiZy1jYXJkLzUwIGJvcmRlci1hY2NlbnQvMjAgaG92ZXI6Ym9yZGVyLWFjY2VudC81MCB0cmFuc2l0aW9uLWNvbG9yc1xcXCI+XFxuICAgICAgICAgIDxDYXJkSGVhZGVyIGNsYXNzTmFtZT1cXFwicGItMlxcXCI+XFxuICAgICAgICAgICAgPENhcmRUaXRsZSBjbGFzc05hbWU9XFxcInRleHQtc20gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcXFwiPlxcbiAgICAgICAgICAgICAgPENvaW5zIGNsYXNzTmFtZT1cXFwidy00IGgtNCB0ZXh0LWFjY2VudFxcXCIgLz4gVG90YWwgUGF5b3V0c1xcbiAgICAgICAgICAgIDwvQ2FyZFRpdGxlPlxcbiAgICAgICAgICA8L0NhcmRIZWFkZXI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGV4dC00eGwgZm9udC1tb25vIGZvbnQtYm9sZCB0ZXh0LWFjY2VudCB0ZXh0LWdsb3ctYWNjZW50XFxcIj57Zm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsUGF5b3V0cyl9PC9kaXY+XFxuICAgICAgICAgIDwvQ2FyZENvbnRlbnQ+XFxuICAgICAgICA8L0NhcmQ+XFxuXFxuICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XFxcImJnLWNhcmQvNTAgYm9yZGVyLXN1Y2Nlc3MvMjAgaG92ZXI6Ym9yZGVyLXN1Y2Nlc3MvNTAgdHJhbnNpdGlvbi1jb2xvcnMgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXFxcIj5cXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgcC00IG9wYWNpdHktMTBcXFwiPlxcbiAgICAgICAgICAgIDxBY3Rpdml0eSBjbGFzc05hbWU9XFxcInctMTYgaC0xNiB0ZXh0LXN1Y2Nlc3MgYW5pbWF0ZS1wdWxzZVxcXCIgLz5cXG4gICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDxDYXJkSGVhZGVyIGNsYXNzTmFtZT1cXFwicGItMlxcXCI+XFxuICAgICAgICAgICAgPENhcmRUaXRsZSBjbGFzc05hbWU9XFxcInRleHQtc20gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcXFwiPlxcbiAgICAgICAgICAgICAgPEFjdGl2aXR5IGNsYXNzTmFtZT1cXFwidy00IGgtNCB0ZXh0LXN1Y2Nlc3NcXFwiIC8+IEFjdGl2ZSBTZXNzaW9uc1xcbiAgICAgICAgICAgIDwvQ2FyZFRpdGxlPlxcbiAgICAgICAgICA8L0NhcmRIZWFkZXI+XFxuICAgICAgICAgIDxDYXJkQ29udGVudD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGV4dC00eGwgZm9udC1tb25vIGZvbnQtYm9sZCB0ZXh0LXN1Y2Nlc3MgZmxleCBpdGVtcy1iYXNlbGluZSBnYXAtMlxcXCI+XFxuICAgICAgICAgICAgICB7Zm9ybWF0TnVtYmVyKHN0YXRzLmFjdGl2ZVNlc3Npb25zQ291bnQpfVxcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJ0ZXh0LXhzIHVwcGVyY2FzZSBmb250LXNhbnMgdHJhY2tpbmctd2lkZXIgdGV4dC1zdWNjZXNzLzcwIGZvbnQtYm9sZFxcXCI+TGl2ZTwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPC9DYXJkQ29udGVudD5cXG4gICAgICAgIDwvQ2FyZD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICB7LyogR2VucmUgRGlzdHJpYnV0aW9uICovfVxcbiAgICAgIDxDYXJkIGNsYXNzTmFtZT1cXFwiYmctY2FyZC84MCBiYWNrZHJvcC1ibHVyIGJvcmRlci1ib3JkZXIgb3ZlcmZsb3ctaGlkZGVuXFxcIj5cXG4gICAgICAgIDxDYXJkSGVhZGVyIGNsYXNzTmFtZT1cXFwiYm9yZGVyLWIgYm9yZGVyLWJvcmRlci81MCBiZy1tdXRlZC8yMFxcXCI+XFxuICAgICAgICAgIDxDYXJkVGl0bGUgY2xhc3NOYW1lPVxcXCJ0ZXh0LXhsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGZvbnQtaGVhZGluZyB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRcXFwiPlxcbiAgICAgICAgICAgIDxUcmVuZGluZ1VwIGNsYXNzTmFtZT1cXFwidy01IGgtNSB0ZXh0LXByaW1hcnlcXFwiIC8+IFBvcHVsYXIgR2VucmVzXFxuICAgICAgICAgIDwvQ2FyZFRpdGxlPlxcbiAgICAgICAgPC9DYXJkSGVhZGVyPlxcbiAgICAgICAgPENhcmRDb250ZW50IGNsYXNzTmFtZT1cXFwicC0wXFxcIj5cXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImRpdmlkZS15IGRpdmlkZS1ib3JkZXIvNTBcXFwiPlxcbiAgICAgICAgICAgIHtzdGF0cy50b3BHZW5yZXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xcbiAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2UgcmVsYXRpdmUgdG8gdGhlIHRvcCBnZW5yZSBmb3IgdGhlIGJhciB3aWR0aFxcbiAgICAgICAgICAgICAgY29uc3QgbWF4Q291bnQgPSBzdGF0cy50b3BHZW5yZXNbMF0/LmNvdW50IHx8IDE7XFxuICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gKGl0ZW0uY291bnQgLyBtYXhDb3VudCkgKiAxMDA7XFxuICAgICAgICAgICAgICBcXG4gICAgICAgICAgICAgIHJldHVybiAoXFxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpdGVtLmdlbnJlfSBjbGFzc05hbWU9XFxcInAtNiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNiBncm91cCBob3ZlcjpiZy1tdXRlZC8zMCB0cmFuc2l0aW9uLWNvbG9yc1xcXCI+XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctOCBmb250LW1vbm8gZm9udC1ib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXJpZ2h0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICN7aW5kZXggKyAxfVxcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJ3LTMyIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICB7aXRlbS5nZW5yZX1cXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleC0xXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJoLTQgYmctbXV0ZWQgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlbiByZWxhdGl2ZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWJzb2x1dGUgdG9wLTAgbGVmdC0wIGgtZnVsbCByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMTAwMCAke1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPT09IDAgPyAnYmctcHJpbWFyeScgOiBcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID09PSAxID8gJ2JnLWFjY2VudCcgOiBcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID09PSAyID8gJ2JnLXNlY29uZGFyeScgOiAnYmctbXV0ZWQtZm9yZWdyb3VuZCdcXG4gICAgICAgICAgICAgICAgICAgICAgICB9YH1cXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9fVxcbiAgICAgICAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctMjQgdGV4dC1yaWdodCBmb250LW1vbm8gZm9udC1ib2xkXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIHtmb3JtYXROdW1iZXIoaXRlbS5jb3VudCl9XFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgKTtcXG4gICAgICAgICAgICB9KX1cXG4gICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L0NhcmRDb250ZW50PlxcbiAgICAgIDwvQ2FyZD5cXG4gICAgPC9kaXY+XFxuICApO1xcbn1cXG5cIiJdLCJmaWxlIjoiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9hcnRpZmFjdHMvZ2FtZXpvbmUvc3JjL3BhZ2VzL2Rhc2hib2FyZC50c3gifQ==