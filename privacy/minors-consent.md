# Minors photo consent process

Project acceptance criterion: PROJECT_SPEC AC-9.3.

## Default

Minors in the public `teams` registry have **no photo by default**. Validation rejects `is_minor: true` records that include a photo object.

## When a photo may be proposed

A contributor may propose a minor photo only when all of the following are true:

1. A parent or legal guardian has given informed consent for public registry and broadcast-aid use.
2. The contributor confirms rights to the image and accuracy of the player record.
3. The submission goes through the documented contribution path (pull request or website wizard when available).

## Evidence never in Git

Consent forms, emails, ID scans, signed PDFs, and similar evidence **must not** be stored in any Open Matchday Git repository.

- Do not commit files under `consent/` paths.
- Do not add `consent_evidence` fields to registry JSON.
- Maintainers keep any operational evidence outside Git (private ticketing or secret store), never in `teams`.

Registry CI fails closed if consent-evidence paths or fields appear.

## Takedown

Guardians may request photo removal through the [takedown process](takedown.md). Removal from current `main` does not rewrite Git history.
