# RoleRace Engineering Risk Register

Derived from the A1–A6 source-backed architecture set and the repository at
`c3a4f4f`. Each item is grounded in inspected implementation, not intent.

Legend: **P0** immediate data/security risk · **P1** reliability/integrity ·
**P2** resilience/maintainability · **P3** nice-to-have.

## Coverage matrix

| Area                          | Implementation source-backed | Automated regression coverage   |
| ----------------------------- | ---------------------------- | ------------------------------- |
| Resume import → MCP → variant | Yes (A3)                     | **None** — no test files exist  |
| AI Review                     | Yes (A4)                     | **None**                        |
| Career Card / NFC / DTO       | Yes (A5)                     | **None**                        |
| Deployment lifecycle          | Yes (A6)                     | **None** — shell syntax only    |
| Backup / recovery             | Yes (A6)                     | **None** — never restore-tested |

No `*.test.*`/`*.spec.*` files and no test runner exist in the repository at
this revision.

## Risks

### R1 — P1 · Privacy/access-control invariants are untested

- **Implementation:** publication gates at `/n`, `/u`, and the DTO builder;
  session + ownership checks for candidate/admin surfaces (A2, A5).
- **Why it matters:** these are the only barriers between private candidate
  data and anonymous visitors. A regression in `buildPublicProfileDTO`,
  `isPublished` filtering, or the ownership check would silently expose
  private fields.
- **Evidence:** `src/server/public-profile/public-profile.ts:445-555`,
  `src/app/n/[token]/route.ts:14-22`,
  `src/app/u/[slug]/page.tsx:52-99`, `src/server/session.ts:24-62`.
- **Action:** focused regression tests: unpublished → 404 at both routes,
  wrong-owner variant → reject, DTO omits unflagged contact fields and
  internal ids/keys.
- **Priority:** P1 — highest blast radius; no evidence of a current defect.

### R2 — P1 · Recoverability is unproven

- **Implementation:** `backup.sh` produces `pg_dump -Fc` + `.data` tar.gz +
  `SHA256SUMS`. No restore script, no `pg_restore --list`, no test restore,
  checksums generated but never re-verified, no retention pruning.
- **Why it matters:** backups exist on disk but the repository contains no
  exercised path from artifact → working state. First restore attempt would
  happen during an incident.
- **Evidence:** `scripts/production/backup.sh` (entire file is backup-only;
  header: "never rotates").
- **Action:** documented restore procedure + a restore-smoke step
  (`pg_restore --list` on the dump, tar listing) run after each backup;
  decide retention policy.
- **Priority:** P1 — data-loss risk is conditional, but recovery confidence
  is currently zero-evidence.

### R3 — P1 · Resume import mutation path untested

- **Implementation:** confirm → `importResumeToCareerProfile` → fill-empty
  basics + append-dedupe + sha256 stale-review guard (A3).
- **Why it matters:** this is the only write path from uploaded content into
  canonical `MasterCareerProfile`. A regression could overwrite populated
  fields or accept a stale extraction.
- **Evidence:** `src/server/resume-import/import-to-profile.ts:56-70,128-146,364`.
- **Action:** tests asserting fill-empty never overwrites, dedupe keys work,
  and revision mismatch rejects.
- **Priority:** P1 — irreversible-ish canonical data mutation.

### R4 — P1 · Deploy health failure leaves new app running

- **Implementation:** `deploy.sh` waits 60×3s on `/api/health`; on failure it
  exits non-zero — but the newly started `rolerace-app` container remains up
  serving traffic via Nginx. No rollback exists anywhere.
- **Why it matters:** a degraded app can go live and keep serving while the
  script reports failure.
- **Evidence:** `scripts/production/deploy.sh:46-59`.
- **Action:** define rollback semantics (previous image tag or restore) or at
  minimum stop the unhealthy container on gate failure.
- **Priority:** P1 — availability-impacting failure mode.

### R5 — P2 · ResumeVariant immutability is application-level only

- **Implementation:** `profileSnapshot` + `resumeData` stored at create; no
  update function exists in `resume-variants.ts` — nothing enforces it at the
  database layer.
- **Why it matters:** the "stable snapshot" property depends entirely on code
  discipline. Any future write path (admin tooling, data fix, new feature)
  silently weakens it. Tradeoff: a DB constraint (trigger/column privilege)
  would block legitimate fixes too; an application-level guard or audit is
  lighter and more maintainable.
- **Evidence:** `src/server/resume-variants/resume-variants.ts` (create/get/
  list only), `prisma/schema.prisma:220-236`.
- **Action:** keep application-level enforcement but add a regression test
  asserting snapshot stability after MCP mutation; consider a code-comment/
  lint guard discouraging new variant update paths.
- **Priority:** P2 — invariant is currently honored; risk is future drift.

### R6 — P2 · Pre-deploy backup is manual-only

- **Implementation:** `deploy.sh` never invokes `backup.sh`; a comment tells
  the operator to run it first. Deployment proceeds without any backup.
- **Why it matters:** operator can deploy past a destructive migration with
  no fresh recovery point.
- **Evidence:** `scripts/production/deploy.sh:8-9` (comment), no call site.
- **Action:** optional `BACKUP_TAKEN=1` env gate or a `--with-backup` flag so
  the happy path includes it.
- **Priority:** P2 — mitigable by procedure; becomes P1 if operators forget.

### R7 — P2 · Health gate depth is DB-connectivity only

- **Implementation:** `/api/health` runs `SELECT 1` → 200 `ok` / 503
  `degraded`. Both the Docker healthcheck and deploy gate trust it.
- **Why it matters:** health can be green while `.data` writes fail,
  Playwright rendering is broken, or Groq is unreachable. Deploy "healthy"
  ≠ feature-healthy.
- **Evidence:** `src/app/api/health/route.ts:10-22`,
  `docker-compose.prod.yml` app healthcheck, `deploy.sh:49-59`.
- **Action:** keep `/api/health` as liveness; add a separate deep/readiness
  probe (not synchronous provider calls — e.g., `.data` write-probe) only if
  operational need justifies it.
- **Priority:** P2 — observation gap, not a defect.

### R8 — P2 · Backup set is sequential, not a consistent recovery point

- **Implementation:** pg_dump then volume tar — independent operations;
  changes between them are not coordinated.
- **Why it matters:** restore may yield DB/file state from slightly different
  moments (e.g., a media row referencing a file not yet archived).
- **Evidence:** `scripts/production/backup.sh:21-31` sequential commands.
- **Action:** document expected skew; optionally pause writes or tolerate —
  for this data shape the practical risk is low.
- **Priority:** P2 — theoretical inconsistency, bounded blast radius.

### R9 — P3 · Repo Nginx config does not capture live TLS

- **Implementation:** `deploy/nginx/rolerace.conf` contains `listen 80` proxy
  only; no TLS directives. Live TLS, if any, is managed outside the repo.
- **Why it matters:** edge config can drift from what the repository
  documents; this is a documentation/config-ownership gap, not evidence that
  production lacks HTTPS.
- **Evidence:** `deploy/nginx/rolerace.conf:9-15`.
- **Action:** document where TLS is terminated, or bring the server block
  under config management.
- **Priority:** P3 — drift/documentation risk.

### R10 — P3 · No CI/CD pipeline

- **Implementation:** deploy is a manual operator-run script from a repo
  checkout; no build/test/deploy automation exists.
- **Why it matters:** correctness depends on operator discipline; every prior
  risk is amplified by the absence of an automated pipeline that would run
  checks.
- **Evidence:** `scripts/production/deploy.sh` header, `.github/workflows/ci.yml`
  covers lint/build only.
- **Action:** eventually a release pipeline running typecheck + the future
  test suite before build.
- **Priority:** P3 — highest-leverage enabler but not urgent alone.

## Recommended next engineering stage

**Privacy & access-control regression test foundation (R1).**

Narrowly scoped: establish automated regression coverage for the
privacy/access invariants already identified — unpublished profiles
inaccessible anonymously, `/n` token does not bypass publication, the public
DTO omits hidden contact fields, a Candidate cannot reach another
Candidate's ResumeVariant, and protected operations require the correct
session/role.

Rationale: these are privacy/access-control invariants with zero automated
coverage; a regression could silently expose or permit access to data. The
risk is regression exposure — no known exploit. Tests would protect several
A2/A4/A5 trust boundaries without changing product behavior. The stage
should first inspect the current Next.js/TypeScript stack and select the
smallest appropriate test setup.

Backup restore-verification (R2) remains a separate subsequent stage — it is
not bundled here.
