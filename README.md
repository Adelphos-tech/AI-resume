# RoleRace

## Requirements

- Node.js 20.19+ (Node 20 LTS) or 22.12+ (Node 22 LTS); newer supported LTS
  versions also work. Developed on Node 22.18. Required by Prisma 7.
- pnpm 10 (managed via Corepack: `corepack enable`)

## Install

pnpm install

## Development

pnpm dev

## Type Check

pnpm typecheck

## Lint

pnpm lint

## Production Build

pnpm build

## Environment

Copy `.env.example` to `.env` and set real values — `.env` is gitignored
and must never be committed. `DATABASE_URL` is required and validated at
runtime in server code; the app fails fast with a clear error (without
printing the value) when it is missing or malformed.

## Database (local development)

Requires Docker with Docker Compose.

1. `cp .env.example .env` and set a local `POSTGRES_PASSWORD`
   (change `POSTGRES_PORT` if 5432 is already in use on your machine).
2. `pnpm db:up` — start PostgreSQL 18 in the background
3. `pnpm db:status` — show container status/health
4. `pnpm db:logs` — follow database logs
5. `pnpm db:down` — stop the database

Data is stored in the `rolerace_postgres_data` Docker volume and survives
`pnpm db:down` / restarts. Deleting that volume
(`docker compose down -v`) permanently destroys local development data.

## Prisma

The project uses Prisma ORM 7 with the `@prisma/adapter-pg` PostgreSQL
driver adapter. The shared server-only client lives in `src/server/db.ts`;
generated client output goes to `src/generated/` (not committed).

Requires the database running (`pnpm db:up`) and `DATABASE_URL` set in `.env`.

- `pnpm db:generate` — generate Prisma Client (runs automatically before
  `dev`/`build`/`typecheck`)
- `pnpm db:validate` — validate `prisma/schema.prisma`
- `pnpm db:migrate` — create/apply a development migration
- `pnpm db:studio` — open Prisma Studio

No application models exist yet; migrations start with the first real model.

## Health Check

`GET /api/health` — returns `200` with
`{"status":"ok","database":"connected"}` when the app and PostgreSQL are
available, or `503` with `{"status":"degraded","database":"unavailable"}`
when the database check fails. Responses are never cached.

## Quality

- `pnpm format` — format all files with Prettier
- `pnpm format:check` — verify formatting without changes
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript (generates route types first)
- `pnpm build` — production build
- `pnpm check` — runs format:check, lint, typecheck, and build

GitHub Actions runs the same non-mutating checks on pushes to `main` and on
pull requests (`.github/workflows/ci.yml`).

## UI

Styling uses Tailwind CSS 4 and shadcn/ui components (`src/components/ui`) with
design tokens defined as CSS variables in `src/app/globals.css`.
