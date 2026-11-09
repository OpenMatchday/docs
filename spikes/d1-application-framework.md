# Spike D1 — Application framework (OM-002)

Date: 2026-11-09
Host used for builds: Microsoft Windows NT 10.0.26300.0 (x64), Flutter 3.47.9 stable
Decision: provisional **Flutter + native media modules**

## Options table

| Option | Official platforms (cited) | Native media / FFI path (cited) | License (cited) | Fit for Open Matchday | Spike result on this host |
|---|---|---|---|---|---|
| Flutter + native media modules | Android, iOS, Windows, macOS, Linux (and web) — [Supported deployment platforms](https://docs.flutter.dev/reference/supported-platforms) | Platform channels ([docs](https://docs.flutter.dev/platform-integration/platform-channels)); C interop via `dart:ffi` / plugin FFI ([Android C interop](https://docs.flutter.dev/platform-integration/android/c-interop)) | Framework BSD 3-Clause ([FAQ](https://docs.flutter.dev/resources/faq), [LICENSE](https://github.com/flutter/flutter/blob/main/LICENSE)) | Single UI codebase across all capability-matrix OS classes; media stays in sibling `media` behind channel/FFI | Selected. Hello role shell built; Windows run + Android APK build |
| .NET MAUI + native media | Android, iOS, macOS (Mac Catalyst), Windows — [Supported platforms](https://learn.microsoft.com/en-us/dotnet/maui/supported-platforms?view=net-maui-10.0). **No Linux** in official MAUI target list | Platform invoke / native libraries via .NET interop (MAUI platform projects) | MIT ([dotnet/maui LICENSE](https://github.com/dotnet/maui/blob/main/LICENSE.txt)) | Missing Linux director/camera class from ARCHITECTURE matrix; `dotnet` SDK not installed on spike host | Rejected for MVP matrix coverage + toolchain gap |
| Native shells + shared Rust/C++ core | Full OS coverage by writing each shell | Direct FFI; highest control for capture/encode | Per-shell + Rust/C++ toolchain licenses | Highest media fidelity, highest UI duplication cost | Deferred; media core may still be Rust/C++ under Flutter |
| React Native + native media | First-party: Android and iOS ([set-up](https://reactnative.dev/docs/set-up-your-environment)); Windows/macOS are **out-of-tree** partner projects ([Out-of-Tree Platforms](https://reactnative.dev/docs/out-of-tree-platforms)) | Turbo Native Modules ([intro](https://reactnative.dev/docs/turbo-native-modules-introduction)); optional pure C++ modules | Meta open-source license for RN (see upstream repo) | Weak official desktop coverage vs capability matrix | Rejected as primary app shell for MVP |

## Hello role shell

Repository: `app` (Flutter project `open_matchday`).

- Seven roles assignable in UI: Director, Camera, Scoreboard Reader, Event Operator, Graphics Operator, Social Operator, Program Monitor.
- Native media callback channel: `open_matchday/media` method `ping` (Android Kotlin + Windows C++).
- Automated tests cover role ids and mocked channel ping.

## Platforms exercised this spike

| Platform | Evidence | Label |
|---|---|---|
| Windows (desktop) | `flutter build windows --release`; `flutter run -d windows --release --dart-define=SPIKE_AUTO_PING=true` logged `SPIKE_PING platform=windows` | automated |
| Android (emulator) | `flutter build apk --debug`; `flutter run -d emulator-5554 --dart-define=SPIKE_AUTO_PING=true` logged `SPIKE_PING platform=android` on sdk gphone16k x86 64 / Android 17 (API 37) | automated |

iOS / macOS / Linux: toolchain not exercised on this Windows host (iOS/macOS require Apple hosts per Flutter platform setup docs). Not claimed.

## FFI / media integration note

1. **Control and session signaling** from `app` to `media`: Flutter **MethodChannel / EventChannel** (binary messenger). Spike implements `ping` only.
2. **Hot path (frames, PCM, encoder buffers):** prefer a `media` native library loaded with **`dart:ffi`** or a Flutter plugin that packages the shared object / dylib / DLL, per [C interop](https://docs.flutter.dev/platform-integration/android/c-interop). Do not ship codecs inside `app`.
3. **ABI:** `media` owns SemVer native ABI (REPOS.md); `app` pins compatible range after first tagged media release.
4. **Packaging:** release CI builds against published/pinned `media` artifacts — no unpublished path deps (REPOS.md).

## Team / packaging notes

- Spike host already had Flutter, Android SDK, Visual Studio Build Tools, Rust — Flutter chosen partly for immediate multi-platform build ability.
- Rust remains available for future `media` core regardless of UI framework.

## Status

Provisional choice recorded in workspace `ARCHITECTURE.md` decision D1. Revisit only if media gates prove Flutter channel/FFI unsuitable.
