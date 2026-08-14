# GameZone deployment

GameZone is deployed as three coordinated pieces: the player frontend, the separate admin frontend, and the API server backed by PostgreSQL. The attached `gamezone-backend.zip` is not the canonical deployment source; deploy `artifacts/api-server` and the shared `lib/db` package from this repository.

## Required environment variables

The API server requires `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `PORT`. The frontends require `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`, and their respective `BASE_PATH` values. The API must allow the production frontend origins through `CLERK_AUTHORIZED_PARTIES` and CORS. For the current GitHub Pages workflow, the player path is `/gamezone/` and the admin path is `/gamezone/admin/`.

## Database schema

Before starting the updated API, apply the Drizzle schema against the production database:

```bash
DATABASE_URL="$DATABASE_URL" pnpm --filter @workspace/db run push
```

This adds the nullable account-ban columns and the `game_milestones` and `milestone_claims` tables. Run this once per environment after reviewing the generated SQL and taking a database backup.

## API build and start

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
NODE_ENV=production PORT=5000 pnpm --filter @workspace/api-server run start
```

The public API base must expose `/api`, including `/api/users/me`, `/api/games/:id`, `/api/admin/overview`, `/api/admin/users`, `/api/admin/games/:gameId/milestones`, and `/api/game-events/milestone`.

## Frontend deployment

The existing `.github/workflows/deploy-pages.yml` builds the player frontend and the separate admin app into one GitHub Pages artifact. Configure repository secrets `VITE_API_URL` and `VITE_CLERK_PUBLISHABLE_KEY`, then let the workflow deploy on `main`. The resulting admin URL is `/gamezone/admin/`; it is a separate application bundle even though it shares the Pages origin.

## Authentication and security

The Clerk application must include both the player and admin Pages URLs in its authorized parties. Administrative authorization is enforced server-side from Clerk public metadata with `role: "admin"`; hiding admin links in the player frontend is not a security boundary. The milestone endpoint is authenticated and idempotent by `eventId`, but production games should eventually sign milestone events with a per-game secret or a GameZone SDK before real-money rewards are enabled.
