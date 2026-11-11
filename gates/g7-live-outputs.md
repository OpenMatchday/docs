# G7 / AC-3.1 / AC-3.11 — Multiple live outputs (OM-033)

Date: 2026-11-11
Task: OM-033

## Scope

Director can send Program to any number of supported live aspects (`16:9`,
`9:16`, `1:1`) that pass measurement for the director device class, each with
an independent applied layout and a raw stream destination.

Enablement still follows OM-026 release gates: only measured combinations
(`verified` / `partial` aspect flags + combination cell) are enabled in release
builds. Non-release builds may enable unverified combinations for measurement.

## Destinations (raw streams)

OM-033 uses raw stream destinations only:

| Kind | Harness | Notes |
|---|---|---|
| MPEG-TS file | `file:…/*.ts` | Measurement sink; container confirmed via ffprobe `format_name` |
| MPEG-TS over SRT | `srt://127.0.0.1:PORT` | Local loopback (D3 transport); listener captures to `.ts` |

Social / OAuth publishing adapters (D8 / OM-034–OM-036) are **not** required for
these raw destinations. D8 remains separate for provider policy verification
and publish adapters.

## Independent layouts

Each live aspect binds its own layout document (`layout_id` + item coordinates).
Layouts may later link to a shared scene via an explicit copy action (AC-3.2);
silent forks are forbidden. The harness asserts distinct `layout_id` values and
distinct scoreboard coordinates across aspects.

## Code

- Media harness: `media/preview/run_live_outputs.py` (`LIVE_OUTPUTS_OK`); gate
  `media/gates/live_outputs.py`
- Results: `media/measurements/results/om033_live_outputs_*.json`
- App: `app/lib/director/live_outputs.dart` + Director Outputs panel /
  `MediaBridge.setOutputIntents` live payload
- Enablement: `app/lib/director/output_enablement.dart` (OM-026)

## Sources

- PROJECT_SPEC AC-3.1, AC-3.11
- ARCHITECTURE.md media gate G7
- ffmpeg MPEG-TS muxer (`ffmpeg -h muxer=mpegts`; https://ffmpeg.org/ffmpeg-formats.html#mpegts)
- ffmpeg UDP protocol (`ffmpeg -protocols`; https://ffmpeg.org/ffmpeg-protocols.html#udp)
