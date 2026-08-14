import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useManusAuth, startLogin } from '@/lib/manus-auth';
import { Route, Switch, Router as WouterRouter, Link, Redirect } from 'wouter';
import { AppLayout } from '@/components/layout/app-layout';

import { HomePage } from '@/pages/home';
import { GamesPage } from '@/pages/games';
import { GameDetailPage } from '@/pages/game-detail';
import { PlayPage } from '@/pages/play';
import { LeaderboardPage } from '@/pages/leaderboard';
import { EarningsPage } from '@/pages/earnings';
import { UploadPage } from '@/pages/upload';
import { ProfilePage } from '@/pages/profile';
import { DashboardPage } from '@/pages/dashboard';

import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function PublicLanding() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#07140c] text-[#f2fff5]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" className="flex items-center gap-3" data-testid="link-public-logo">
          <img src={`${basePath}/logo.svg`} alt="ROCKCITY GAMES" className="h-10 w-10" />
          <span className="font-heading text-lg font-bold tracking-tight">ROCKCITY GAMES</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="rounded-full px-4 py-2 text-sm font-semibold text-[#b1c9b8] hover:text-[#f2fff5]" data-testid="link-public-sign-in">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-[#39e36b] px-4 py-2 text-sm font-bold text-[#06200d] hover:bg-[#62f07f]" data-testid="link-public-sign-up">Create account</Link>
        </div>
      </header>
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#39e36b]/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#62f07f]">The player-powered arcade</p>
          <h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-[-0.06em] md:text-8xl">Play smart,<br /><span className="text-[#39e36b]">earn daily,</span></h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#b1c9b8] md:text-lg">Discover games worth your time, climb the leaderboard, and turn every focused session into real momentum.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/sign-up" className="rounded-xl bg-[#39e36b] px-6 py-3.5 font-bold text-[#06200d] shadow-[0_12px_40px_rgba(57,227,107,.2)] hover:bg-[#62f07f]" data-testid="link-hero-sign-up">Start playing</Link>
            <Link href="/sign-in" className="rounded-xl border border-[#31533d] bg-[#102319] px-6 py-3.5 font-bold text-[#f2fff5] hover:border-[#62f07f]" data-testid="link-hero-sign-in">I have an account</Link>
          </div>
        </div>
        <div className="mt-20 grid max-w-3xl grid-cols-3 gap-3 md:mt-28 md:gap-5">
          {['Play curated games', 'Track every reward', 'Build your streak'].map((item, i) => <div key={item} className="border-t border-[#31533d] pt-4"><p className="font-mono text-xs text-[#62f07f]">0{i + 1}</p><p className="mt-2 text-sm font-semibold text-[#d9f5df]">{item}</p></div>)}
        </div>
      </section>
    </main>
  );
}

function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4 text-[#f2fff5]">
      <div className="w-full max-w-md rounded-2xl border border-[#31533d] bg-[#102319] p-8 text-center">
        <h1 className="font-heading text-3xl font-bold">{mode === 'sign-in' ? 'Welcome back' : 'Join ROCKCITY GAMES'}</h1>
        <p className="mt-3 text-sm leading-6 text-[#b1c9b8]">Continue with your Manus account. Your GameZone profile and rewards are created automatically after authentication.</p>
        <button type="button" onClick={startLogin} className="mt-7 w-full rounded-xl bg-[#39e36b] px-5 py-3.5 font-bold text-[#06200d] hover:bg-[#62f07f]">{mode === 'sign-in' ? 'Sign in with Manus' : 'Create account with Manus'}</button>
        <Link href="/" className="mt-5 inline-block text-sm text-[#62f07f] hover:underline">Return home</Link>
      </div>
    </main>
  );
}

function AuthLoading({ error, retry }: { error?: unknown; retry: () => void }) {
  const message = error instanceof Error ? error.message : 'The session check is taking longer than expected.';
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4 text-[#f2fff5]">
      <div className="w-full max-w-md rounded-2xl border border-[#31533d] bg-[#102319] p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#39e36b]/30" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold">Connecting to GameZone</h1>
        <p className="mt-3 text-sm leading-6 text-[#b1c9b8]">{message}</p>
        <button type="button" onClick={retry} className="mt-6 rounded-xl bg-[#39e36b] px-5 py-3 font-bold text-[#06200d]">Try again</button>
        <Link href="/" className="ml-3 text-sm text-[#62f07f] hover:underline">Continue as visitor</Link>
      </div>
    </main>
  );
}

function useAuthGate() {
  const auth = useManusAuth();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (auth.isLoaded) return;
    const timer = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, [auth.isLoaded]);
  const retry = () => { setTimedOut(false); window.location.reload(); };
  return { ...auth, timedOut, retry };
}

function HomeRedirect() {
  const { isSignedIn } = useManusAuth();
  // The public landing page must not wait for authentication or an API cold start.
  // Signed-in users are upgraded to the app shell as soon as their session is known.
  return isSignedIn ? <AppLayout><HomePage /></AppLayout> : <PublicLanding />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, error, timedOut, retry } = useAuthGate();
  if (!isLoaded && !timedOut) return <AuthLoading retry={retry} />;
  if (timedOut) return <AuthLoading error={error} retry={retry} />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={() => <AuthScreen mode="sign-in" />} />
      <Route path="/sign-up/*?" component={() => <AuthScreen mode="sign-up" />} />
      <Route path="/games"><Protected><GamesPage /></Protected></Route>
      <Route path="/games/:id"><Protected><GameDetailPage /></Protected></Route>
      <Route path="/play/:id"><Protected><PlayPage /></Protected></Route>
      <Route path="/leaderboard"><Protected><LeaderboardPage /></Protected></Route>
      <Route path="/earnings"><Protected><EarningsPage /></Protected></Route>
      <Route path="/upload"><Protected><UploadPage /></Protected></Route>
      <Route path="/profile/:id"><Protected><ProfilePage /></Protected></Route>
      <Route path="/dashboard"><Protected><DashboardPage /></Protected></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={basePath}><Router /></WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
