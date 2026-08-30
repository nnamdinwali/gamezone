import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAppAuth, useConfigureApiAuth } from '@/lib/clerk-auth';
import { SignIn, SignUp } from '@clerk/react';
import { Route, Switch, Router as WouterRouter, Link, Redirect, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/app-layout';
import { CurrencyProvider } from '@/lib/currency';
import { ArrowRight, ArrowUpRight, Check, CirclePlay, Gamepad2, Globe2, ShieldCheck, Sparkles, Trophy, Zap } from 'lucide-react';

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
    <main className="rock-city-shell min-h-[100dvh] overflow-hidden bg-[#0a1110] text-[#f3f7f1]">
      <div className="rock-city-noise pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <header className="relative z-10 border-b border-white/10 bg-[#0a1110]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38e87b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071d16]" data-testid="link-public-logo">
            <span className="flex size-10 items-center justify-center rounded-xl border border-[#38e87b]/40 bg-[#38e87b] text-[#062015] shadow-[0_0_26px_rgba(56,232,123,0.2)] transition-transform duration-200 group-hover:-rotate-6"><Gamepad2 className="size-5" strokeWidth={2.4} /></span>
            <span className="text-[15px] font-bold tracking-[0.24em] text-white">ROCK CITY</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-[#b8c9be] md:flex" aria-label="Primary navigation"><a className="transition-colors hover:text-white" href="#how-it-works">How it works</a><a className="transition-colors hover:text-white" href="#why-rock-city">Why Rock City</a></nav>
          <div className="flex items-center gap-2 sm:gap-3"><Link href="/sign-in" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#d6e2d9] transition-colors hover:bg-white/10 hover:text-white" data-testid="link-public-sign-in">Sign in</Link><Link href="/sign-up" className="rounded-xl bg-[#38e87b] px-4 py-2.5 text-sm font-bold text-[#062015] shadow-[0_8px_26px_rgba(56,232,123,0.18)] transition-all hover:bg-[#61f294]" data-testid="link-public-sign-up">Start playing</Link></div>
        </div>
      </header>
      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:px-12 lg:pb-28 lg:pt-28">
          <div className="max-w-2xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#38e87b]/25 bg-[#38e87b]/[0.07] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#72f79e]"><Sparkles className="size-3.5" />The player-powered arcade</div><h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-7xl lg:text-[88px]">Play smart,<span className="block text-[#38e87b]">earn momentum.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#b8c9be] sm:text-xl">Discover games worth your time, keep your progress in view, and turn every focused session into a reason to come back.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/sign-up" className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#38e87b] px-7 text-base font-bold text-[#062015] shadow-[0_16px_40px_rgba(56,232,123,0.18)] transition-all hover:bg-[#61f294]" data-testid="link-hero-sign-up">Enter Rock City<ArrowRight className="ml-2 size-5" /></Link><a href="#how-it-works" className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-transparent px-7 text-base font-semibold text-white transition-colors hover:bg-white/10" data-testid="link-hero-how-it-works">See how it works</a></div><div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#8fa99a]"><span className="inline-flex items-center gap-2"><Check className="size-4 text-[#38e87b]" />Player-first by design</span><span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#38e87b]" />Secure account access</span></div></div>
          <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end"><div className="pointer-events-none absolute -right-8 -top-10 size-48 rounded-full bg-[#38e87b]/20 blur-3xl" aria-hidden="true" /><div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5"><div className="rounded-[1.45rem] border border-white/10 bg-[#101b18] p-5 sm:p-7"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#70e993]">Your player hub</p><p className="mt-2 text-xl font-bold text-white">A clearer way to play</p></div><span className="flex size-11 items-center justify-center rounded-2xl bg-[#38e87b]/15 text-[#38e87b]"><CirclePlay className="size-5" /></span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Gamepad2 className="size-5 text-[#38e87b]" /><p className="mt-8 text-sm text-[#8fa99a]">Game discovery</p><p className="mt-1 font-bold text-white">Find your next run</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Trophy className="size-5 text-[#38e87b]" /><p className="mt-8 text-sm text-[#8fa99a]">Rewards</p><p className="mt-1 font-bold text-white">See your progress</p></div></div><div className="mt-3 flex items-center justify-between rounded-2xl border border-[#38e87b]/20 bg-[#38e87b]/[0.08] p-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#38e87b] text-[#062015]"><Zap className="size-5" /></span><div><p className="text-sm font-bold text-white">Keep your momentum</p><p className="mt-0.5 text-xs text-[#a8c6b2]">Every session has a place</p></div></div><ArrowUpRight className="size-5 text-[#70e993]" /></div></div><div className="flex items-center justify-between px-2 pb-1 pt-4 text-xs text-[#789686]"><span className="inline-flex items-center gap-1.5"><Globe2 className="size-3.5" />Built for players everywhere</span><span>01 / 03</span></div></div></div>
        </section>
        <section id="how-it-works" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28"><div className="mb-10 flex flex-col justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#70e993]">Simple by design</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Everything you need for a better session.</h2></div><p className="max-w-sm text-sm leading-6 text-[#8fa99a]">No noise. No inflated promises. Just a focused home for discovering games and following your rewards.</p></div><div className="grid gap-4 md:grid-cols-3">{[{n:'01',icon:Gamepad2,title:'Play curated games',body:'Find focused experiences worth your time, all in one player-first home.'},{n:'02',icon:Zap,title:'Track every reward',body:'Keep your sessions and progress visible as you build momentum.'},{n:'03',icon:Trophy,title:'Build your streak',body:'Turn consistent play into a clearer path through your player journey.'}].map(({n,icon:Icon,title,body}) => <article key={n} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-7"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.2em] text-[#70e993]">{n}</span><Icon className="size-5 text-[#38e87b]" /></div><h3 className="mt-14 text-xl font-bold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-[#8fa99a]">{body}</p></article>)}</div></section>
        <section id="why-rock-city" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"><div className="relative overflow-hidden rounded-[2rem] border border-[#38e87b]/20 bg-[#0b2b20] px-6 py-12 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-14"><div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#70e993]">Ready when you are</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Your next focused session starts here.</h2></div><Link href="/sign-up" className="relative mt-7 inline-flex items-center rounded-2xl bg-[#38e87b] px-6 py-3.5 font-bold text-[#062015] transition-colors hover:bg-[#61f294] lg:mt-0">Create your account<ArrowUpRight className="ml-2 size-4" /></Link></div></section>
      </main>
    </main>
  );
}

function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const auth = useAppAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (auth.isSignedIn) navigate('/');
  }, [auth.isSignedIn, navigate]);
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0a1110] px-4 text-[#f2fff5]">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_24px_80px_-48px_rgb(0_0_0_/_0.9)]">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{mode === 'sign-in' ? 'Welcome back' : 'Join ROCKCITY GAMES'}</h1>
        <p className="mt-3 text-sm leading-6 text-[#b1c9b8]">Your Rockcity profile and rewards are created automatically after you continue below.</p>
        <div className="mt-7 flex justify-center">
          {mode === 'sign-in' ? <SignIn routing="hash" signUpUrl="/sign-up" /> : <SignUp routing="hash" signInUrl="/sign-in" />}
        </div>
        <Link href="/" className="mt-5 inline-block text-sm text-[#62f07f] hover:underline">Return home</Link>
      </div>
    </main>
  );
}

function AuthLoading({ error, retry }: { error?: unknown; retry: () => void }) {
  const message = error instanceof Error ? error.message : 'The session check is taking longer than expected.';
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0a1110] px-4 text-[#f2fff5]">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_24px_80px_-48px_rgb(0_0_0_/_0.9)]">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#39e36b]/30" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold">Connecting to Rockcity</h1>
        <p className="mt-3 text-sm leading-6 text-[#b1c9b8]">{message}</p>
        <button type="button" onClick={retry} className="mt-6 rounded-xl bg-[#39e36b] px-5 py-3 font-bold text-[#06200d]">Try again</button>
        <Link href="/" className="ml-3 text-sm text-[#62f07f] hover:underline">Continue as visitor</Link>
      </div>
    </main>
  );
}

function useAuthGate() {
  const auth = useAppAuth();
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
  const { isSignedIn } = useAppAuth();
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

function ApiAuthWiring() {
  // Registers Clerk's session token with the shared API client so every
  // request carries an Authorization: Bearer header. Must run before any
  // page below it fires a data fetch.
  useConfigureApiAuth();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiAuthWiring />
      <CurrencyProvider>
        <WouterRouter base={basePath}><Router /></WouterRouter>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
