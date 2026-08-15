import { Link } from "wouter";
import { useEffect, useState } from "react";
import { ChevronRight, Gift, Search, Ticket, Trophy } from "lucide-react";
import {
  getListGamesQueryKey,
  useGetUserStats,
  getGetUserStatsQueryKey,
  useListGames,
} from "@workspace/api-client-react";
import { useCurrency, useMoney } from "@/lib/currency";
import { useCurrentUser } from "@/lib/current-user";

const CASHOUT_TARGET = 2.5;
const SUPPORTED_CURRENCIES = ["USD", "NGN", "GHS", "KES", "ZAR", "GBP", "CAD", "AUD", "EUR", "INR", "BRL", "MXN", "JPY", "CNY"];
const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

export function HomePage() {
  const formatCurrency = useMoney();
  const { currency, setCurrency } = useCurrency();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [currencyStatus, setCurrencyStatus] = useState("");
  useEffect(() => setSelectedCurrency(currency), [currency]);

  const saveCurrency = async () => {
    setCurrencyStatus("Saving…");
    try {
      const response = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyCode: selectedCurrency }),
      });
      if (!response.ok) throw new Error("Could not save currency");
      setCurrencyStatus("Saved. This choice is now locked.");
      setCurrency(selectedCurrency);
    } catch {
      setCurrencyStatus("Could not save currency. Please try again.");
    }
  };
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
  const bannedUser = user as (typeof user & { bannedAt?: string | null; banReason?: string | null }) | undefined;
  const isBanned = Boolean(bannedUser?.bannedAt);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-8 md:max-w-5xl md:space-y-10">
      {isBanned && (
        <section role="alert" className="rounded-2xl border-2 border-red-500/80 bg-red-950/70 p-5 text-red-100 shadow-[0_0_28px_rgba(239,68,68,.18)] md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Account restricted</p>
          <h2 className="mt-2 text-xl font-bold md:text-2xl">Your GameZone account has been banned</h2>
          <p className="mt-2 text-sm leading-6 text-red-100/90">You cannot earn rewards or request withdrawals while this restriction is active. {bannedUser?.banReason ? `Reason: ${bannedUser.banReason}` : "Please contact support if you believe this is a mistake."}</p>
        </section>
      )}
      <section className="space-y-5">
        <div className="flex items-center justify-center gap-3 md:gap-5">
          <details className="group relative">
            <summary className="flex min-w-[132px] cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border-2 border-[#00c978] bg-[#151729] px-4 py-2.5 text-xl font-bold text-white shadow-[0_0_24px_rgba(0,201,120,.08)] outline-none transition hover:bg-[#1b1d32] focus-visible:ring-2 focus-visible:ring-[#00d57e] md:min-w-[220px] md:px-7 md:py-4 md:text-3xl">
              <span>{isUserLoading ? "—" : formatCurrency(balance)}</span>
            </summary>
            <div className="absolute left-1/2 top-full z-20 mt-3 w-[min(88vw,330px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#171827] p-4 text-left text-sm font-normal shadow-2xl">
              <p className="font-semibold text-white">Choose display currency</p>
              <p className="mt-1 text-xs leading-5 text-[#aaa9bb]">Automatic detection is used only until you save a choice. Your saved currency will not be changed by future IP or device checks.</p>
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[#aaa9bb]" htmlFor="dashboard-currency">Currency</label>
              <select id="dashboard-currency" value={selectedCurrency} onChange={(event) => setSelectedCurrency(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#111322] px-3 text-white outline-none focus:border-[#00d57e]">
                {SUPPORTED_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
              <button type="button" onClick={() => void saveCurrency()} className="mt-3 h-11 w-full rounded-xl bg-[#00d57e] font-bold text-[#071b13] transition hover:bg-[#22e696]">Save currency</button>
              {currencyStatus && <p className="mt-2 text-xs text-[#8ef0bd]" role="status">{currencyStatus}</p>}
            </div>
          </details>
          <div className="flex min-w-[116px] items-center justify-center gap-2 rounded-2xl border-2 border-[#8d8cae] bg-[#151729] px-4 py-2.5 text-xl font-bold text-white md:min-w-[200px] md:px-7 md:py-4 md:text-3xl">
            <Ticket className="h-5 w-5 text-[#b6b4df]" />
            <span>0</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-center text-xl font-medium text-white md:text-3xl">Next cashout</div>
        <p className="text-center text-sm text-[#aaa9bb] md:text-base">{isBanned ? "Cashout and reward earning are unavailable while your account is banned." : balance > 0 ? `${formatCurrency(balance)} earned toward ${formatCurrency(CASHOUT_TARGET)} minimum` : `Earn ${formatCurrency(CASHOUT_TARGET)} to reach the cashout minimum`}</p>
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
          <OfferCard game={featured} featured formatCurrency={formatCurrency} disabled={isBanned} />
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
            {offers.map((game) => <OfferCard key={game.id} game={game} formatCurrency={formatCurrency} disabled={isBanned} />)}
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

function OfferCard({ game, featured = false, formatCurrency, disabled = false }: { game: any; featured?: boolean; formatCurrency: (value: number) => string; disabled?: boolean }) {
  const reward = 0.17;
  const content = (
    <div className={`group block overflow-hidden rounded-3xl border border-white/10 bg-[#171827] transition ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5 hover:border-[#00d57e]/60"} ${featured ? "" : "min-w-0"}`}>
      <div className={`${featured ? "h-64 sm:h-80" : "h-36 sm:h-44"} relative overflow-hidden bg-gradient-to-br from-[#f6d500] via-[#233a1d] to-[#11121b]`}>
        {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-center text-2xl font-black uppercase leading-none text-[#ffe900]">{game.title}</div>}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#171827] to-transparent" />
      </div>
      <div className={`${featured ? "p-5" : "p-4"} space-y-3`}>
        <p className={`${featured ? "text-2xl" : "text-base"} truncate font-semibold text-white`}>{game.title}</p>
        <p className="truncate text-sm text-[#aaa9bb]">{game.description || "Install and play to earn rewards"}</p>
        <div className={`${featured ? "py-4 text-xl" : "py-3 text-sm"} rounded-2xl bg-gradient-to-b from-[#08d984] to-[#00ad68] text-center font-bold text-[#071b13] shadow-[0_4px_0_#007e4c]`}>{disabled ? "Earning unavailable" : `Play and Earn ${formatCurrency(reward)}`}</div>
      </div>
    </div>
  );
  return disabled ? content : <Link href={`/games/${game.id}`}>{content}</Link>;
}
