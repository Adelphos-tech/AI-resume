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

| Doc                  | Type         | Source                                                        | Delivered                              |
| -------------------- | ------------ | ------------------------------------------------------------- | -------------------------------------- |
| Runtime Architecture | architecture | [runtime.architecture.json](source/runtime.architecture.json) | [runtime.html](generated/runtime.html) |

Additional draft sources in `source/` are pre-Archify reference material and
are migrated to the Archify schema as they are proven.
