# Contributor guide

Thank you for contributing to Open Matchday. Keep changes small, cited, and honest.

## Before you open a PR

1. Confirm which repository owns the change (see the developer guide table).
2. Do not invent APIs, rule numbers, team identities, maintainers, or measurements.
3. Cite official sources for sport rules, provider policies, and licenses.
4. Use fictional people and clubs in fixtures. Never commit real minor photos or consent evidence.
5. Stage exact paths. Never stage secrets, recordings, `CLAUDE.md`, or `AGENTS.md`.

## Sports packages

1. Copy a valid package layout under `sports/packages/<id>/`.
2. Add variants with `official_source` URLs, titles, versions, and effective dates.
3. Run `npm run check`, `npm run validate`, and `npm test` in `sports`.
4. Planned later sports belong in `sports/catalog/planned.json` as `status: planned` and `playable: false`. Do not ship empty playable shells.

## Themes

1. Themes are declarative JSON only. No executable files.
2. Register fonts with redistributeable licenses.
3. Pass WCAG 2.2 AA contrast checks.
4. Use `npm run export` / `npm run import` for bundle round-trips.

## Teams registry

1. Fiction marker required for shipped packages.
2. Stable ids follow `kind:local_id` taxonomy.
3. Public fields only. Ban DOB and contacts.
4. Minors default to no photo.
5. Refresh `integrity.json` after content changes.

## Website catalogs

After sports, themes, or teams catalog exports change:

```bash
cd website
npm run sync
npm run assets
npm run generate
npm run check
```

Commit refreshed `website/data/` artifacts with the website change.

## Docs

Edit guides under `docs/guides/` and privacy under `docs/privacy/`. Rebuild the docs site:

```bash
cd docs
npm run build
npm run check
```

## Commit style

- Imperative subject, English, no emoji, no AI attribution, no `Co-authored-by`.
- Prefer `feat:`, `fix:`, `docs:`, `test:`, `chore:` prefixes.

## Review expectations

Maintainers look for citations, schema validity, tests, and absence of fake capability claims. Capability matrix cells change only with dated measurement notes.
