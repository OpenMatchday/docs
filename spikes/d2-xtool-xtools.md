# Spike D2 — xTool / xtools (OM-003)

Date: 2026-11-09
Host for install record: Windows 10.0.26300 x64 host + WSL2 Ubuntu (`Linux Leo 6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Thu Jun 5 18:30:46 UTC 2025 x86_64`)
Decision: provisional — document and optionally use **xtool-org/xtool** for Linux/WSL iOS device install/signing only; **do not** treat it as the Flutter iOS build path

## Scope

Identify the upstream named in ARCHITECTURE D2 ("xTool / xtools"), cite version/license/host OS/SDK/signing/install, record an install on one host OS, and state Flutter compatibility with evidence (never assumed).

## Candidates table

| Candidate | Upstream | Role | License (cited) | Flutter build? | Notes |
|---|---|---|---|---|---|
| **xtool** (selected for D2 hardware/device path docs) | [xtool-org/xtool](https://github.com/xtool-org/xtool) | Cross-platform Xcode replacement: SwiftPM iOS build, Apple Developer auth, Darwin Swift SDK, device install/launch | MIT ([LICENSE.md](https://raw.githubusercontent.com/xtool-org/xtool/main/LICENSE.md); GitHub `spdx_id=MIT`) | **No** for Flutter app compile — see Flutter compatibility | Official site [xtool.sh](https://xtool.sh) |
| xcross (evaluated, not selected) | [arxdeus/xcross](https://github.com/arxdeus/xcross) | Flutter/CMP iOS build/run/hot-reload from Windows/Linux without macOS | AGPL-3.0 ([LICENSE](https://raw.githubusercontent.com/arxdeus/xcross/main/LICENSE); GitHub `spdx_id=AGPL-3.0`); latest release `v2.0.9` | Claims Flutter iOS path (project README); not installed this spike | AGPL is a product-distribution concern for an MIT org; defer until license review (OM-050) |
| Maker "xTool" laser hardware / reverse-engineered APIs | various unofficial repos | Laser cutter control / cameras | N/A to Open Matchday media plane | N/A | Rejected: unrelated to phone/tablet camera production |

No official Flutter plugin for xtool was found or assumed.

## Chosen upstream record: xtool-org/xtool

| Field | Evidence |
|---|---|
| Upstream URL | https://github.com/xtool-org/xtool |
| Homepage | https://xtool.sh |
| Tagged version exercised | **1.24.0** (GitHub release published 2026-10-26T00:18:19Z) |
| License | MIT; Copyright (c) 2024 Kabir Oberai — [LICENSE.md](https://github.com/xtool-org/xtool/blob/main/LICENSE.md) |
| Host OS support (docs) | Linux native; Windows via WSL; macOS — [Installation (Linux/Windows)](https://xtool.sh/documentation/xtooldocs/installation-linux) |
| SDK requirements (docs) | Swift 6.4 toolchain for Linux; `usbmuxd` for device mux; `Xcode.xip` (docs cite Xcode 27 download from Apple Developer) to generate Darwin Swift SDK via `xtool setup` / `xtool sdk` |
| Signing / auth (docs + CLI) | `xtool setup` / `xtool auth`: App Store Connect API Key (paid Apple Developer Program) or Apple ID password mode (docs warn private APIs); then uses Apple signing pipeline for install |
| Device install path (CLI) | `xtool devices`, `xtool install` (ipa), `xtool uninstall`, `xtool launch` — confirmed present in `xtool --help` output on this host |
| API surface for our use | CLI for device install/signing of an already-built IPA; SwiftPM library products `XKit` / `XToolSupport` exist for ADS/device automation (README). Not a media capture/encode library. |

### Release asset verified this spike

| Asset | GitHub release digest | Local `sha256sum` (WSL) |
|---|---|---|
| `xtool-x86_64.AppImage` from `1.24.0` | `sha256:dbfd9d7216f077c84c171b688c4173c37c23ca76bf7fd185d1a9ae8a53dab59f` | `dbfd9d7216f077c84c171b688c4173c37c23ca76bf7fd185d1a9ae8a53dab59f` |

## Install record (one host OS)

Performed on WSL2 Ubuntu under the Windows spike host (official Windows path per xtool docs).

```text
curl -fL \
  "https://github.com/xtool-org/xtool/releases/download/1.24.0/xtool-x86_64.AppImage" \
  -o xtool
chmod +x xtool
./xtool --help   # EXIT 0; OVERVIEW: Cross-platform Xcode replacement
./xtool --version  # prints: xtool 1.24.0
```

| Check | Result | Label |
|---|---|---|
| AppImage download + checksum match | PASS | automated |
| `./xtool --help` | PASS | automated |
| `./xtool --version` | PASS (`xtool 1.24.0`) | automated |
| `usbmuxd` present | FAIL / absent on this WSL image | automated |
| `swift` present | FAIL / absent on this WSL image | automated |
| Full `xtool setup` (Apple login + Xcode.xip SDK extract) | unavailable (no Apple credentials / no Xcode.xip in spike) | unavailable |
| Physical iOS device install | unavailable (no device bound; `usbmuxd` absent; `xtool devices` hung until killed) | unavailable |

No Apple credentials, certificates, or private keys were used or stored.

## Flutter compatibility (evidence, not assumption)

D1 chose Flutter for `app`. Official Flutter iOS builds use the `ios/Runner.xcodeproj` / `xcodebuild` path ([Flutter iOS setup](https://docs.flutter.dev/get-started/install/macos#ios-setup)).

Upstream discussion [xtool-org/xtool#307](https://github.com/xtool-org/xtool/discussions/307) (reply by CaptainAni187, Oct 2026):

> Not really. xtool builds a SwiftPM package into an iOS app. It replaces Xcode's build for SwiftPM-based projects, but it doesn't build `.xcodeproj` projects. A Flutter app's iOS side is a regular Xcode project (`ios/Runner.xcodeproj`, plus CocoaPods or Swift Package Manager for plugins) that Flutter builds with `xcodebuild`, so xtool can't build it.
>
> Some of xtool's other features, such as signing and installing an already built `.ipa` onto a device, don't care how the app was made, but you'd still need a Mac (or a CI service with macOS) to produce the Flutter iOS build in the first place.

**Conclusion for Open Matchday:** xtool is **not** Flutter-compatible as a build toolchain for `app`. Optional later use is limited to install/sign of an IPA produced elsewhere (macOS CI). That optional path is **not** required for MVP media gates on Windows/Android already exercised in OM-002.

## Implication for `media`

xtool does not provide capture, encode, or transport APIs. No `media` code dependency. Keep iOS on-device media work behind the native `media` ABI; use macOS hosts or macOS CI for Flutter iOS packaging until a license-cleared Flutter-capable cross-builder is adopted (xcross remains AGPL-blocked pending OM-050 counsel).

## Status

Provisional choice recorded in workspace `ARCHITECTURE.md` decision D2.
