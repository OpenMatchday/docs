# Operator guide

English default. Structured Italian localization strings live in app locale files; this guide stays English.

Open Matchday is local-first sports broadcast production. Phones and tablets are cameras. Operators run clocks, scores, lineups, graphics, and themes. A director chooses Preview and Program and sends independently laid-out outputs to recording and live streams. Local production never needs the Internet or an account.

## Roles

| Role | Job |
|---|---|
| Director | Approves devices; Preview/Program; Cut/Take; outputs; audio; health |
| Camera | Capture and send media; receive tally |
| Scoreboard Reader | Calibrated board capture; OCR readings |
| Event Operator | Clocks, scores, period/fouls, authority confirms |
| Graphics Operator | Scenes, templates, themes, layout drafts |
| Social Operator | Templates, drafts, export, approved publishing |
| Program Monitor | View Program (and optionally Preview) without control |

Single-role assignment is always available. Multi-role combinations on one device are gated by the capability matrix and stay blocked until measured.

## Matchday sequence

1. Install or build the local app packages for the platforms you run.
2. Create or open an event. Optionally pin offline registry snapshots for teams and seasons.
3. Pair devices: BLE where the matrix allows, otherwise QR or manual IP for control. Director approves each device and assigns roles.
4. Media uses Wi-Fi or Ethernet only. The app refuses cellular and BLE for media.
5. When OCR is used, freeze a Scoreboard Reader frame, place four corners (TL, TR, BR, BL), confirm the rectified board, then define regions.
6. Event Operator owns clocks and scores. Manual timer is the default clock authority. OCR readings never override a confirmed field when confidence is low.
7. Graphics Operator prepares scenes and themes. Layout drafts stay draft until applied to an output.
8. Director selects Preview and Program, cuts to air with explicit Cut/Take, and enables recording or live outputs only when enablement gates allow.
9. After the match: stop outputs, export recordings and social drafts. Optional online contribution opens a pull request later; it is not required for production.

## Authority and event log

- Each field has authority: manual or OCR-assisted.
- Operators confirm, correct, or lock fields.
- The event log is append-only. Undo is a compensating entry.
- Late joiners receive a snapshot that includes current fields and log sequence.
- Crash recovery restores clocks, scores, and lineup authority. Recording and streaming never auto-restart after recovery.

## Scoreboard reader

- Four-corner calibration validates order, convexity, minimum area, and non-degenerate quads.
- Regions follow sport allowlists; absent fields stay omitted.
- Camera-move detection marks readings and live crops stale until recalibration.

## Outputs

- Recording writes a Program file with video and audio when the recording path is enabled.
- Live outputs use independent layouts per destination.
- Aspect support (`16:9`, `9:16`, `1:1`) and multi-output combinations are gated. Release builds enable only measured cells.
- Never publish unmeasured latency or bitrate numbers as product claims.

## Social

- Local drafts and export always work offline.
- Publishing uses official provider adapters after explicit per-post approval.
- Engagement metrics are never stored or shown.
- Connected accounts keep social tokens in a separate credential plane.

## Privacy for operators

- Local production does not require accounts.
- Public registry packages ship fictional fixtures for schema and UI tests.
- Minors default to no photo. Consent evidence never belongs in Git.
- Takedown requests cover public registry content; Git history erasure is not promised.

## Honest capability language

Say **verified**, **partial**, **unverified**, or **out of scope**. Do not invent pass rates, glass-to-glass latency, or store availability. The website capabilities page mirrors the architecture matrix without fabricating numbers.
