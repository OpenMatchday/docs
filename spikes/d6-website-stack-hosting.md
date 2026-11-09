# Spike D6 -- Website stack and hosting (OM-007)

Date: 2026-11-09
Host: Microsoft Windows NT 10.0.26300 (x64), node Leo; Node.js v24.12.0; npm 11.6.2
Decision: provisional **GitHub Pages project site** from the `website` repository, publishing a **static HTML/CSS** artifact via a SHA-pinned GitHub Actions workflow. No custom domain. No organization-root Pages repo in this spike.

## Scope

Prove a non-production deploy path for AC-12.2 hosting prerequisites: cited hosting docs, org Pages root assignment understood, no invented domain, no secrets in the client artifact.

## Options table

| Path | Official surface (cited) | Org / URL notes | Secrets in client | Spike result |
|---|---|---|---|---|
| **GitHub Pages (project site) from `website`** | [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site); [Custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages); [REST Pages API](https://docs.github.com/en/rest/pages/pages) | Project site default URL `https://<owner>.github.io/<repository>` -- here `https://openmatchday.github.io/website/`. Org root requires repo named `<owner>.github.io` (lowercase letters per create-site docs). `OpenMatchday/OpenMatchday.github.io` **does not exist** (API 404). | Static files only; `scripts/check-site.mjs` rejects private-key / token-like patterns | **Chosen** -- Pages enabled `build_type=workflow`; workflow deploys `site/` |
| GitHub Pages organization site | Same docs; create-site naming rule for `<owner>.github.io` | Would publish at `https://openmatchday.github.io/` | Same static constraint | **Not created** -- would be a 14th repo outside REPOS.md table; deferred until an explicit org-root task |
| Vercel (or similar host) | [Vercel deployments overview](https://vercel.com/docs/deployments/overview); [Vercel Git integration](https://vercel.com/docs/git) | Project URL on `*.vercel.app` unless a registered custom domain is configured. ARCHITECTURE forbids inventing a domain. | Framework client must still ship without server secrets; platform env vars stay server-side | **Deferred** -- needs a Vercel team/project and env wiring; not required to prove static hosting. `vercel-cli` / `nextjs` skills not exercised this spike |

## Site stack (provisional)

| Layer | Choice | Why |
|---|---|---|
| Markup | Static `site/index.html` + `site/styles.css` | Smallest artifact that proves Pages; no framework runtime |
| Generator | None for this spike | OM-038 may adopt an SSG/framework later without changing the host if it emits static files |
| Publish | Actions: `configure-pages` + `upload-pages-artifact` + `deploy-pages` | Official custom-workflow path; Actions pinned to full SHAs |
| SEO for spike | `noindex,nofollow` | Non-production; honest robots |

## Org Pages root assignment (recorded)

Per [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages):

- User/organization site: repository **must** be named `<owner>.github.io`; default location `https://<owner>.github.io`.
- Project site: any repo; default location `https://<owner>.github.io/<repositoryname>`.

Org API (`GET /orgs/OpenMatchday`): `members_can_create_pages=true`, `members_can_create_public_pages=true`. `GET /orgs/OpenMatchday/pages` returned **404** (no org-level Pages configuration resource in this form). `GET /repos/OpenMatchday/OpenMatchday.github.io` returned **404**. Therefore **organization root Pages is not assigned**; the `website` project site does not become the org root.

Custom domain: not configured; not invented.

## Non-production deploy proof

1. Added static artifact under `website/site/` with `.nojekyll`.
2. Added `.github/workflows/pages.yml` (contents:read + pages:write + id-token:write on deploy path).
3. Enabled Pages via REST: `POST /repos/OpenMatchday/website/pages` with `{"build_type":"workflow"}`.
4. Local check: `node scripts/check-site.mjs` -> `SITE_CHECK_OK`.
5. After push: Actions `pages` workflow run `42593922018` conclusion **success** (build + deploy).
6. HTTP GET `https://openmatchday.github.io/website/` -> **200**, body contains `Website hosting spike` (recorded 2026-11-09 from Windows host Leo, Wi-Fi Up 275 Mbps, network profile LAGRANGE 6).

## Secrets absence

- No OAuth client secrets, API tokens, or private keys in `site/`.
- Community backend secrets remain out of this repo (D7 / AC-10.*).
- Workflow uses `GITHUB_TOKEN` permissions only; no repository secrets required for static publish.

## Provisional choice

**Host:** GitHub Pages project site for `OpenMatchday/website`.
**Stack:** static HTML/CSS artifact; SSG/framework deferred to product pages (OM-038) if still emitting static files to the same Pages workflow.
**Status:** decided (provisional). Revisit if OM-038 needs SSR that cannot be static-exported, or if a registered custom domain / org-root repo is explicitly approved.
