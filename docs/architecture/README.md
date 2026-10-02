# RoleRace Architecture

Architecture docs are authored as [Archify](https://github.com/tt-a1i/archify)
JSON sources and rendered by the Archify CLI — source JSON is authoritative,
generated HTML is a derived artifact, and repository evidence is pinned to a
specific revision in `meta.repository`.

## Workflow

Edit a source in `source/`, then from the repo root:

```bash
ARCHIFY=~/.claude/skills/archify/bin/archify.mjs   # or your install path

# 1. validate (showcase quality, repository-backed evidence)
node $ARCHIFY validate architecture \
  docs/architecture/source/runtime.architecture.json \
  --repo-root /path/to/rolerace-checkout --quality showcase --json

# 2. deliver the self-contained HTML
node $ARCHIFY deliver architecture \
  docs/architecture/source/runtime.architecture.json \
  docs/architecture/generated/runtime.html \
  --repo-root /path/to/rolerace-checkout --quality showcase --json

# 3. visual-check the delivered artifact (do not rerender between steps)
node $ARCHIFY visual-check docs/architecture/generated/runtime.html --json
```

`--repo-root` must point at a checkout whose `origin` remote URL and `HEAD`
match the `meta.repository` fields in the source JSON. Repository evidence is
verified against committed bytes at the pinned revision — uncommitted changes
are not evidence.

Delivered HTML is self-contained (inline SVG, no CDN/Mermaid runtime).

## Repository evidence identity

RoleRace currently has **no configured Git remote**. Archify evidence is
revision-pinned to commit `b0268407f5c0adf48f718b00034fab73ba78bd13` and was
validated using a local-only scratch repository identity
(`git@localhost:rolerace/AI-Resume.git`, `link_mode: local-only`). The
synthetic localhost origin is not an upstream repository.

Archify verified the exact commit, blobs, source ranges, and evidence
correspondence in `meta.repository`. It did **not** verify upstream GitHub
ownership or remote authenticity — there is no configured upstream.

## Diagrams

| Doc                               | Type         | Source                                                                            | Delivered                                                          | Pinned    |
| --------------------------------- | ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------- |
| Runtime Architecture              | architecture | [runtime.architecture.json](source/runtime.architecture.json)                     | [runtime.html](generated/runtime.html)                             | `b026840` |
| Auth & Trust Boundaries           | architecture | [auth-security.architecture.json](source/auth-security.architecture.json)         | [auth-security.html](generated/auth-security.html)                 | `8b8d21a` |
| Resume Import → Variant Lifecycle | workflow     | [resume-pipeline.workflow.json](source/resume-pipeline.workflow.json)             | [resume-pipeline.html](generated/resume-pipeline.html)             | `c79226f` |
| AI Review Sequence                | sequence     | [ai-review.sequence.json](source/ai-review.sequence.json)                         | [ai-review.html](generated/ai-review.html)                         | `944f3d0` |
| Career Card / NFC Identity        | sequence     | [career-card-nfc.sequence.json](source/career-card-nfc.sequence.json)             | [career-card-nfc.html](generated/career-card-nfc.html)             | `25146e7` |
| Deployment & Recovery Lifecycle   | workflow     | [deployment-resilience.workflow.json](source/deployment-resilience.workflow.json) | [deployment-resilience.html](generated/deployment-resilience.html) | `1b7f565` |

- **Runtime Architecture** — single-host deployment shape.
- **Auth & Trust Boundaries** — who can access what: Better Auth credential
  sessions, role-scoped workspace guards, resource ownership checks, the
  private→public DTO boundary, and the anonymous `/n/<token>` entry. Rendered
  with real `region`/`security-group` boundaries: Public/Internet, Application
  enforcement, Private data/storage, and External provider are distinct
  zones — PostgreSQL and the media volume never share a boundary with the
  public card surface.
- **Resume Import → Variant Lifecycle** — deterministic extraction (unpdf /
  mammoth, no AI), candidate-confirmed apply with fill-empty merge semantics,
  and the server-side ResumeVariant snapshot boundary.
- **AI Review Sequence** — explicit button-triggered, session- and
  ownership-checked review of an existing ResumeVariant; Groq receives only a
  server-built block/inventory payload, returns qualitative findings validated
  against verbatim anchors, and nothing is persisted or applied.
- **Career Card / NFC Identity** — one permanent `/n/<token>` URL for copy, QR,
  and NFC; publication and DTO filtering are enforced downstream of the
  redirect, so the token routes but never authenticates.
- **Deployment & Recovery Lifecycle** — health-gated `deploy.sh` redeploy,
  operator-run `backup.sh` (pg_dump + data volume + checksums), and an
  explicitly manual restore path — no automated rollback exists.

A1–A6 above are the current core architecture set.
