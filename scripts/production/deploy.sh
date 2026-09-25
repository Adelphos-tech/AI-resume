#!/usr/bin/env bash
# RoleRace deployment helper — conservative; no Nginx/DNS/TLS changes,
# no pruning, no volume deletion, no DB resets.
#
# Usage (from the repo checkout, e.g. /opt/rolerace):
#   ./scripts/production/deploy.sh
#
# Requirement: BEFORE running this on an existing production DB, take a
# backup:  ./scripts/production/backup.sh "$PWD"
set -Eeuo pipefail

COMPOSE="docker compose --project-name rolerace --env-file .env.production -f docker-compose.prod.yml"
MIN_FREE_KB=$((10 * 1024 * 1024))   # 10 GiB
MIN_FREE_PCT=15

fail() { echo "ERROR: $*" >&2; exit 1; }

[ -f .env.production ] || fail ".env.production not found — copy .env.production.example and fill it"

# --- disk threshold: >=10 GiB free AND >=15% of filesystem ----------------
avail_kb=$(df -Pk / | awk 'NR==2 {print $4}')
total_kb=$(df -Pk / | awk 'NR==2 {print $2}')
pct=$(( avail_kb * 100 / total_kb ))
[ "$avail_kb" -ge "$MIN_FREE_KB" ] || fail "free space ${avail_kb}KiB < 10GiB"
[ "$pct" -ge "$MIN_FREE_PCT" ] || fail "free space ${pct}% < 15%"
echo "[deploy] disk OK (${pct}% free)"

[ -f Dockerfile ] || fail "run from the repo root (Dockerfile not found)"

echo "[deploy] building app + migrate targets"
$COMPOSE build app migrate

echo "[deploy] starting postgres"
$COMPOSE up -d postgres

echo "[deploy] waiting for postgres health"
for i in $(seq 1 60); do
  if [ "$(docker inspect -f '{{.State.Health.Status}}' rolerace-postgres 2>/dev/null)" = "healthy" ]; then
    echo "[deploy] postgres healthy"
    break
  fi
  [ "$i" -lt 60 ] || fail "postgres did not become healthy"
  sleep 2
done

echo "[deploy] applying migrations (one-shot)"
$COMPOSE run --rm migrate

echo "[deploy] starting app"
$COMPOSE up -d app

echo "[deploy] waiting for app health"
for i in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:3100/api/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "[deploy] app healthy at http://127.0.0.1:3100"
    exit 0
  fi
  [ "$i" -lt 60 ] || fail "app did not become healthy — check: docker logs rolerace-app"
  sleep 3
done
