# syntax=docker/dockerfile:1

FROM node:22.18.0-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# bookworm-slim lacks openssl; Prisma engine tooling expects it present.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Dependencies: pinned pnpm via Corepack + frozen lockfile
FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build: generate Prisma client and compile Next.js standalone output.
# These ENVs are non-secret placeholders required by prisma config loading
# and build-time env validation only; no database connection is made and
# they never reach the runtime image.
FROM base AS builder
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    BETTER_AUTH_SECRET=build-placeholder-not-a-real-secret-00 \
    BETTER_AUTH_URL=http://localhost:3000
# Chromium for server-side resume PDF export; shared path copied to runner.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN pnpm exec playwright install chromium
RUN pnpm build

# Runtime: standalone server only, non-root
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Headless-Chromium runtime libraries (bookworm) for PDF export.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
      libatspi2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
      libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
      libpango-1.0-0 libcairo2 libx11-6 libxcb1 libxext6 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=builder /ms-playwright /ms-playwright
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Standalone nft tracing drops playwright runtime assets (browsers.json);
# overlay the complete packages. Paths are version-pinned — a playwright
# bump must update these two paths.
COPY --from=deps /app/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core \
    ./node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core
COPY --from=deps /app/node_modules/.pnpm/playwright@1.63.0/node_modules/playwright \
    ./node_modules/.pnpm/playwright@1.63.0/node_modules/playwright
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir -p /app/.data/resumes && chown -R node:node /app/.data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
