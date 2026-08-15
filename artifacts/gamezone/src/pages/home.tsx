import { Link } from "wouter";
import { ChevronRight, Gift, Search, Ticket, Trophy, WalletCards } from "lucide-react";
import {
  getListGamesQueryKey,
  useGetUserStats,
  getGetUserStatsQueryKey,
  useListGames,
} from "@workspace/api-client-react";
import { useMoney } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";

const CASHOUT_TARGET = 2.5;

export function HomePage() {
  const formatCurrency = useMoney();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const userId = user?.id;
  const { data: stats } = useGetUserStats(userId ?? 0, {
    query: { enabled: !!userId, queryKey: getGetUserStatsQueryKey(userId ?? 0) },
  });
  const { data: games = [], isLoading: isGamesLoading } = useListGames(undefined, {
    query: { queryKey: getListGamesQueryKey() },
  });

  const featured = games[0];
  const offers = games.slice(1, 5);
  const balance = Number(user?.balance ?? 0);
  const cashoutProgress = Math.min((balance / CASHOUT_TARGET) * 100, 100);
  const gamesPlayed = stats?.gamesPlayed ?? user?.gamesPlayed ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-8 md:max-w-5xl md:space-y-10">
      <section className="space-y-5">
        <div className="flex items-center justify-center gap-3 md:gap-5">
          <div className="flex min-w-[132px] items-center justify-center gap-2 rounded-2xl border-2 border-[#00c978] bg-[#151729] px-4 py-2.5 text-xl font-bold text-white shadow-[0_0_24px_rgba(0,201,120,.08)] md:min-w-[220px] md:px-7 md:py-4 md:text-3xl">
            <span>{isUserLoading ? "—" : formatCurrency(balance)}</span>
          </div>
          <div className="flex min-w-[116px] items-center justify-center gap-2 rounded-2xl border-2 border-[#8d8cae] bg-[#151729] px-4 py-2.5 text-xl font-bold text-white md:min-w-[200px] md:px-7 md:py-4 md:text-3xl">
            <Ticket className="h-5 w-5 text-[#b6b4df]" />
            <span>0</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-center text-xl font-medium text-white md:text-3xl">Next cashout</div>
        <p className="text-center text-sm text-[#aaa9bb] md:text-base">{balance > 0 ? `${formatCurrency(balance)} earned toward ${formatCurrency(CASHOUT_TARGET)} minimum` : `Earn ${formatCurrency(CASHOUT_TARGET)} to reach the cashout minimum`}</p>
        <div className="h-9 overflow-hidden rounded-full bg-[#242639] p-0.5 md:h-12">
          <div className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-[#00ae65] to-[#08d984] px-5 text-sm font-semibold text-white transition-all duration-700" style={{ width: `${cashoutProgress}%` }}>
            <span className={cashoutProgress === 0 ? "sr-only" : ""}>{formatCurrency(balance)} / {formatCurrency(CASHOUT_TARGET)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-[#ffe21a]" fill="currentColor" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Best for You</h1>
        </div>

        {featured ? (
          <OfferCard game={featured} featured formatCurrency={formatCurrency} />
        ) : isGamesLoading ? (
          <div className="h-[390px] animate-pulse rounded-3xl bg-[#1b1c2b]" />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#1b1c2b] p-8 text-center text-[#aaa9bb]">No offers are available yet.</div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8 text-[#ffe21a]" fill="currentColor" strokeWidth={1.5} />
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">More Offers</h2>
          </div>
          <Link href="/games" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-[#00d57e]">View all <ChevronRight className="h-5 w-5" /></Link>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {offers.map((game) => <OfferCard key={game.id} game={game} formatCurrency={formatCurrency} />)}
          </div>
        ) : (
          <Link href="/games" className="flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-[#171827] px-5 py-10 text-[#aaa9bb] hover:text-white md:min-h-52 md:text-lg"><Search className="h-5 w-5" /> Browse all games</Link>
        )}
      </section>

      <div className="rounded-2xl border border-white/10 bg-[#171827] px-4 py-3 text-center text-xs text-[#8f8ea1]">
        {gamesPlayed > 0 ? `${gamesPlayed} games played · Keep going to unlock more rewards` : "Play your first game to start earning rewards"}
      </div>
    </div>
  );
}

function OfferCard({ game, featured = false, formatCurrency }: { game: any; featured?: boolean; formatCurrency: (value: number) => string }) {
  const reward = 0.17;
  return (
    <Link href={`/games/${game.id}`} className={`group block overflow-hidden rounded-3xl border border-white/10 bg-[#171827] transition hover:-translate-y-0.5 hover:border-[#00d57e]/60 ${featured ? "" : "min-w-0"}`}>
      <div className={`${featured ? "h-64 sm:h-80" : "h-36 sm:h-44"} relative overflow-hidden bg-gradient-to-br from-[#f6d500] via-[#233a1d] to-[#11121b]`}>
        {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-center text-2xl font-black uppercase leading-none text-[#ffe900]">{game.title}</div>}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#171827] to-transparent" />
      </div>
      <div className={`${featured ? "p-5" : "p-4"} space-y-3`}>
        <p className={`${featured ? "text-2xl" : "text-base"} truncate font-semibold text-white`}>{game.title}</p>
        <p className="truncate text-sm text-[#aaa9bb]">{game.description || "Install and play to earn rewards"}</p>
        <div className={`${featured ? "py-4 text-xl" : "py-3 text-sm"} rounded-2xl bg-gradient-to-b from-[#08d984] to-[#00ad68] text-center font-bold text-[#071b13] shadow-[0_4px_0_#007e4c]`}>
          Play and Earn {formatCurrency(reward)}
        </div>
      </div>
    </Link>
  );
}
