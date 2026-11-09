# Spike D4 — Codecs and hardware encoders (OM-005)

Date: 2026-11-09
Host: Microsoft Windows 11 Pro 10.0.26300 (x64), node Leo
CPU: AMD Ryzen 5 7535U with Radeon Graphics (6 cores)
GPU: AMD Radeon(TM) Graphics, driver 32.0.21039.2003 (PCI VEN_1002 DEV_1681)
Toolchain: ffmpeg 9.0.2-full_build (Windows); WSL2 Ubuntu ffmpeg 8.0.1-3ubuntu2
Decision: provisional **platform-native hardware encode first**, with **OpenH264 (BSD)** as the audited portable software fallback. Select Windows vendor path by GPU (AMF / NVENC / Quick Sync / Media Foundation).

## Scope

Probe MediaCodec, VideoToolbox, NVENC, Quick Sync, VA-API, and software fallback options as applicable on available hosts. Cite vendor docs and licenses. Draft encode capability matrix cells for ARCHITECTURE.md. Support media gate G1 and AC-3.11 readiness evidence — not glass-to-glass product targets.

## Options table

| Path | Official surface (cited) | License / notices (cited) | Target OS class | Spike result on this workspace |
|---|---|---|---|---|
| **Android MediaCodec** | [MediaCodec](https://developer.android.com/reference/android/media/MediaCodec); [MediaCodecList.findEncoderForFormat](https://developer.android.com/reference/android/media/MediaCodecList); [MediaFormat](https://developer.android.com/reference/android/media/MediaFormat) (`KEY_MIME`, `KEY_BIT_RATE`) | Platform API (AOSP / device OEM codec binaries; ship notices via OM-050 per device class) | Android | **unavailable** — no `adb` device or running emulator this spike (`adb devices` empty; Flutter saw Windows/Chrome/Edge only) |
| **Apple VideoToolbox** | [VideoToolbox](https://developer.apple.com/documentation/videotoolbox); `kVTVideoEncoderSpecification_EnableHardwareAcceleratedVideoEncoder` / `RequireHardwareAcceleratedVideoEncoder` in `VTCompressionSessionCreate` encoderSpecification ([Apple docs](https://developer.apple.com/documentation/videotoolbox/kvtvideoencoderspecification_enablehardwareacceleratedvideoencoder)) | Apple OS frameworks (system); app must not redistribute OS binaries | iOS / macOS | **unavailable** — no macOS/iOS host this spike |
| **NVIDIA NVENC** | [NVENC Video Encoder API Programming Guide](https://docs.nvidia.com/video-technologies/video-codec-sdk/13.0/nvenc-video-encoder-api-prog-guide/index.html) (Video Codec SDK 13.0); requires NVIDIA GPU + driver (`nvEncodeAPI.dll` / `libnvidia-encode.so`) | NVIDIA Video Codec SDK terms (proprietary SDK; hardware via NVIDIA driver). Not exercised as a redistributed library this spike | Windows / Linux with NVIDIA GPU | **FAIL** on this host — no NVIDIA adapter; `h264_nvenc` could not open encoder |
| **Intel Quick Sync / Intel VPL** | [Intel Video Processing Library overview](https://www.intel.com/content/www/us/en/developer/tools/vpl/overview.html); [Encoding Procedures](https://intel.github.io/libvpl/latest/programming_guide/VPL_prg_encoding.html); successor to Media SDK | Intel VPL / runtime redistribution per Intel packaging; GPU-bound | Windows / Linux with Intel GPU | **FAIL** on this host — AMD CPU/iGPU only; `h264_qsv` could not open encoder |
| **AMD AMF** | [GPUOpen AMF](https://github.com/GPUOpen-LibrariesAndSDKs/AMF/); [AMF H.264 encode API](https://github.com/GPUOpen-LibrariesAndSDKs/AMF/blob/master/amf/doc/AMF_Video_Encode_API.md); [FFmpeg + AMF wiki](https://github.com/GPUOpen-LibrariesAndSDKs/AMF/wiki/FFmpeg-and-AMF-HW-Acceleration) | AMF SDK **MIT** ([LICENSE.txt](https://raw.githubusercontent.com/GPUOpen-LibrariesAndSDKs/AMF/master/LICENSE.txt)) with explicit notice that AMD does **not** license codec patents (H.264/HEVC/etc.) | Windows (and Linux AMF stacks where shipped) with AMD GPU | **PASS** — `h264_amf` and `hevc_amf` wrote non-empty MP4 from 90-frame 1280x720 test pattern |
| **Windows Media Foundation** | [H.264 Video Encoder MFT](https://learn.microsoft.com/en-us/windows/win32/medfound/h-264-video-encoder) (`IMFTransform`, `MFVideoFormat_H264`) | OS component; redistribute OS MFTs not applicable — call system APIs | Windows | **PASS** — `h264_mf` wrote non-empty MP4 on this host |
| **VA-API (Linux)** | [libva / VA-API](http://intel.github.io/libva/); encoder entrypoints documented for H.264/HEVC/etc. | libva **MIT-style** ([COPYING](https://github.com/intel/libva/blob/master/COPYING)) | Linux with `/dev/dri` + vendor driver | **unavailable / FAIL** in WSL2 — `vainfo` absent, `/dev/dri` absent; `h264_vaapi` exit nonzero. Native Linux GPU host not present |
| **Software: OpenH264** | [cisco/openh264](https://github.com/cisco/openh264); [FAQ](https://www.openh264.org/faq.html) | Source **BSD 2-Clause** ([LICENSE](https://raw.githubusercontent.com/cisco/openh264/master/LICENSE)); Cisco binary module has separate MPEG LA coverage conditions ([BINARY_LICENSE](https://www.openh264.org/BINARY_LICENSE.txt)) | All (portable) | Selected provisional **product software fallback**. Not linked into a product binary this spike; license recorded for OM-050 |
| **Software: libx264** | [x264](https://code.videolan.org/videolan/x264); COPYING = **GPL-2.0** | GPL-2.0 — viral if linked into shipped app; acceptable as **host/dev toolchain** probe only unless product accepts GPL | All (CPU) | **PASS** as host probe (`libx264` MP4). **Not** chosen as default shippable fallback because of GPL |

## Production intent vs spike probes

| Piece | Role | Notes |
|---|---|---|
| Platform HW APIs (MediaCodec / VideoToolbox / MF / AMF / NVENC / QSV / VA-API) | Primary encode on each OS class when hardware present | Selected at runtime from capability matrix after measurement |
| OpenH264 BSD (+ optional Cisco binary terms if used) | Portable software fallback when HW missing or busy | Patent/royalty path must be re-checked in OM-050 before release |
| libx264 / host ffmpeg | Spike measurement tool only | This host ffmpeg is a GPL-enabled gyan.dev build — **not** a product dependency |
| Capture path | Out of scope for numeric G1 camera capture this spike | No camera device attached; synthetic `testsrc` YUV only |

## Measurement method

Harness: sibling `media` repo `spikes/d4-codecs/`.

- `inventory_host.py` — CPU/GPU/OS inventory JSON
- `probe_encoders.py` — ffmpeg encode smokes from raw YUV (1280x720, 30 fps, 90 frames)
- `wsl_vaapi_note.sh` — WSL2 VA-API presence + encode attempt

Not claimed: glass-to-glass latency, bitrate quality scores, multi-output sustain (AC-3.11), or camera capture stability (full G1 with live camera remains OM-013 / OM-047).

## Measurements (recorded)

Device: Windows desktop Leo. OS: Microsoft Windows NT 10.0.26300 (Windows 11 Pro). Network: n/a (local encode files). Source: ffmpeg `testsrc` -> yuv420p 1280x720 @30 fps, 90 frames. ffmpeg 9.0.2-full_build.

| Encoder | ok | exit | output bytes | elapsed ms | Source |
|---|---|---|---|---|---|
| h264_amf | true | 0 | 110801 | 586.290 | `media/spikes/d4-codecs/results/windows-encode-smokes.json` |
| hevc_amf | true | 0 | 194808 | 524.228 | same |
| h264_mf | true | 0 | 293571 | 382.323 | same |
| libx264 | true | 0 | 249919 | 351.215 | same |
| h264_nvenc | false | nonzero | 0 | 71.200 | same (no NVIDIA GPU) |
| h264_qsv | false | nonzero | 0 | 195.345 | same (no Intel GPU) |
| h264_vaapi | false | nonzero | 0 | 77.411 | same (not a Linux VA path on Windows) |

WSL2 (kernel 6.6.87.2-microsoft-standard-WSL2): `vainfo=absent`, `dri=absent`; `libx264` ok bytes=31942; `h264_vaapi` fail (`results/wsl-vaapi-note.json`).

### Unavailable probes

| Probe | Reason |
|---|---|
| Android MediaCodec encode | No adb device / emulator running |
| VideoToolbox encode | No macOS/iOS machine |
| NVENC success path | No NVIDIA GPU on this host |
| Quick Sync success path | No Intel GPU on this host |
| Native Linux VA-API success | WSL2 lacks `/dev/dri`; no separate Linux GPU host |
| Live camera capture + HW encode (full G1) | No camera attached; synthetic frames only |

## Capability matrix draft (encode-related)

States remain honest: only Windows hardware encode moves to **partial** on evidence from this AMD host. Other OS classes stay **unverified** until probed.

| Role / capability | Android | iOS | Windows | Linux | macOS |
|---|---|---|---|---|---|
| Hardware encode | unverified | unverified | **partial** (AMF H.264/HEVC + Media Foundation H.264 smoke PASS 2026-11-09; NVENC/QSV absent on this GPU) | unverified (WSL VA-API unavailable) | unverified |

Full role matrix otherwise unchanged (still unverified). Update ARCHITECTURE.md Hardware encode Windows cell with the same note.

## Provisional choice

1. **Prefer hardware encode** via the OS/vendor API for the device class: MediaCodec (Android), VideoToolbox (Apple), Media Foundation and/or vendor SDK (Windows AMF/NVENC/QSV), VA-API (Linux).
2. On Windows, **detect GPU** and enable AMF (AMD), NVENC (NVIDIA), or Quick Sync / Intel VPL (Intel); keep Media Foundation H.264 as a broad Windows path when vendor HW is unavailable but MF works.
3. **Software fallback:** OpenH264 (BSD 2-Clause), with OM-050 re-checking Cisco binary MPEG LA conditions if the Cisco-distributed binary is used. Do not ship libx264 as the default in-app fallback (GPL-2.0).
4. Capability matrix gates remain: release builds must not claim verified hardware encode on an OS class without a dated measurement record.

## Revisit triggers

- Media gate G1 with live camera capture on baseline rig (OM-013 / OM-047)
- First successful MediaCodec / VideoToolbox / VA-API / NVENC / QSV smokes on those device classes
- OM-050 license audit of any redistributed codec binaries or SDK redistributables
