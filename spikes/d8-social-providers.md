# Spike D8 -- Social providers official APIs (OM-009)

Date: 2026-11-09
Host: Microsoft Windows NT 10.0.26300 (x64), node Leo; Node.js v24.12.0; Wi-Fi Up (SSID LAGRANGE, LinkSpeed 206.5 Mbps)
Decision: provisional -- **no publishing adapter is runtime-enabled**. Six providers are marked `policy_verified` (official docs cite publish path, least-privilege scopes, and quota/rate notes). Unverified providers stay disabled. Machine table: `social/providers/registry.json`.

## Scope

Prove AC-11.5 prerequisites: verification table with policy URLs; unverified providers disabled; never invent scrape paths or fake engagement APIs.

## Method

1. List candidate networks relevant to matchday announcements, lineups, scores, results, and clips.
2. For each candidate, open official developer policy / API docs only (Google, Meta, TikTok, X, Bluesky/AT Protocol).
3. Record: API surface, OAuth scopes, rate/quota citations, app-type constraints.
4. Encode results in `social/providers/registry.json` with `runtime_enabled=false` for every row.
5. Enforce with `node scripts/check-providers.mjs`.

## Verification table

| Provider | verification | runtime_enabled | Official publish surface | Least-privilege scopes (cited) | Rate / quota (cited) | Key constraints |
|---|---|---|---|---|---|---|
| YouTube | policy_verified | false | Data API v3 `videos.insert` | `https://www.googleapis.com/auth/youtube.upload` | Default 100 `videos.insert`/day + 100 `search.list`/day + 10000 units/day other; midnight PT reset | Google Cloud project; public apps may need verification |
| Instagram (professional) | policy_verified | false | Instagram Content Publishing | `instagram_business_content_publish`, `instagram_business_basic` | Up to 100 posts/day across feed/Stories/Reels via API (Meta 2025-07-08 blog pointing at publishing docs) | Professional accounts; media must be on a public URL at publish time |
| Facebook Pages | policy_verified | false | Graph Page photos/videos + Video API | `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` | Graph/Page platform limits; measure under real token before enable | Page token + CREATE_CONTENT task |
| TikTok | policy_verified | false | Content Posting API (direct post / draft) | `video.publish`, `video.upload` | Creator duration from `creator_info/query`; app audit gates visibility | Scope approval; unaudited clients private-only |
| X | policy_verified | false | API v2 `POST /2/tweets` + media upload | `tweet.write`, `tweet.read`, `users.read`, `media.write` | OAuth 2.0 docs defer to rate-limits page; media duration caps by user Premium | Developer Agreement access tiers; live write entitlement not confirmed without OM app |
| Bluesky | policy_verified | false | AT Proto `com.atproto.repo.createRecord` (`app.bsky.feed.post`) | `atproto`, `transition:generic` (prefer OAuth) | Hosted PDS: 5000 repo points/hour, 35000/day; 3000 HTTP req / 5 min / IP; blob max 50 MiB | OAuth client metadata hosting |
| Twitch | unverified | false | -- | -- | -- | Not evaluated for social cards this spike |
| LinkedIn | unverified | false | -- | -- | -- | Not evaluated this spike |

## Policy URL index

### YouTube

- https://developers.google.com/youtube/terms/developer-policies
- https://developers.google.com/youtube/v3/guides/uploading_a_video
- https://developers.google.com/youtube/v3/docs/videos/insert
- https://developers.google.com/youtube/v3/getting-started
- https://developers.google.com/youtube/v3/determine_quota_cost

### Meta (Instagram + Facebook Pages)

- https://developers.facebook.com/docs/instagram-platform/content-publishing/
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login
- https://developers.facebook.com/docs/video-api/guides/publishing/
- https://developers.facebook.com/docs/graph-api/reference/page/photos/
- https://developers.facebook.com/docs/graph-api/reference/page/videos/
- https://developers.facebook.com/docs/pages-api/manage-pages/
- https://developers.facebook.com/devpolicy
- https://developers.facebook.com/blog/post/2025/07/08/partnership-ads-api-new-features/

### TikTok

- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.tiktok.com/doc/tiktok-api-scopes
- https://developers.tiktok.com/doc/scopes-overview
- https://developers.tiktok.com/

### X

- https://developer.x.com/en/developer-terms/agreement
- https://developer.x.com/en/developer-terms/policy
- https://docs.x.com/x-api/posts/create-post
- https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/authorization-code
- https://docs.x.com/resources/fundamentals/rate-limits

### Bluesky / AT Protocol

- https://atproto.com/specs/oauth
- https://atproto.com/guides/writing-data
- https://docs.bsky.app/docs/get-started
- https://docs.bsky.app/docs/rate-limits
- https://docs.bsky.app/docs/advanced-guides/oauth-client

## Provisional choice

| Concern | Choice |
|---|---|
| Runtime publishing | All adapters disabled (`runtime_enabled=false`) |
| Candidates for OM-035 | youtube, meta_instagram, meta_facebook_pages, tiktok, x, bluesky |
| Rejected this spike | Scraping, unofficial clients, inventing provider APIs |
| Deferred | Twitch, LinkedIn (unverified rows) |

Local drafts and export remain always available without accounts (AC-11.4) and are out of scope for this spike's enablement flags.

## Explicit non-claims

- No OAuth client was registered with any provider.
- No live upload or post was performed.
- No engagement metrics APIs are endorsed.
- Instagram public-media-URL requirement means local-only files cannot publish until a temporary host path exists.

## Status

decided (provisional). Revisit when OM-035 implements adapters: flip `runtime_enabled` only after credentials, encrypted token storage, least-privilege scopes, and AC-11.6 approval UI exist for that provider.
