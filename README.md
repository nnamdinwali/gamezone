# GameZone / ROCKCITY GAMES

Full source of the GameZone app (pnpm monorepo) — player-powered arcade where users
play games, climb the leaderboard and earn rewards.

This replaces the previous contents of this repository, which contained only a
stale compiled build with no authentication and no source code.

## Structure

```
artifacts/gamezone     React 19 + Vite 7 frontend (wouter, TanStack Query, Tailwind v4, shadcn/ui)
artifacts/api-server   Express 5 API (Clerk auth, Drizzle ORM, pino)
lib/db                 PostgreSQL schema (Drizzle) — users, games, play_sessions, earnings
lib/api-spec           OpenAPI 3.1 contract + Orval codegen config
lib/api-zod            Generated Zod schemas / types
lib/api-client-react   Generated typed React Query hooks
scripts                Workspace scripts
```

## Auth

Authentication is **Clerk**. The sign-in and sign-up pages are Clerk's `<SignIn />`
and `<SignUp />` components rendered at `/sign-in` and `/sign-up` in
`artifacts/gamezone/src/App.tsx`, themed to the ROCKCITY green/dark palette via the
`clerkAppearance` object. Protected routes are wrapped in `<Protected>`; signed-out
visitors see the `PublicLanding` hero.

## Run

```bash
pnpm install
cp .env.example .env            # fill in real values

pnpm --filter @workspace/db run push          # push DB schema
pnpm --filter @workspace/api-server run dev   # API on :5000
pnpm --filter @workspace/gamezone run dev     # frontend
```

Required env: see `.env.example`.

## Notes

- `pnpm-lock.yaml` and `node_modules` are not
  included — run `pnpm install` to regenerate the lockfile.
- Backend: the Manus API at https://gamezoneapi-cp623ub2.manus.space is the only backend.
  Replit and Render deployments are retired; override with `VITE_API_URL` if the API moves.
