# Spike D7 -- Community backend hosting, database, secret store (OM-008)

Date: 2026-11-09
Host: Microsoft Windows NT 10.0.26300 (x64), node Leo; Node.js v24.12.0; npm 11.6.2; Vercel CLI 58.9.0
Decision: provisional **Vercel Functions (Hono)** + **Neon Postgres (Vercel Marketplace, free_v3)** + **Vercel Environment Variable Secrets** for the `community` backend. Non-production project under personal Hobby team `leo-gallis-projects` (no OpenMatchday Vercel team exists yet).

## Scope

Prove AC-10.* hosting prerequisites: host, database, and secret store chosen with official citations; stub auth endpoint; stub secret read in non-prod.

## Options table

| Layer | Option | Official surface (cited) | Spike result |
|---|---|---|---|
| Host | **Vercel Functions (Hono)** | [Vercel Functions](https://vercel.com/docs/functions); [Hono on Vercel](https://vercel.com/docs/frameworks/backend/hono); [create-a-backend product map](https://vercel.com/docs/frameworks/backend) | **Chosen** -- Hono `index.ts` deployed; `/health` HTTP 200 |
| Host | Managed always-on Node/Python VM | Provider-specific | Deferred -- more ops than needed for request/response OIDC + GitHub App webhooks |
| Host | GitHub Actions only | [Encrypted secrets](https://docs.github.com/en/actions/concepts/security/secrets) | Rejected as sole host -- Actions secrets inject into workflows, not a public OAuth redirect API |
| DB | **Neon Postgres via Marketplace** | [Postgres on Vercel](https://vercel.com/docs/postgres); [Vercel Storage / Marketplace](https://vercel.com/docs/storage); [Neon Vercel-managed integration](https://neon.com/docs/guides/vercel-managed-integration) | **Chosen** -- `vercel install neon --plan free_v3`; `DATABASE_URL` injected; `/spike/db-presence` host `ep-curly-mode-bcwf9c7z-pooler.c-16.us-east-1.aws.neon.tech` |
| DB | Supabase / Prisma / Aurora | Marketplace catalog on same Postgres docs page | Deferred -- Neon free_v3 met spike needs without card |
| Secret store | **Vercel env Secrets** | [Environment variables](https://vercel.com/docs/environment-variables) (encrypted at rest; Secret type write-only after save) | **Chosen** -- `OM_SPIKE_SECRET` type sensitive; `/spike/secret-read` returns length + sha256_12 only |
| Secret store | GitHub Actions secrets | [Using secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) | Complementary for CI only; not the runtime secret store for community |
| Auth stub | Google OpenID Connect (future OM-040) | [Google OIDC](https://developers.google.com/identity/protocols/oauth2/openid-connect) | Stub only this spike -- `/spike/auth-stub` documents provider; no client credentials created |

## Provisional choice

| Concern | Choice | Notes |
|---|---|---|
| Host | Vercel Functions + Hono | Fits OAuth redirects, webhooks, Fluid compute; zero server management |
| Database | Neon Postgres (`free_v3`) | Marketplace injects `DATABASE_URL` / `DATABASE_URL_UNPOOLED` / `PG*` |
| Secret store | Vercel project Environment Variables (Secret) | Holds `OM_SPIKE_SECRET` now; later Google client secret + GitHub App private key |
| Team ownership | Personal Hobby `leo-gallis-projects` for non-prod | OpenMatchday Vercel team absent; production ownership transfer is an owner step |

## Non-production deploy proof

1. Created Vercel project `open-matchday-community` (`prj_z5L7Uj3j9AVIRMol4u5ySSB2Yl76`) with framework `hono`.
2. Set `OM_SPIKE_SECRET` as sensitive env (Preview/Production/Development).
3. Deployed production alias `https://open-matchday-community.vercel.app` (deployment `dpl_BJjBQRDHH2THymGHpKT3aZenPibF`).
4. Provisioned Neon resource `om-community-d7` (`store_NROFCScJBiHOCTX1`, plan `free_v3`, region `iad1`, auth metadata false).
5. Redeployed; verified endpoints from Windows host Leo.

### HTTP results (2026-11-09)

| Path | Status | Notes |
|---|---|---|
| `/health` | 200 | `{"ok":true,"service":"open-matchday-community","spike":"d7"}` |
| `/spike/secret-read` | 200 | `present=true`, `length=39`, `sha256_12=a89e062de3bf`, raw secret not returned |
| `/spike/auth-stub` | 200 | Google OIDC stub; cites Google OIDC docs |
| `/spike/db-presence` | 200 | `present=true`, `scheme=postgresql`, pooler host recorded above |

## Cost / free tier notes

- Vercel Hobby: Functions deploy used for this spike (account plan `hobby`).
- Neon Marketplace `free_v3`: described by CLI/billing plans API as free, no credit card required (1 GB storage / 100 CU-hours per project quoted by plan details).
- Backup: Neon provider backups deferred to OM-040 operational hardening; not claimed verified here.

## Owner follow-ups (not blocking this spike)

1. Create an OpenMatchday Vercel team (or transfer `open-matchday-community` + `om-community-d7` into org-owned scope).
2. Connect GitHub `OpenMatchday/community` for git-triggered deploys.
3. Replace spike secret; add Google OIDC client + GitHub App private key as Secrets (OM-040 / OM-041).

## Status

decided (provisional). Revisit if OAuth redirect or GitHub App private-key handling requires a different secret store (for example external vault) or if org policy forbids Hobby-team hosting for non-prod.
