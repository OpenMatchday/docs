# Spike D3 — Media transport (OM-004)

Date: 2026-11-09
Host: Microsoft Windows NT 10.0.26300.0 (x64)
Network: Wi-Fi Up, LinkSpeed 309.5 Mbps, IPv4 10.200.78.185/16 (driver 6001.15.165.1500)
Decision: provisional **SRT** as default media-plane transport (camera / scoreboard reader to director) on Wi-Fi or Ethernet only

## Scope

Compare SRT, RTP, and WebRTC for Open Matchday media plane. Record platform support and licenses from official sources. Measure latency/loss on the available host/network. Pick a provisional default. Control-plane pairing stays outside this decision (BLE/QR/IP per AC-1.*).

## Options table

| Option | Spec / home (cited) | Reference implementation license (cited) | Platform support (cited) | Fit for Open Matchday LAN media | Spike result on this host |
|---|---|---|---|---|---|
| **SRT** (selected provisional) | IETF individual draft [draft-sharabayko-srt-01](https://datatracker.ietf.org/doc/draft-sharabayko-srt/); Alliance [srtalliance.org](https://www.srtalliance.org/); Haivision overview [doc.haivision.com SRT](https://doc.haivision.com/SRT/1.5.4/Haivision/introduction-to-srt) | Haivision [libsrt](https://github.com/Haivision/srt) **MPL-2.0** ([LICENSE](https://github.com/Haivision/srt/blob/master/LICENSE)); tagged **v1.5.7** (2026-08-28). FAQ: commercial use allowed; modified Covered Software source must stay MPL-2.0 ([SRT FAQ](https://srtalliance.org/srt-faq/)) | Cross-platform C++ library; Windows installer assets on GitHub release; this host ffmpeg 9.0.2-full_build configured with `--enable-libsrt` | ARQ, configurable latency buffer, AES, designed for live contribution over lossy IP — matches camera-to-director Wi-Fi | Selected. Packet probe + ffmpeg smoke; see measurements |
| RTP (+ RTCP) | IETF **RFC 3550** / STD 64 ([rfc-editor](https://www.rfc-editor.org/info/rfc3550/), [datatracker](https://datatracker.ietf.org/doc/rfc3550/)) | Protocol specification; implementations vary (often BSD/MIT stacks). RFC itself is IETF Standards Track | Ubiquitous UDP/IP | Payload framing, timestamps, sequence numbers; **no** built-in retransmission (app must add NACK/FEC/custom reliability) | Measured RTP-shaped UDP only (header layout PT=96). Lowest stack latency; 0 loss on this host; not chosen alone for Wi-Fi resilience |
| WebRTC | W3C Recommendation [WebRTC: Real-Time Communication in Browsers](https://www.w3.org/TR/webrtc/) (13 March 2025); IETF overview [RFC 8825](https://www.rfc-editor.org/rfc/rfc8825) / [RFC 8826](https://www.rfc-editor.org/rfc/rfc8826) | [webrtc.org license](https://webrtc.org/support/license): BSD-style + Google patent grant for the distributed implementation | Browsers and native via libwebrtc; mobile/desktop stacks exist | Strong NAT traversal and congestion control; heavier stack + signaling for multi-camera director LAN where media must stay on Wi-Fi/Ethernet (AC-1.3) | Spec/license recorded. Packet latency/loss **not measured** this spike (no second peer + signaling harness) |
| Hybrid | Control via `protocol`; media via chosen transport | n/a | n/a | Required by architecture regardless of D3 pick | Affirmed: SRT for media; control remains separate |

## Production library vs spike probe

| Piece | Role | License | Notes |
|---|---|---|---|
| Haivision libsrt **1.5.7** | Intended production SRT library | MPL-2.0 | Release asset `libsrt-1.5.7-win-installer.zip` digest `sha256:298cafe9e27c9be031bcfd19a2536269676fa36603ea1c216b9488ed45bf5dad` matched local download. Windows installer required elevation on this host (not installed). ffmpeg on PATH already linked with libsrt (`--enable-libsrt`). |
| ffmpeg 9.0.2-full_build (gyan.dev) | Haivision-backed SRT session smoke | GPL build of ffmpeg (host tool; not shipped as product dependency by this spike) | Listener/caller MPEG-TS over `srt://` returned exit 0 |
| srt-tokio **0.4.4** ([russelltg/srt-rs](https://github.com/russelltg/srt-rs)) | Spike-only packet latency/loss probe | Apache-2.0 | Upstream README states not production ready. Used only because libsrt installer needed elevation. |

## Measurement method

Harness lives in sibling `media` repo: `spikes/d3-transport/`.

- **UDP/RTP-shaped:** Python `measure_udp_rtp.py` — RFC 3550-like 12-byte header + `send_time_ns` payload; shared-clock one-way latency; sequence loss.
- **SRT packet probe:** Rust `srt_probe` (srt-tokio) — same timestamp/seq payload; configurable `--latency-ms`.
- **SRT ffmpeg smoke:** `measure_ffmpeg_srt_smoke.py` — confirms Haivision-linked ffmpeg SRT session.
- **Not claimed:** glass-to-glass camera-to-display; multi-device path through a consumer router; cellular (forbidden for media by AC-1.3).

Same-host binds to `127.0.0.1` and to the Wi-Fi NIC address `10.200.78.185` (hairpin on one machine; not a second physical camera).

### Rig limits (honest)

| Baseline rig item (ARCHITECTURE.md) | This spike |
|---|---|
| 2 cameras | unavailable (no second capture device in session) |
| Scoreboard reader | unavailable |
| Director + operators | unavailable as product roles; host acts as both ends of transport |
| Consumer router | Wi-Fi association present (309.5 Mbps); no second-STA cross-traffic test |

G2 glass-to-glass remains for later media gates (OM-013 / OM-047). This spike supplies transport evidence only.

## Measurements (recorded)

Device: Windows desktop host Leo. OS: Microsoft Windows NT 10.0.26300.0. Payload 1200 bytes. Rate 200 pkt/s. Count 1000 unless noted. Network as above.

| Label | Path | Config | Sent/Recv | Loss ratio | one-way p50 ms | one-way p95 ms | one-way max ms | Source file |
|---|---|---|---|---|---|---|---|---|
| udp-rtp-loopback | 127.0.0.1 | n/a | 1000/1000 | 0.0 | 0.0 | 0.507 | 1.329 | `media/spikes/d3-transport/results/udp-rtp-loopback.json` |
| udp-rtp-wifi-nic | 10.200.78.185 hairpin | n/a | 1000/1000 | 0.0 | 0.0 | 0.579 | 3.050 | `.../udp-rtp-wifi-nic.json` |
| srt-loopback | 127.0.0.1 | latency 120 ms | 1000/1000 | 0.0 | 125.529 | 128.104 | 130.103 | `.../srt-loopback.json` |
| srt-wifi-nic | 10.200.78.185 hairpin | latency 120 ms | 1000/1000 | 0.0 | 126.014 | 128.670 | 131.716 | `.../srt-wifi-nic.json` |
| srt-loopback-latency20 | 127.0.0.1 | latency 20 ms | 1000/1000 | 0.0 | 31.361 | 32.170 | 36.452 | `.../srt-loopback-latency20.json` |
| ffmpeg-srt-smoke | 127.0.0.1 | ffmpeg `latency=120000` us | n/a | n/a | n/a | n/a | caller elapsed 1.388 s; both exit 0 | `.../ffmpeg-srt-smoke.json` |

Interpretation: raw RTP-shaped UDP is sub-millisecond on this host. SRT one-way time tracks the configured latency buffer (120 ms config -> ~126 ms p50; 20 ms config -> ~31 ms p50). Loss was 0 in all packet probes here. Product default latency must be chosen later against G2 measurements with real encode/decode — do not publish a target number from this spike alone.

### WebRTC measurement

unavailable — no second peer and no signaling harness in this spike.

## Provisional choice

**Default media transport: SRT** over Wi-Fi or Ethernet.

Reasons (evidence-linked):

1. Live contribution features (ARQ, configurable latency, optional AES) match camera-to-director on consumer Wi-Fi better than bare RTP.
2. libsrt MPL-2.0 is an official, cited open license usable in larger works with Covered Software obligations documented for OM-050.
3. Host toolchain already speaks SRT via ffmpeg `--enable-libsrt`; packet probe showed 0 loss with buffer-dominated latency.
4. WebRTC remains a candidate for future NAT-heavy or browser paths but was not measured; multi-camera director LAN does not need browser ICE as the MVP default.
5. Hybrid stands: `protocol` for control; SRT for media. UI must refuse media over cellular/BLE (AC-1.3) regardless of SRT.

Revisit if G2 glass-to-glass on the baseline rig fails SRT, or if a measured WebRTC path proves clearly better for the same director class.

## Status

Provisional choice recorded in workspace `ARCHITECTURE.md` decision D3.
