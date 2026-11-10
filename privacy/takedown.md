# Takedown process

Project acceptance criterion: PROJECT_SPEC AC-9.6.

## Scope

This process covers public registry content in the `teams` repository (clubs, teams, players, photos, and related metadata) and mirrored copies published through Open Matchday website catalogs after generation tasks land.

## How to request a takedown

1. Open a GitHub issue in [OpenMatchday/teams](https://github.com/OpenMatchday/teams) with title prefix `takedown:` and identify the stable ids or file paths.
2. Or email the organization maintainers through the contact method published on the Open Matchday website privacy page when that page ships.
3. Include enough detail to locate the content (stable id, package id, photo path). Do not send unnecessary personal data.

## What maintainers do

1. Acknowledge the request.
2. Remove or replace the content on the default branch via a normal pull request or maintainer commit.
3. Remove generated website catalog entries in a follow-up publish when catalogs exist.
4. Keep a short public note of the action (issue comment or PR) without publishing private evidence.

## Git history (important)

Open Matchday **does not promise total erasure of Git history**.

Git retains prior commits. Removing a file from `main` stops shipping it in new clones and releases, but historical commits, forks, and caches may still contain prior copies. Maintainers will not rewrite public history for routine takedowns.

If a photo was included without rights or a person objects to continued publication, maintainers prioritize stopping distribution on current `main` and future releases.

## Related

- Minors and photos: [minors-consent.md](minors-consent.md)
- Registry field bans: `teams/docs/privacy.md`
