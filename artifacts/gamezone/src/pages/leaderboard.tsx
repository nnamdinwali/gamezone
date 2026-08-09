"use strict";
export default `import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Coins, Gamepad2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

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
                className={\`p-4 md:p-0 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] \${
                  entry.rank === 1 ? 'border-primary shadow-[0_0_30px_-10px_hsl(var(--primary))]' : 
                  entry.rank === 2 ? 'border-accent shadow-[0_0_20px_-10px_hsl(var(--accent))]' :
                  entry.rank === 3 ? 'border-secondary shadow-[0_0_20px_-10px_hsl(var(--secondary))]' : ''
                }\`}
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4">
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center font-heading text-2xl md:text-xl font-bold text-muted-foreground">
                    {entry.rank === 1 ? <Medal className="w-8 h-8 text-primary" /> :
                     entry.rank === 2 ? <Medal className="w-7 h-7 text-accent" /> :
                     entry.rank === 3 ? <Medal className="w-6 h-6 text-secondary" /> :
                     \`#\${entry.rank}\`}
                  </div>
                  
                  {/* Player */}
                  <div className="col-span-6 flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                    <Avatar className={\`w-12 h-12 md:w-10 md:h-10 border-2 \${
                      entry.rank === 1 ? 'border-primary' : 
                      entry.rank === 2 ? 'border-accent' :
                      entry.rank === 3 ? 'border-secondary' : 'border-border'
                    }\`}>
                      <AvatarImage src={entry.avatarUrl || ''} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={\`font-bold text-lg md:text-base \${isTop3 ? 'text-foreground' : 'text-muted-foreground'}\`}>
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
                    <span className={\`font-mono font-bold text-lg md:text-xl flex items-center gap-2 \${
                      entry.rank === 1 ? 'text-primary text-glow-primary' : 
                      entry.rank === 2 ? 'text-accent text-glow-accent' :
                      entry.rank === 3 ? 'text-secondary' : 'text-foreground'
                    }\`}>
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
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibGVhZGVyYm9hcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiaW1wb3J0IHsgdXNlR2V0TGVhZGVyYm9hcmQsIGdldEdldExlYWRlcmJvYXJkUXVlcnlLZXkgfSBmcm9tIFxcXCJAd29ya3NwYWNlL2FwaS1jbGllbnQtcmVhY3RcXFwiO1xcbmltcG9ydCB7IENhcmQgfSBmcm9tIFxcXCJAL2NvbXBvbmVudHMvdWkvY2FyZFxcXCI7XFxuaW1wb3J0IHsgQXZhdGFyLCBBdmF0YXJGYWxsYmFjaywgQXZhdGFySW1hZ2UgfSBmcm9tIFxcXCJAL2NvbXBvbmVudHMvdWkvYXZhdGFyXFxcIjtcXG5pbXBvcnQgeyBTa2VsZXRvbiB9IGZyb20gXFxcIkAvY29tcG9uZW50cy91aS9za2VsZXRvblxcXCI7XFxuaW1wb3J0IHsgVHJvcGh5LCBNZWRhbCwgQ29pbnMsIEdhbWVwYWQyIH0gZnJvbSBcXFwibHVjaWRlLXJlYWN0XFxcIjtcXG5pbXBvcnQgeyBmb3JtYXRDdXJyZW5jeSwgZm9ybWF0TnVtYmVyIH0gZnJvbSBcXFwiQC9saWIvdXRpbHNcXFwiO1xcblxcbmV4cG9ydCBmdW5jdGlvbiBMZWFkZXJib2FyZFBhZ2UoKSB7XFxuICBjb25zdCB7IGRhdGE6IGxlYWRlcmJvYXJkLCBpc0xvYWRpbmcgfSA9IHVzZUdldExlYWRlcmJvYXJkKHtcXG4gICAgcXVlcnk6IHsgcXVlcnlLZXk6IGdldEdldExlYWRlcmJvYXJkUXVlcnlLZXkoKSB9XFxuICB9KTtcXG5cXG4gIHJldHVybiAoXFxuICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJzcGFjZS15LTggYW5pbWF0ZS1pbiBmYWRlLWluIHNsaWRlLWluLWZyb20tYm90dG9tLTQgZHVyYXRpb24tNTAwXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGV4dC1jZW50ZXIgc3BhY2UteS00IHB5LTggYm9yZGVyLWIgYm9yZGVyLWJvcmRlci81MFxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwibXgtYXV0byB3LTE2IGgtMTYgYmctcHJpbWFyeS8yMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItNFxcXCI+XFxuICAgICAgICAgIDxUcm9waHkgY2xhc3NOYW1lPVxcXCJ3LTggaC04IHRleHQtcHJpbWFyeVxcXCIgLz5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGgxIGNsYXNzTmFtZT1cXFwidGV4dC00eGwgbWQ6dGV4dC01eGwgZm9udC1ib2xkIGZvbnQtaGVhZGluZyB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRlciB0ZXh0LWdsb3ctcHJpbWFyeVxcXCI+R2xvYmFsIExlYWRlcmJvYXJkPC9oMT5cXG4gICAgICAgIDxwIGNsYXNzTmFtZT1cXFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1heC13LXhsIG14LWF1dG9cXFwiPlxcbiAgICAgICAgICBUaGUgZWxpdGUuIFRoZSBkZWRpY2F0ZWQuIFRoZSB0b3AgZWFybmVycyBvbiBSb2NrY2l0eSBHYW1lcy4gUGxheSBtb3JlIHRvIGNsaW1iIHRoZSByYW5rcyBhbmQgc2VjdXJlIHlvdXIgbGVnYWN5LlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJtYXgtdy00eGwgbXgtYXV0byBzcGFjZS15LTRcXFwiPlxcbiAgICAgICAgey8qIEhlYWRlciBSb3cgKi99XFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiaGlkZGVuIG1kOmdyaWQgZ3JpZC1jb2xzLTEyIGdhcC00IHB4LTYgcHktMyB0ZXh0LXhzIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJvcmRlci1iIGJvcmRlci1ib3JkZXIvMzBcXFwiPlxcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiY29sLXNwYW4tMSB0ZXh0LWNlbnRlclxcXCI+UmFuazwvZGl2PlxcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiY29sLXNwYW4tNlxcXCI+UGxheWVyPC9kaXY+XFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJjb2wtc3Bhbi0yIHRleHQtcmlnaHRcXFwiPkdhbWVzIFBsYXllZDwvZGl2PlxcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiY29sLXNwYW4tMyB0ZXh0LXJpZ2h0XFxcIj5Ub3RhbCBFYXJuaW5nczwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICB7LyogTGlzdCAqL31cXG4gICAgICAgIHtpc0xvYWRpbmcgPyAoXFxuICAgICAgICAgIEFycmF5KDEwKS5maWxsKDApLm1hcCgoXywgaSkgPT4gKFxcbiAgICAgICAgICAgIDxDYXJkIGtleT17aX0gY2xhc3NOYW1lPVxcXCJwLTQgYmctY2FyZC81MCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFxcXCI+XFxuICAgICAgICAgICAgICA8U2tlbGV0b24gY2xhc3NOYW1lPVxcXCJ3LTggaC04IHJvdW5kZWQtZnVsbFxcXCIgLz5cXG4gICAgICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMTIgaC0xMiByb3VuZGVkLWZ1bGxcXFwiIC8+XFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleC0xXFxcIj5cXG4gICAgICAgICAgICAgICAgPFNrZWxldG9uIGNsYXNzTmFtZT1cXFwidy0zMiBoLTVcXFwiIC8+XFxuICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgIDxTa2VsZXRvbiBjbGFzc05hbWU9XFxcInctMjQgaC02XFxcIiAvPlxcbiAgICAgICAgICAgIDwvQ2FyZD5cXG4gICAgICAgICAgKSlcXG4gICAgICAgICkgOiBsZWFkZXJib2FyZD8ubGVuZ3RoID8gKFxcbiAgICAgICAgICBsZWFkZXJib2FyZC5tYXAoKGVudHJ5KSA9PiB7XFxuICAgICAgICAgICAgY29uc3QgaXNUb3AzID0gZW50cnkucmFuayA8PSAzO1xcbiAgICAgICAgICAgIHJldHVybiAoXFxuICAgICAgICAgICAgICA8Q2FyZCBcXG4gICAgICAgICAgICAgICAga2V5PXtlbnRyeS51c2VySWR9IFxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BwLTQgbWQ6cC0wIGJnLWNhcmQvODAgYmFja2Ryb3AtYmx1ci1zbSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgaG92ZXI6c2NhbGUtWzEuMDJdICR7XFxuICAgICAgICAgICAgICAgICAgZW50cnkucmFuayA9PT0gMSA/ICdib3JkZXItcHJpbWFyeSBzaGFkb3ctWzBfMF8zMHB4Xy0xMHB4X2hzbCh2YXIoLS1wcmltYXJ5KSldJyA6IFxcbiAgICAgICAgICAgICAgICAgIGVudHJ5LnJhbmsgPT09IDIgPyAnYm9yZGVyLWFjY2VudCBzaGFkb3ctWzBfMF8yMHB4Xy0xMHB4X2hzbCh2YXIoLS1hY2NlbnQpKV0nIDpcXG4gICAgICAgICAgICAgICAgICBlbnRyeS5yYW5rID09PSAzID8gJ2JvcmRlci1zZWNvbmRhcnkgc2hhZG93LVswXzBfMjBweF8tMTBweF9oc2wodmFyKC0tc2Vjb25kYXJ5KSldJyA6ICcnXFxuICAgICAgICAgICAgICAgIH1gfVxcbiAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZmxleCBmbGV4LWNvbCBtZDpncmlkIG1kOmdyaWQtY29scy0xMiBnYXAtNCBpdGVtcy1jZW50ZXIgcHgtNCBtZDpweC02IHB5LTRcXFwiPlxcbiAgICAgICAgICAgICAgICAgIHsvKiBSYW5rICovfVxcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJjb2wtc3Bhbi0xIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGZvbnQtaGVhZGluZyB0ZXh0LTJ4bCBtZDp0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAge2VudHJ5LnJhbmsgPT09IDEgPyA8TWVkYWwgY2xhc3NOYW1lPVxcXCJ3LTggaC04IHRleHQtcHJpbWFyeVxcXCIgLz4gOlxcbiAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnJhbmsgPT09IDIgPyA8TWVkYWwgY2xhc3NOYW1lPVxcXCJ3LTcgaC03IHRleHQtYWNjZW50XFxcIiAvPiA6XFxuICAgICAgICAgICAgICAgICAgICAgZW50cnkucmFuayA9PT0gMyA/IDxNZWRhbCBjbGFzc05hbWU9XFxcInctNiBoLTYgdGV4dC1zZWNvbmRhcnlcXFwiIC8+IDpcXG4gICAgICAgICAgICAgICAgICAgICBgIyR7ZW50cnkucmFua31gfVxcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICAgIHsvKiBQbGF5ZXIgKi99XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImNvbC1zcGFuLTYgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgdy1mdWxsIG1kOnctYXV0byBqdXN0aWZ5LWNlbnRlciBtZDpqdXN0aWZ5LXN0YXJ0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxBdmF0YXIgY2xhc3NOYW1lPXtgdy0xMiBoLTEyIG1kOnctMTAgbWQ6aC0xMCBib3JkZXItMiAke1xcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yYW5rID09PSAxID8gJ2JvcmRlci1wcmltYXJ5JyA6IFxcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yYW5rID09PSAyID8gJ2JvcmRlci1hY2NlbnQnIDpcXG4gICAgICAgICAgICAgICAgICAgICAgZW50cnkucmFuayA9PT0gMyA/ICdib3JkZXItc2Vjb25kYXJ5JyA6ICdib3JkZXItYm9yZGVyJ1xcbiAgICAgICAgICAgICAgICAgICAgfWB9PlxcbiAgICAgICAgICAgICAgICAgICAgICA8QXZhdGFySW1hZ2Ugc3JjPXtlbnRyeS5hdmF0YXJVcmwgfHwgJyd9IC8+XFxuICAgICAgICAgICAgICAgICAgICAgIDxBdmF0YXJGYWxsYmFjayBjbGFzc05hbWU9XFxcImJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFxcXCI+e2VudHJ5LnVzZXJuYW1lLnN1YnN0cmluZygwLCAyKS50b1VwcGVyQ2FzZSgpfTwvQXZhdGFyRmFsbGJhY2s+XFxuICAgICAgICAgICAgICAgICAgICA8L0F2YXRhcj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGZvbnQtYm9sZCB0ZXh0LWxnIG1kOnRleHQtYmFzZSAke2lzVG9wMyA/ICd0ZXh0LWZvcmVncm91bmQnIDogJ3RleHQtbXV0ZWQtZm9yZWdyb3VuZCd9YH0+XFxuICAgICAgICAgICAgICAgICAgICAgIHtlbnRyeS51c2VybmFtZX1cXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgICB7LyogTW9iaWxlIGRpdmlkZXIgKi99XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInctZnVsbCBoLXB4IGJnLWJvcmRlciBtZDpoaWRkZW4gbXktMlxcXCIgLz5cXG5cXG4gICAgICAgICAgICAgICAgICB7LyogR2FtZXMgUGxheWVkICovfVxcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJjb2wtc3Bhbi0yIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtZDpqdXN0aWZ5LWVuZCB3LWZ1bGwgbWQ6dy1hdXRvIHRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvbnQtbW9ub1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XFxcIm1kOmhpZGRlbiB1cHBlcmNhc2UgdGV4dC14cyBmb250LWJvbGRcXFwiPkdhbWVzPC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlxcXCI+PEdhbWVwYWQyIGNsYXNzTmFtZT1cXFwidy00IGgtNCBtZDpoaWRkZW5cXFwiIC8+IHtmb3JtYXROdW1iZXIoZW50cnkuZ2FtZXNQbGF5ZWQpfTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgICB7LyogRWFybmluZ3MgKi99XFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImNvbC1zcGFuLTMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1kOmp1c3RpZnktZW5kIHctZnVsbCBtZDp3LWF1dG9cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJtZDpoaWRkZW4gdXBwZXJjYXNlIHRleHQteHMgZm9udC1ib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFxcXCI+RWFybmluZ3M8L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bmb250LW1vbm8gZm9udC1ib2xkIHRleHQtbGcgbWQ6dGV4dC14bCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiAke1xcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yYW5rID09PSAxID8gJ3RleHQtcHJpbWFyeSB0ZXh0LWdsb3ctcHJpbWFyeScgOiBcXG4gICAgICAgICAgICAgICAgICAgICAgZW50cnkucmFuayA9PT0gMiA/ICd0ZXh0LWFjY2VudCB0ZXh0LWdsb3ctYWNjZW50JyA6XFxuICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnJhbmsgPT09IDMgPyAndGV4dC1zZWNvbmRhcnknIDogJ3RleHQtZm9yZWdyb3VuZCdcXG4gICAgICAgICAgICAgICAgICAgIH1gfT5cXG4gICAgICAgICAgICAgICAgICAgICAgPENvaW5zIGNsYXNzTmFtZT1cXFwidy00IGgtNCBtZDp3LTUgbWQ6aC01XFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0TnVtYmVyKGVudHJ5LnRvdGFsRWFybmluZ3MpfVxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgIDwvQ2FyZD5cXG4gICAgICAgICAgICApO1xcbiAgICAgICAgICB9KVxcbiAgICAgICAgKSA6IChcXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInB5LTEyIHRleHQtY2VudGVyIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBib3JkZXIgYm9yZGVyLWRhc2hlZCByb3VuZGVkLXhsIGJvcmRlci1ib3JkZXJcXFwiPlxcbiAgICAgICAgICAgIE5vIGxlYWRlcmJvYXJkIGRhdGEgYXZhaWxhYmxlIHlldC5cXG4gICAgICAgICAgPC9kaXY+XFxuICAgICAgICApfVxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICk7XFxufVxcblwiIl0sImZpbGUiOiIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2FydGlmYWN0cy9nYW1lem9uZS9zcmMvcGFnZXMvbGVhZGVyYm9hcmQudHN4In0=