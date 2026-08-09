"use strict";
export default `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Route, Switch, Router as WouterRouter, Link, Redirect, useLocation } from 'wouter';
import { useEffect, useRef } from 'react';
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

const basePath = import.meta.env.BASE_URL.replace(/\\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: \`\${window.location.origin}\${basePath}/logo.svg\`,
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
          <img src={\`\${basePath}/logo.svg\`} alt="ROCKCITY GAMES" className="h-10 w-10" />
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
      <Route path="/sign-in/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4"><SignIn routing="path" path={\`\${basePath}/sign-in\`} signUpUrl={\`\${basePath}/sign-up\`} /></div>} />
      <Route path="/sign-up/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-[#07140c] px-4"><SignUp routing="path" path={\`\${basePath}/sign-up\`} signInUrl={\`\${basePath}/sign-in\`} /></div>} />
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

function ClerkApp() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={\`\${basePath}/sign-in\`} signUpUrl={\`\${basePath}/sign-up\`} localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your ROCKCITY GAMES account' } }, signUp: { start: { title: 'Join ROCKCITY GAMES', subtitle: 'Play smart, earn daily,' } } }} routerPush={(to) => setLocation(to.replace(basePath, '') || '/')} routerReplace={(to) => setLocation(to.replace(basePath, '') || '/')} >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <WouterRouter base={basePath}><Router /></WouterRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <ClerkApp />;
}

export default App;
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiaW1wb3J0IHsgUXVlcnlDbGllbnQsIFF1ZXJ5Q2xpZW50UHJvdmlkZXIgfSBmcm9tICdAdGFuc3RhY2svcmVhY3QtcXVlcnknO1xcbmltcG9ydCB7IENsZXJrUHJvdmlkZXIsIFNpZ25JbiwgU2lnblVwLCB1c2VBdXRoLCB1c2VDbGVyayB9IGZyb20gJ0BjbGVyay9yZWFjdCc7XFxuaW1wb3J0IHsgcHVibGlzaGFibGVLZXlGcm9tSG9zdCB9IGZyb20gJ0BjbGVyay9yZWFjdC9pbnRlcm5hbCc7XFxuaW1wb3J0IHsgc2hhZGNuIH0gZnJvbSAnQGNsZXJrL3RoZW1lcyc7XFxuaW1wb3J0IHsgUm91dGUsIFN3aXRjaCwgUm91dGVyIGFzIFdvdXRlclJvdXRlciwgTGluaywgUmVkaXJlY3QsIHVzZUxvY2F0aW9uIH0gZnJvbSAnd291dGVyJztcXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQgeyBBcHBMYXlvdXQgfSBmcm9tICdAL2NvbXBvbmVudHMvbGF5b3V0L2FwcC1sYXlvdXQnO1xcblxcbmltcG9ydCB7IEhvbWVQYWdlIH0gZnJvbSAnQC9wYWdlcy9ob21lJztcXG5pbXBvcnQgeyBHYW1lc1BhZ2UgfSBmcm9tICdAL3BhZ2VzL2dhbWVzJztcXG5pbXBvcnQgeyBHYW1lRGV0YWlsUGFnZSB9IGZyb20gJ0AvcGFnZXMvZ2FtZS1kZXRhaWwnO1xcbmltcG9ydCB7IFBsYXlQYWdlIH0gZnJvbSAnQC9wYWdlcy9wbGF5JztcXG5pbXBvcnQgeyBMZWFkZXJib2FyZFBhZ2UgfSBmcm9tICdAL3BhZ2VzL2xlYWRlcmJvYXJkJztcXG5pbXBvcnQgeyBFYXJuaW5nc1BhZ2UgfSBmcm9tICdAL3BhZ2VzL2Vhcm5pbmdzJztcXG5pbXBvcnQgeyBVcGxvYWRQYWdlIH0gZnJvbSAnQC9wYWdlcy91cGxvYWQnO1xcbmltcG9ydCB7IFByb2ZpbGVQYWdlIH0gZnJvbSAnQC9wYWdlcy9wcm9maWxlJztcXG5pbXBvcnQgeyBEYXNoYm9hcmRQYWdlIH0gZnJvbSAnQC9wYWdlcy9kYXNoYm9hcmQnO1xcblxcbmltcG9ydCBOb3RGb3VuZCBmcm9tICdAL3BhZ2VzL25vdC1mb3VuZCc7XFxuXFxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoe1xcbiAgZGVmYXVsdE9wdGlvbnM6IHtcXG4gICAgcXVlcmllczoge1xcbiAgICAgIHJlZmV0Y2hPbldpbmRvd0ZvY3VzOiBmYWxzZSxcXG4gICAgICByZXRyeTogZmFsc2UsXFxuICAgIH0sXFxuICB9LFxcbn0pO1xcblxcbmNvbnN0IGJhc2VQYXRoID0gaW1wb3J0Lm1ldGEuZW52LkJBU0VfVVJMLnJlcGxhY2UoL1xcXFwvJC8sICcnKTtcXG5jb25zdCBjbGVya1B1YktleSA9IHB1Ymxpc2hhYmxlS2V5RnJvbUhvc3Qod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBpbXBvcnQubWV0YS5lbnYuVklURV9DTEVSS19QVUJMSVNIQUJMRV9LRVkpO1xcbmNvbnN0IGNsZXJrUHJveHlVcmwgPSBpbXBvcnQubWV0YS5lbnYuVklURV9DTEVSS19QUk9YWV9VUkw7XFxuXFxuaWYgKCFjbGVya1B1YktleSkgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFZJVEVfQ0xFUktfUFVCTElTSEFCTEVfS0VZIGluIC5lbnYgZmlsZScpO1xcblxcbmNvbnN0IGNsZXJrQXBwZWFyYW5jZSA9IHtcXG4gIHRoZW1lOiBzaGFkY24sXFxuICBjc3NMYXllck5hbWU6ICdjbGVyaycsXFxuICBvcHRpb25zOiB7XFxuICAgIGxvZ29QbGFjZW1lbnQ6ICdpbnNpZGUnIGFzIGNvbnN0LFxcbiAgICBsb2dvTGlua1VybDogYmFzZVBhdGggfHwgJy8nLFxcbiAgICBsb2dvSW1hZ2VVcmw6IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHtiYXNlUGF0aH0vbG9nby5zdmdgLFxcbiAgfSxcXG4gIHZhcmlhYmxlczoge1xcbiAgICBjb2xvclByaW1hcnk6ICcjMzllMzZiJyxcXG4gICAgY29sb3JGb3JlZ3JvdW5kOiAnI2YyZmZmNScsXFxuICAgIGNvbG9yTXV0ZWRGb3JlZ3JvdW5kOiAnIzlhYjRhMScsXFxuICAgIGNvbG9yRGFuZ2VyOiAnI2ZmOGQ4NicsXFxuICAgIGNvbG9yQmFja2dyb3VuZDogJyMxMDIzMTknLFxcbiAgICBjb2xvcklucHV0OiAnIzBiMWIxMicsXFxuICAgIGNvbG9ySW5wdXRGb3JlZ3JvdW5kOiAnI2YyZmZmNScsXFxuICAgIGNvbG9yTmV1dHJhbDogJyMzMTUzM2QnLFxcbiAgICBmb250RmFtaWx5OiAnUGx1cyBKYWthcnRhIFNhbnMnLFxcbiAgICBib3JkZXJSYWRpdXM6ICcwLjlyZW0nLFxcbiAgfSxcXG4gIGVsZW1lbnRzOiB7XFxuICAgIHJvb3RCb3g6ICd3LWZ1bGwgZmxleCBqdXN0aWZ5LWNlbnRlcicsXFxuICAgIGNhcmRCb3g6ICdiZy1bIzEwMjMxOV0gcm91bmRlZC0yeGwgdy1bNDQwcHhdIG1heC13LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIGJvcmRlciBib3JkZXItWyMzMTUzM2RdJyxcXG4gICAgY2FyZDogJyFzaGFkb3ctbm9uZSAhYm9yZGVyLTAgIWJnLXRyYW5zcGFyZW50ICFyb3VuZGVkLW5vbmUnLFxcbiAgICBmb290ZXI6ICchc2hhZG93LW5vbmUgIWJvcmRlci0wICFiZy10cmFuc3BhcmVudCAhcm91bmRlZC1ub25lJyxcXG4gICAgaGVhZGVyVGl0bGU6ICd0ZXh0LVsjZjJmZmY1XSBmb250LWJvbGQnLFxcbiAgICBoZWFkZXJTdWJ0aXRsZTogJ3RleHQtWyNiMWM5YjhdJyxcXG4gICAgc29jaWFsQnV0dG9uc0Jsb2NrQnV0dG9uVGV4dDogJ3RleHQtWyNmMmZmZjVdJyxcXG4gICAgZm9ybUZpZWxkTGFiZWw6ICd0ZXh0LVsjZDlmNWRmXScsXFxuICAgIGZvb3RlckFjdGlvbkxpbms6ICd0ZXh0LVsjNjJmMDdmXScsXFxuICAgIGZvb3RlckFjdGlvblRleHQ6ICd0ZXh0LVsjYjFjOWI4XScsXFxuICAgIGRpdmlkZXJUZXh0OiAndGV4dC1bIzlhYjRhMV0nLFxcbiAgICBpZGVudGl0eVByZXZpZXdFZGl0QnV0dG9uOiAndGV4dC1bIzYyZjA3Zl0nLFxcbiAgICBmb3JtRmllbGRTdWNjZXNzVGV4dDogJ3RleHQtWyM2MmYwN2ZdJyxcXG4gICAgYWxlcnRUZXh0OiAndGV4dC1bI2ZmZDZkMl0nLFxcbiAgICBsb2dvQm94OiAnaC0xMicsXFxuICAgIGxvZ29JbWFnZTogJ2gtMTAgdy1hdXRvJyxcXG4gICAgc29jaWFsQnV0dG9uc0Jsb2NrQnV0dG9uOiAnYm9yZGVyLVsjMzE1MzNkXSBiZy1bIzE3MmQyMF0gaG92ZXI6YmctWyMyMDQwMmJdJyxcXG4gICAgZm9ybUJ1dHRvblByaW1hcnk6ICdiZy1bIzM5ZTM2Yl0gdGV4dC1bIzA2MjAwZF0gaG92ZXI6YmctWyM2MmYwN2ZdJyxcXG4gICAgZm9ybUZpZWxkSW5wdXQ6ICdib3JkZXItWyMzMTUzM2RdIGJnLVsjMGIxYjEyXSB0ZXh0LVsjZjJmZmY1XScsXFxuICAgIGZvb3RlckFjdGlvbjogJ2JvcmRlci10IGJvcmRlci1bIzMxNTMzZF0nLFxcbiAgICBkaXZpZGVyTGluZTogJ2JnLVsjMzE1MzNkXScsXFxuICAgIGFsZXJ0OiAnYm9yZGVyLVsjN2E0MjNlXSBiZy1bIzM1MWUxZF0nLFxcbiAgICBvdHBDb2RlRmllbGRJbnB1dDogJ2JvcmRlci1bIzMxNTMzZF0gYmctWyMwYjFiMTJdIHRleHQtWyNmMmZmZjVdJyxcXG4gICAgZm9ybUZpZWxkUm93OiAndGV4dC1bI2YyZmZmNV0nLFxcbiAgICBtYWluOiAnYmctdHJhbnNwYXJlbnQnLFxcbiAgfSxcXG59O1xcblxcbmZ1bmN0aW9uIFB1YmxpY0xhbmRpbmcoKSB7XFxuICByZXR1cm4gKFxcbiAgICA8bWFpbiBjbGFzc05hbWU9XFxcIm1pbi1oLVsxMDBkdmhdIG92ZXJmbG93LWhpZGRlbiBiZy1bIzA3MTQwY10gdGV4dC1bI2YyZmZmNV1cXFwiPlxcbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVxcXCJteC1hdXRvIGZsZXggbWF4LXctNnhsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNSBweS02IG1kOnB4LThcXFwiPlxcbiAgICAgICAgPExpbmsgaHJlZj1cXFwiL1xcXCIgY2xhc3NOYW1lPVxcXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1xcXCIgZGF0YS10ZXN0aWQ9XFxcImxpbmstcHVibGljLWxvZ29cXFwiPlxcbiAgICAgICAgICA8aW1nIHNyYz17YCR7YmFzZVBhdGh9L2xvZ28uc3ZnYH0gYWx0PVxcXCJST0NLQ0lUWSBHQU1FU1xcXCIgY2xhc3NOYW1lPVxcXCJoLTEwIHctMTBcXFwiIC8+XFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwiZm9udC1oZWFkaW5nIHRleHQtbGcgZm9udC1ib2xkIHRyYWNraW5nLXRpZ2h0XFxcIj5ST0NLQ0lUWSBHQU1FUzwvc3Bhbj5cXG4gICAgICAgIDwvTGluaz5cXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlxcXCI+XFxuICAgICAgICAgIDxMaW5rIGhyZWY9XFxcIi9zaWduLWluXFxcIiBjbGFzc05hbWU9XFxcInJvdW5kZWQtZnVsbCBweC00IHB5LTIgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtWyNiMWM5YjhdIGhvdmVyOnRleHQtWyNmMmZmZjVdXFxcIiBkYXRhLXRlc3RpZD1cXFwibGluay1wdWJsaWMtc2lnbi1pblxcXCI+U2lnbiBpbjwvTGluaz5cXG4gICAgICAgICAgPExpbmsgaHJlZj1cXFwiL3NpZ24tdXBcXFwiIGNsYXNzTmFtZT1cXFwicm91bmRlZC1mdWxsIGJnLVsjMzllMzZiXSBweC00IHB5LTIgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1bIzA2MjAwZF0gaG92ZXI6YmctWyM2MmYwN2ZdXFxcIiBkYXRhLXRlc3RpZD1cXFwibGluay1wdWJsaWMtc2lnbi11cFxcXCI+Q3JlYXRlIGFjY291bnQ8L0xpbms+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgICA8L2hlYWRlcj5cXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XFxcInJlbGF0aXZlIG14LWF1dG8gbWF4LXctNnhsIHB4LTUgcGItMjAgcHQtMTYgbWQ6cHgtOCBtZDpwYi0zMiBtZDpwdC0yOFxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicG9pbnRlci1ldmVudHMtbm9uZSBhYnNvbHV0ZSAtcmlnaHQtMjQgdG9wLTAgaC04MCB3LTgwIHJvdW5kZWQtZnVsbCBiZy1bIzM5ZTM2Yl0vMTUgYmx1ci0zeGxcXFwiIC8+XFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwicmVsYXRpdmUgbWF4LXctM3hsXFxcIj5cXG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVxcXCJtYi01IGZvbnQtbW9ubyB0ZXh0LXhzIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctWzAuMjRlbV0gdGV4dC1bIzYyZjA3Zl1cXFwiPlRoZSBwbGF5ZXItcG93ZXJlZCBhcmNhZGU8L3A+XFxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XFxcImZvbnQtaGVhZGluZyB0ZXh0LTV4bCBmb250LWJvbGQgbGVhZGluZy1bMC45OF0gdHJhY2tpbmctWy0wLjA2ZW1dIG1kOnRleHQtOHhsXFxcIj5QbGF5IHNtYXJ0LDxiciAvPjxzcGFuIGNsYXNzTmFtZT1cXFwidGV4dC1bIzM5ZTM2Yl1cXFwiPmVhcm4gZGFpbHksPC9zcGFuPjwvaDE+XFxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cXFwibXQtNyBtYXgtdy14bCB0ZXh0LWJhc2UgbGVhZGluZy04IHRleHQtWyNiMWM5YjhdIG1kOnRleHQtbGdcXFwiPkRpc2NvdmVyIGdhbWVzIHdvcnRoIHlvdXIgdGltZSwgY2xpbWIgdGhlIGxlYWRlcmJvYXJkLCBhbmQgdHVybiBldmVyeSBmb2N1c2VkIHNlc3Npb24gaW50byByZWFsIG1vbWVudHVtLjwvcD5cXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcIm10LTkgZmxleCBmbGV4LXdyYXAgZ2FwLTNcXFwiPlxcbiAgICAgICAgICAgIDxMaW5rIGhyZWY9XFxcIi9zaWduLXVwXFxcIiBjbGFzc05hbWU9XFxcInJvdW5kZWQteGwgYmctWyMzOWUzNmJdIHB4LTYgcHktMy41IGZvbnQtYm9sZCB0ZXh0LVsjMDYyMDBkXSBzaGFkb3ctWzBfMTJweF80MHB4X3JnYmEoNTcsMjI3LDEwNywuMildIGhvdmVyOmJnLVsjNjJmMDdmXVxcXCIgZGF0YS10ZXN0aWQ9XFxcImxpbmstaGVyby1zaWduLXVwXFxcIj5TdGFydCBwbGF5aW5nPC9MaW5rPlxcbiAgICAgICAgICAgIDxMaW5rIGhyZWY9XFxcIi9zaWduLWluXFxcIiBjbGFzc05hbWU9XFxcInJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1bIzMxNTMzZF0gYmctWyMxMDIzMTldIHB4LTYgcHktMy41IGZvbnQtYm9sZCB0ZXh0LVsjZjJmZmY1XSBob3Zlcjpib3JkZXItWyM2MmYwN2ZdXFxcIiBkYXRhLXRlc3RpZD1cXFwibGluay1oZXJvLXNpZ24taW5cXFwiPkkgaGF2ZSBhbiBhY2NvdW50PC9MaW5rPlxcbiAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcIm10LTIwIGdyaWQgbWF4LXctM3hsIGdyaWQtY29scy0zIGdhcC0zIG1kOm10LTI4IG1kOmdhcC01XFxcIj5cXG4gICAgICAgICAge1snUGxheSBjdXJhdGVkIGdhbWVzJywgJ1RyYWNrIGV2ZXJ5IHJld2FyZCcsICdCdWlsZCB5b3VyIHN0cmVhayddLm1hcCgoaXRlbSwgaSkgPT4gPGRpdiBrZXk9e2l0ZW19IGNsYXNzTmFtZT1cXFwiYm9yZGVyLXQgYm9yZGVyLVsjMzE1MzNkXSBwdC00XFxcIj48cCBjbGFzc05hbWU9XFxcImZvbnQtbW9ubyB0ZXh0LXhzIHRleHQtWyM2MmYwN2ZdXFxcIj4we2kgKyAxfTwvcD48cCBjbGFzc05hbWU9XFxcIm10LTIgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtWyNkOWY1ZGZdXFxcIj57aXRlbX08L3A+PC9kaXY+KX1cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvc2VjdGlvbj5cXG4gICAgPC9tYWluPlxcbiAgKTtcXG59XFxuXFxuZnVuY3Rpb24gSG9tZVJlZGlyZWN0KCkge1xcbiAgY29uc3QgeyBpc0xvYWRlZCwgaXNTaWduZWRJbiB9ID0gdXNlQXV0aCgpO1xcbiAgaWYgKCFpc0xvYWRlZCkgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVxcXCJtaW4taC1bMTAwZHZoXSBiZy1iYWNrZ3JvdW5kXFxcIiAvPjtcXG4gIHJldHVybiBpc1NpZ25lZEluID8gPEFwcExheW91dD48SG9tZVBhZ2UgLz48L0FwcExheW91dD4gOiA8UHVibGljTGFuZGluZyAvPjtcXG59XFxuXFxuZnVuY3Rpb24gUHJvdGVjdGVkKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0pIHtcXG4gIGNvbnN0IHsgaXNMb2FkZWQsIGlzU2lnbmVkSW4gfSA9IHVzZUF1dGgoKTtcXG4gIGlmICghaXNMb2FkZWQpIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cXFwibWluLWgtWzEwMGR2aF0gYmctYmFja2dyb3VuZFxcXCIgLz47XFxuICBpZiAoIWlzU2lnbmVkSW4pIHJldHVybiA8UmVkaXJlY3QgdG89XFxcIi9zaWduLWluXFxcIiAvPjtcXG4gIHJldHVybiA8QXBwTGF5b3V0PntjaGlsZHJlbn08L0FwcExheW91dD47XFxufVxcblxcbmZ1bmN0aW9uIENsZXJrUXVlcnlDbGllbnRDYWNoZUludmFsaWRhdG9yKCkge1xcbiAgY29uc3QgeyBhZGRMaXN0ZW5lciB9ID0gdXNlQ2xlcmsoKTtcXG4gIGNvbnN0IHByZXZVc2VySWQgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcXG4gIHVzZUVmZmVjdCgoKSA9PiBhZGRMaXN0ZW5lcigoeyB1c2VyIH0pID0+IHtcXG4gICAgY29uc3QgaWQgPSB1c2VyPy5pZCA/PyBudWxsO1xcbiAgICBpZiAocHJldlVzZXJJZC5jdXJyZW50ICE9PSB1bmRlZmluZWQgJiYgcHJldlVzZXJJZC5jdXJyZW50ICE9PSBpZCkgcXVlcnlDbGllbnQuY2xlYXIoKTtcXG4gICAgcHJldlVzZXJJZC5jdXJyZW50ID0gaWQ7XFxuICB9KSwgW2FkZExpc3RlbmVyXSk7XFxuICByZXR1cm4gbnVsbDtcXG59XFxuXFxuZnVuY3Rpb24gUm91dGVyKCkge1xcbiAgcmV0dXJuIChcXG4gICAgPFN3aXRjaD5cXG4gICAgICA8Um91dGUgcGF0aD1cXFwiL1xcXCIgY29tcG9uZW50PXtIb21lUmVkaXJlY3R9IC8+XFxuICAgICAgPFJvdXRlIHBhdGg9XFxcIi9zaWduLWluLyo/XFxcIiBjb21wb25lbnQ9eygpID0+IDxkaXYgY2xhc3NOYW1lPVxcXCJmbGV4IG1pbi1oLVsxMDBkdmhdIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1bIzA3MTQwY10gcHgtNFxcXCI+PFNpZ25JbiByb3V0aW5nPVxcXCJwYXRoXFxcIiBwYXRoPXtgJHtiYXNlUGF0aH0vc2lnbi1pbmB9IHNpZ25VcFVybD17YCR7YmFzZVBhdGh9L3NpZ24tdXBgfSAvPjwvZGl2Pn0gLz5cXG4gICAgICA8Um91dGUgcGF0aD1cXFwiL3NpZ24tdXAvKj9cXFwiIGNvbXBvbmVudD17KCkgPT4gPGRpdiBjbGFzc05hbWU9XFxcImZsZXggbWluLWgtWzEwMGR2aF0gaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLVsjMDcxNDBjXSBweC00XFxcIj48U2lnblVwIHJvdXRpbmc9XFxcInBhdGhcXFwiIHBhdGg9e2Ake2Jhc2VQYXRofS9zaWduLXVwYH0gc2lnbkluVXJsPXtgJHtiYXNlUGF0aH0vc2lnbi1pbmB9IC8+PC9kaXY+fSAvPlxcbiAgICAgIDxSb3V0ZSBwYXRoPVxcXCIvZ2FtZXNcXFwiPjxQcm90ZWN0ZWQ+PEdhbWVzUGFnZSAvPjwvUHJvdGVjdGVkPjwvUm91dGU+XFxuICAgICAgPFJvdXRlIHBhdGg9XFxcIi9nYW1lcy86aWRcXFwiPjxQcm90ZWN0ZWQ+PEdhbWVEZXRhaWxQYWdlIC8+PC9Qcm90ZWN0ZWQ+PC9Sb3V0ZT5cXG4gICAgICA8Um91dGUgcGF0aD1cXFwiL3BsYXkvOmlkXFxcIj48UHJvdGVjdGVkPjxQbGF5UGFnZSAvPjwvUHJvdGVjdGVkPjwvUm91dGU+XFxuICAgICAgPFJvdXRlIHBhdGg9XFxcIi9sZWFkZXJib2FyZFxcXCI+PFByb3RlY3RlZD48TGVhZGVyYm9hcmRQYWdlIC8+PC9Qcm90ZWN0ZWQ+PC9Sb3V0ZT5cXG4gICAgICA8Um91dGUgcGF0aD1cXFwiL2Vhcm5pbmdzXFxcIj48UHJvdGVjdGVkPjxFYXJuaW5nc1BhZ2UgLz48L1Byb3RlY3RlZD48L1JvdXRlPlxcbiAgICAgIDxSb3V0ZSBwYXRoPVxcXCIvdXBsb2FkXFxcIj48UHJvdGVjdGVkPjxVcGxvYWRQYWdlIC8+PC9Qcm90ZWN0ZWQ+PC9Sb3V0ZT5cXG4gICAgICA8Um91dGUgcGF0aD1cXFwiL3Byb2ZpbGUvOmlkXFxcIj48UHJvdGVjdGVkPjxQcm9maWxlUGFnZSAvPjwvUHJvdGVjdGVkPjwvUm91dGU+XFxuICAgICAgPFJvdXRlIHBhdGg9XFxcIi9kYXNoYm9hcmRcXFwiPjxQcm90ZWN0ZWQ+PERhc2hib2FyZFBhZ2UgLz48L1Byb3RlY3RlZD48L1JvdXRlPlxcbiAgICAgIDxSb3V0ZSBjb21wb25lbnQ9e05vdEZvdW5kfSAvPlxcbiAgICA8L1N3aXRjaD5cXG4gICk7XFxufVxcblxcbmZ1bmN0aW9uIENsZXJrQXBwKCkge1xcbiAgY29uc3QgWywgc2V0TG9jYXRpb25dID0gdXNlTG9jYXRpb24oKTtcXG4gIHJldHVybiAoXFxuICAgIDxDbGVya1Byb3ZpZGVyIHB1Ymxpc2hhYmxlS2V5PXtjbGVya1B1YktleX0gcHJveHlVcmw9e2NsZXJrUHJveHlVcmx9IGFwcGVhcmFuY2U9e2NsZXJrQXBwZWFyYW5jZX0gc2lnbkluVXJsPXtgJHtiYXNlUGF0aH0vc2lnbi1pbmB9IHNpZ25VcFVybD17YCR7YmFzZVBhdGh9L3NpZ24tdXBgfSBsb2NhbGl6YXRpb249e3sgc2lnbkluOiB7IHN0YXJ0OiB7IHRpdGxlOiAnV2VsY29tZSBiYWNrJywgc3VidGl0bGU6ICdTaWduIGluIHRvIHlvdXIgUk9DS0NJVFkgR0FNRVMgYWNjb3VudCcgfSB9LCBzaWduVXA6IHsgc3RhcnQ6IHsgdGl0bGU6ICdKb2luIFJPQ0tDSVRZIEdBTUVTJywgc3VidGl0bGU6ICdQbGF5IHNtYXJ0LCBlYXJuIGRhaWx5LCcgfSB9IH19IHJvdXRlclB1c2g9eyh0bykgPT4gc2V0TG9jYXRpb24odG8ucmVwbGFjZShiYXNlUGF0aCwgJycpIHx8ICcvJyl9IHJvdXRlclJlcGxhY2U9eyh0bykgPT4gc2V0TG9jYXRpb24odG8ucmVwbGFjZShiYXNlUGF0aCwgJycpIHx8ICcvJyl9ID5cXG4gICAgICA8UXVlcnlDbGllbnRQcm92aWRlciBjbGllbnQ9e3F1ZXJ5Q2xpZW50fT5cXG4gICAgICAgIDxDbGVya1F1ZXJ5Q2xpZW50Q2FjaGVJbnZhbGlkYXRvciAvPlxcbiAgICAgICAgPFdvdXRlclJvdXRlciBiYXNlPXtiYXNlUGF0aH0+PFJvdXRlciAvPjwvV291dGVyUm91dGVyPlxcbiAgICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cXG4gICAgPC9DbGVya1Byb3ZpZGVyPlxcbiAgKTtcXG59XFxuXFxuZnVuY3Rpb24gQXBwKCkge1xcbiAgcmV0dXJuIDxDbGVya0FwcCAvPjtcXG59XFxuXFxuZXhwb3J0IGRlZmF1bHQgQXBwO1xcblwiIl0sImZpbGUiOiIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2FydGlmYWN0cy9nYW1lem9uZS9zcmMvQXBwLnRzeCJ9