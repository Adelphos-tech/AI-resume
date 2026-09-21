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
