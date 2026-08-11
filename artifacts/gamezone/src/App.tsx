import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Route, Switch, Router as WouterRouter, Link, Redirect } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { CurrencyProvider } from '@/lib/currency';
import { useIsAdmin } from '@/lib/is-admin';

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
// Prefer the explicitly configured key. Host-derived keys only make sense on
// Clerk-managed preview hosts; on GitHub Pages the derivation must not win over
// the real instance key, or the frontend and API end up on different instances.
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  publishableKeyFromHost(window.location.hostname, undefined);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

// Clerk hands us either an absolute URL or a path that may or may not already
// include the deployment base path (e.g. "/gamezone"). Normalise both so that
// navigation works identically at the domain root and in a sub-directory
// deployment such as GitHub Pages.
function toAppPath(to: string) {
  let path = to;
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    path = `${url.pathname}${url.search}${url.hash}`;
  }
  if (!path.startsWith('/')) path = `/${path}`;
  if (basePath && !path.startsWith(`${basePath}/`) && path !== basePath) {
    path = `${basePath}${path}`;
  }
  return path;
}

const afterAuthUrl = `${basePath}/`;

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#39e36b',
    colorForeground: '#f2fff5',
    colorMutedForeground: '#9ab4a1',
    colorDanger: '#ff8d86',
    colorBackground: '#102319',
    colorInput: '#0b1b12',
    colorInputForeground: '#f2fff5',
    colorNeutral: '#31533d',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '0.9rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#102319] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#31533d]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#f2fff5] font-bold',
    headerSubtitle: 'text-[#b1c9b8]',
    socialButtonsBlockButtonText: 'text-[#f2fff5]',
    formFieldLabel: 'text-[#d9f5df]',
    footerActionLink: 'text-[#62f07f]',
    footerActionText: 'text-[#b1c9b8]',
    dividerText: 'text-[#9ab4a1]',
    identityPreviewEditButton: 'text-[#62f07f]',
    formFieldSuccessText: 'text-[#62f07f]',
    alertText: 'text-[#ffd6d2]',
    logoBox: 'h-12',
    logoImage: 'h-10 w-auto',
    socialButtonsBlockButton: 'border-[#31533d] bg-[#172d20] hover:bg-[#20402b]',
    formButtonPrimary: 'bg-[#39e36b] text-[#06200d] hover:bg-[#62f07f]',
    formFieldInput: 'border-[#31533d] bg-[#0b1b12] text-[#f2fff5]',
    footerAction: 'border-t border-[#31533d]',
    dividerLine: 'bg-[#31533d]',
    alert: 'border-[#7a423e] bg-[#351e1d]',
    otpCodeFieldInput: 'border-[#31533d] bg-[#0b1b12] text-[#f2fff5]',
    formFieldRow: 'text-[#f2fff5]',
    main: 'bg-transparent',
  },
};

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

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  return isSignedIn ? <AppLayout><HomePage /></AppLayout> : <PublicLanding />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoaded } = useIsAdmin();
  if (!isLoaded) return <div className="min-h-[50vh]" />;
  if (!isAdmin) return <Redirect to="/" />;
  return <>{children}</>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const id = user?.id ?? null;
    if (prevUserId.current !== undefined && prevUserId.current !== id) queryClient.clear();
    prevUserId.current = id;
  }), [addListener]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={afterAuthUrl} /></div>} />
      <Route path="/sign-up/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={afterAuthUrl} signInFallbackRedirectUrl={afterAuthUrl} /></div>} />
      <Route path="/games"><Protected><GamesPage /></Protected></Route>
      <Route path="/games/:id"><Protected><GameDetailPage /></Protected></Route>
      <Route path="/play/:id"><Protected><PlayPage /></Protected></Route>
      <Route path="/leaderboard"><Protected><LeaderboardPage /></Protected></Route>
      <Route path="/earnings"><Protected><EarningsPage /></Protected></Route>
      <Route path="/upload"><Protected><AdminOnly><UploadPage /></AdminOnly></Protected></Route>
      <Route path="/profile"><Protected><ProfilePage /></Protected></Route>
      <Route path="/profile/:id"><Protected><ProfilePage /></Protected></Route>
      <Route path="/dashboard"><Protected><DashboardPage /></Protected></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkApp() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} signInFallbackRedirectUrl={afterAuthUrl} signUpFallbackRedirectUrl={afterAuthUrl} afterSignOutUrl={afterAuthUrl} localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your ROCKCITY GAMES account' } }, signUp: { start: { title: 'Join ROCKCITY GAMES', subtitle: 'Play smart, earn daily,' } } }} routerPush={(to) => navigate(toAppPath(to))} routerReplace={(to) => navigate(toAppPath(to), { replace: true })} >
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <ClerkQueryClientCacheInvalidator />
          <WouterRouter base={basePath}><Router /></WouterRouter>
        </CurrencyProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <ClerkApp />;
}

export default App;
