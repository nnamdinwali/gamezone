import { useState } from "react";
import { Link } from "wouter";
import { useListGames, getListGamesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Gamepad2, Coins, Users } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { resolveGameImageUrl } from "@/lib/media";

const GENRES = ["Action", "Adventure", "Puzzle", "Arcade", "Strategy", "RPG", "Shooter", "Sports"];

export function GamesPage() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  
  const debouncedSearch = useDebounce(search, 500);

  const { data: games, isLoading } = useListGames(
    { search: debouncedSearch || undefined, genre: selectedGenre },
    { query: { queryKey: getListGamesQueryKey({ search: debouncedSearch || undefined, genre: selectedGenre }) } }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter">All Games</h1>
        <p className="text-muted-foreground">Discover new worlds and start earning.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search games by title..." 
            className="pl-10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={!selectedGenre ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectedGenre(undefined)}
          className="rounded-full"
        >
          All
        </Button>
        {GENRES.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className="rounded-full"
          >
            {genre}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : games?.length ? (
          games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Card className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:border-primary/50 hover:box-glow h-full flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={resolveGameImageUrl(game.thumbnailUrl) || `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`} 
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 mix-blend-luminosity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${game.id}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
                  <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur border-border text-foreground">
                    {game.genre}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col relative z-10 -mt-8">
                  <div className="bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border/50 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-xl uppercase tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 text-foreground">{game.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {game.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-accent font-mono text-sm font-bold">
                        <Coins className="w-4 h-4" />
                        {game.rewardPerMinute} pts/min
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs font-mono">
                        <Users className="w-3 h-3" />
                        {game.playCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card/30">
            <Gamepad2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-heading font-bold text-xl uppercase mb-2">No Games Found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            {(search || selectedGenre) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearch(""); setSelectedGenre(undefined); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
