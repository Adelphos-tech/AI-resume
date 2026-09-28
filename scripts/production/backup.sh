#!/usr/bin/env bash
# RoleRace production backup — database (custom pg_dump) + the shared
# application data volume (resumes + profile photos, under /app/.data).
# Usage:  BACKUP_ROOT=/opt/backups/rolerace \
#         ./scripts/production/backup.sh /path/to/repo
#
# Safe by design: never stops the app, never deletes anything, never
# rotates. Run BEFORE every migration/deploy after the first one.
set -Eeuo pipefail

REPO_DIR="${1:?usage: backup.sh <repo-dir>}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/backups/rolerace}"
COMPOSE="docker compose --project-name rolerace --env-file .env.production -f docker-compose.prod.yml"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$BACKUP_ROOT/$TS"
VOL="rolerace_rolerace_resumes"   # <project>_<volume>

mkdir -p "$DEST"
cd "$REPO_DIR"

echo "[backup] postgres → $DEST/db.dump"
$COMPOSE exec -T postgres sh -c \
  'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$DEST/db.dump"

# The named volume mounts /app/.data wholesale — this archive covers both
# resume artifacts and profile-photos/.
echo "[backup] app data volume (resumes + photos) → $DEST/resumes.tar.gz"
docker run --rm \
  -v "$VOL:/data:ro" \
  -v "$DEST:/out" \
  alpine sh -c 'cd /data && tar czf /out/resumes.tar.gz .'

echo "[backup] checksums"
(cd "$DEST" && sha256sum db.dump resumes.tar.gz > SHA256SUMS)

echo "[backup] done → $DEST"
ls -lh "$DEST"
