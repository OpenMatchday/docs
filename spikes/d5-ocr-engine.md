# Spike D5 — OCR engine (OM-006)

Date: 2026-11-09
Host: Microsoft Windows 11 Pro 10.0.26300 (x64), node Leo
Toolchain: Tesseract **v5.5.3.20260724** (`C:\Program Files\Tesseract-OCR\tesseract.exe`); leptonica-1.87.0; Python 3.11.9 + Pillow
Decision: provisional **Tesseract 5 + tessdata_fast `eng` (Apache-2.0)** as the portable on-device OCR engine in `media`, consumed by Flutter `app` through the media native bridge. Platform OCR APIs remain optional accelerators where packaging allows — not the sole path.

## Scope

Choose an on-device OCR engine for Scoreboard Reader (AC-4.*) with readings shaped for AC-5.2 (value, confidence, timestamp, staleness). Record license, model size, and fixture accuracy notes. No cloud OCR. No live venue photos (synthetic fixtures only).

## Options table

| Path | Official surface (cited) | License / notices (cited) | On-device / offline | Model / size notes | Spike result on this workspace |
|---|---|---|---|---|---|
| **Tesseract 5 + tessdata_fast** | [Tesseract User Manual](https://tesseract-ocr.github.io/tessdoc/); [tessdata_fast](https://github.com/tesseract-ocr/tessdata_fast) | Engine **Apache-2.0** ([LICENSE](https://raw.githubusercontent.com/tesseract-ocr/tesseract/main/LICENSE)); models **Apache-2.0** ([tessdata_fast LICENSE](https://github.com/tesseract-ocr/tessdata_fast/blob/main/LICENSE)) | Yes — local binary + bundled `.traineddata`; no network for recognize | `eng.traineddata` **4,113,088 bytes** (GitHub Contents API `main` + local SHA-256 `7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2`) | **PASS** — 7/7 synthetic region fixtures matched (PSM 8 digit plates; PSM 6 composite) |
| **Google ML Kit Text Recognition v2** | [Text recognition v2](https://developers.google.com/ml-kit/vision/text-recognition/v2); [Android guide](https://developers.google.com/ml-kit/vision/text-recognition/v2/android); [ML Kit home](https://developers.google.com/ml-kit) | Proprietary Google SDK; [ML Kit Terms](https://developers.google.com/ml-kit/terms) (on-device input; metrics may contact Google; no reverse engineering) | Recognition on-device; **bundled** Latin ~4 MB/script/arch ready offline after install; **unbundled** needs Play Services model download first | Android bundled ~4 MB per script per architecture; unbundled ~260 KB lib + download ([install paths](https://developers.google.com/ml-kit/tips/installation-paths)) | **unavailable** — no Android device/emulator OCR run this spike |
| **Apple Vision `VNRecognizeTextRequest`** | [Recognizing Text in Images](https://developer.apple.com/documentation/vision/recognizing_text_in_images) | Apple OS frameworks (system); processing on-device per Apple docs | Yes — OS frameworks; no model redistributed by app | OS-provided (no app-bundled model size) | **unavailable** — no macOS/iOS host |
| **Windows.Media.Ocr** | [Windows.Media.Ocr](https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr); [OCR sample](https://learn.microsoft.com/en-us/samples/microsoft/windows-universal-samples/ocr/) | OS component; language packs | On-device; docs state no Internet required for OCR | Language pack dependent | **not exercised** — API documented as requiring **package identity** for desktop apps; Flutter Windows unpackaged spike path does not assume MSIX |

## Production intent vs spike probes

| Piece | Role | Notes |
|---|---|---|
| Tesseract 5 + `tessdata_fast` eng (digits whitelist, region PSM) | Portable Scoreboard Reader OCR in `media` | Bundle `eng.traineddata` with the media/native package; expose value + confidence to `app` |
| Optional platform OCR (Vision / ML Kit bundled / Windows.Media.Ocr) | Future acceleration on packaged mobile/desktop builds | Must stay offline for recognize; ML Kit terms require user notice about metrics |
| Cloud OCR | Out of scope | Violates local-first production |

## Measurement method

Harness: sibling `media` repo `spikes/d5-ocr/`.

- `make_fixtures.py` — synthetic fictional scoreboard PNGs + JSON labels
- `inventory_ocr.py` — host Tesseract version, model bytes/hashes, citation URLs
- `fetch_tessdata_fast.py` — download official `eng.traineddata` for size/license check
- `run_ocr.py` — on-device recognize + field match + `--self-check`

Not claimed: live venue board accuracy, camera-move staleness (OM-031), product latency targets, or calibrated confidence thresholds for AC-5.4.

## Fixture accuracy notes (recorded)

Device: Windows desktop Leo. OS: Microsoft Windows NT 10.0.26300. Network: n/a (local OCR). Engine: Tesseract 5.5.3, `--oem 1`, whitelist `0123456789:`, PSM 8 (regions) / PSM 6 (composite). Model: host/package `eng.traineddata` identical SHA to tessdata_fast `main` (4,113,088 bytes).

| Fixture id | Expected | Raw | Match | mean_word_conf (TSV) | elapsed_ms |
|---|---|---|---|---|---|
| clock_mmss | 09:42 | 09:42 | true | 0.0 | ~1592 |
| shot_clock | 24 | 24 | true | 0.0 | ~1585 |
| home_score | 78 | 78 | true | 0.0 | ~1680 |
| away_score | 65 | 65 | true | 0.0 | ~1607 |
| period | 2 | 2 | true | 0.0 | ~1773 |
| fouls | 4 | 4 | true | 0.0 | ~1596 |
| board_composite | tokens 78/65/09:42/2/24 | 786509:42224 | true (token hits) | 0.0 | ~1709 |

Summary: **7/7 matched** (`results/windows-tesseract-fixtures.json`). Self-check PASS.

Confidence caveat: word-level TSV `conf` reported **0.0** on these successful digit-whitelist reads with this build/config. Earlier exploratory PSM 7 clock read reported ~44.96. Product AC-5.2/AC-5.4 must calibrate confidence (or an alternate quality signal) before using OCR to assist authority — do not invent thresholds here.

PSM note: PSM 7 returned empty text on sparse two-digit plates; PSM 8 succeeded. Region crops in production should use single-word / single-line modes after four-corner rectification (OM-030/OM-031).

### Unavailable probes

| Probe | Reason |
|---|---|
| ML Kit Text Recognition v2 | No Android OCR run this spike |
| Apple Vision | No macOS/iOS host |
| Windows.Media.Ocr recognize | Package-identity / MSIX path not set up for Flutter Windows spike |
| Live calibrated scoreboard photo | Out of scope; synthetic fixtures only |

## Model size budget (recorded)

| Artifact | Bytes | Source |
|---|---|---|
| tessdata_fast `eng.traineddata` | 4,113,088 | GitHub API + local download (`results/tessdata-fast-eng.json`) |
| Host installer `eng.traineddata` | 4,113,088 | same SHA-256 as tessdata_fast |
| Host `ita.traineddata` | 2,701,314 | inventory only (Italian locale optional later) |
| Host `osd.traineddata` | 10,562,727 | orientation/script detection; not required for digit regions |

Provisional ship budget for English digit boards: **~4.0 MiB** for `eng.traineddata` plus the Tesseract shared library footprint (OM-050 inventory).

## Provisional choice

1. **Default OCR engine:** Tesseract 5 (Apache-2.0) with **tessdata_fast `eng`** (Apache-2.0), linked/packaged from `media`, called on frozen/rectified region bitmaps.
2. **Region settings starting point:** `--oem 1`, digit/colon whitelist for clock/score/period/fouls/shot-clock crops, PSM 8 for single-field crops.
3. **App contract:** readings carry value + confidence + timestamp + staleness (AC-5.2); low-confidence never overrides confirmed authority (AC-5.4) once confidence is calibrated.
4. **Platform OCR:** optional later where verified; ML Kit only with **bundled** models if used for offline-first; Windows.Media.Ocr only if packaging provides identity; Vision on Apple hosts.
5. Capability matrix Scoreboard Reader + OCR cells stay **unverified** until OM-031/OM-046 on device classes.

## Revisit triggers

- OM-031 live region OCR + camera-move staleness
- Confidence calibration for AC-5.4
- First ML Kit / Vision / Windows.Media.Ocr smokes on those OS classes
- OM-050 license audit of redistributed Tesseract binaries and traineddata
- Non-Latin scoreboard scripts (would need additional tessdata or platform engines)
