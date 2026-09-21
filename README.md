# RoleRace

## Requirements

- Node.js >= 20.9 (developed on Node 22)
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
