# Developer guide

This guide describes the repository layout, dependency direction, and local verification expectations for Open Matchday contributors working on product code.

## Organization and repos

Organization: [OpenMatchday](https://github.com/OpenMatchday). Workspace root is not a git repository. Each child folder is its own public MIT repository unless a file states otherwise.

| Repo | Owns |
|---|---|
| `app` | Shared application, role shells, event management |
| `media` | Capture, encode, transport, decode, compositing, audio, recording, streaming |
| `protocol` | Versioned pairing, session, command, event, layout schemas |
| `sports` | Sport packages: rules, variants, field, formations, animations, scoreboards |
| `graphics` | Deterministic renderer, scene/template schemas, layout editor model |
| `themes` | Declarative theme packages and validation |
| `social` | Templates, export, official-API publishing adapters |
| `teams` | Public registry data and integrity hashes |
| `community` | Google sign-in, submission queue, GitHub App PR creation |
| `design` | Brand, design system, guidelines |
| `website` | Product site, catalogs, registry browser |
| `docs` | Operator, developer, contributor documentation |
| `.github` | Org profile, templates, reusable workflows |

Forbidden cycles include `media` -> `app`, `sports` -> `teams`, and embedding community secrets in `website`.

## Framework and media

Provisional application framework: Flutter plus native media modules (spike D1). Media transport, codecs, and OCR choices are recorded in `spikes/` with citations. Do not invent encoder availability; probe and record.

## Protocol

Wire schemas are SemVer JSON Schema 2020-12 under `protocol`. Generated TypeScript clients are produced from tagged schema versions. Schemas contain no business logic.

## Sports packages

- Declarative layout validated by JSON Schema.
- Exceptional modules only through a static allowlist. No remote eval.
- Basketball and futsal ship with cited official rule sources and effective dates.
- Later sports appear only as planned catalog entries until scheduled.

## Graphics and themes

- Renderer is deterministic and golden-tested.
- Themes are declarative only: colors, typography, logo slots, tokens, motion.
- WCAG 2.2 AA contrast and font license checks run in theme CI.

## Teams registry

- Stable ids for sport, country, competition, category, club, team, season, squad, player, membership.
- Public fields only. No DOB or contacts.
- Shipped fixtures are clearly fictional.
- Packages publish SemVer plus SHA-256 `integrity.json` for offline cache verification.

## Website generation

`website` commits catalog JSON under `data/` and regenerates HTML in CI. Sync from sibling `sports`, `themes`, and `teams` export scripts when refreshing catalogs. Capability matrix JSON must stay honest with `ARCHITECTURE.md`.

## Security notes

- Never stage secrets, recordings, or consent evidence.
- Social tokens are encrypted at rest and isolated from other credential planes.
- Community backend holds OAuth and GitHub App secrets; clients never receive them.
- Fork PRs get no secrets. Actions pin full commit SHAs.

## Verification habits

- Prefer automated tests and schema validation.
- Label measurements with device, OS, and network.
- Leave capability cells `unverified` until evidence exists.
- English for source, commits, and default UI strings.
