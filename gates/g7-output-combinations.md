# G7 / AC-3.1 / AC-3.11 — Output combination enablement gates

Date: 2026-11-10
Task: OM-026

## Rule

Director devices expose three live output aspects: `16:9`, `9:16`, and `1:1`, plus recording.

Release builds may enable a combination only when all of the following capability-matrix cells are `verified` or `partial` (with documented limits) for that director device class:

1. Recording support (if recording is selected)
2. Each selected live aspect support flag
3. The combination cell for `recording? + sorted aspects` (AC-3.11 / G7 sustain)

Non-release builds may enable unverified combinations for measurement. Enabling never invents matrix state.

## Support flags

| Flag | Initial state |
|---|---|
| Recording | unverified on all platforms |
| Live `16:9` | unverified |
| Live `9:16` | unverified |
| Live `1:1` | unverified |
| Multi-output (2+ aspects) / combination cells | unverified |

Update only with dated measurement notes (device, OS, network). Harness sustain success does not auto-promote flags; OM-047 reviews campaign results before release enablement.

## Code

- App: `app/lib/capability_matrix.dart`, `app/lib/director/output_enablement.dart`, Director Outputs panel
- Media harness: `media/preview/run_output_combination.py` (`OUTPUT_COMBINATION_OK`); gate `media/gates/output_combination.py`
- Results: `media/measurements/results/om026_output_combination_*.json`

## Sources

- PROJECT_SPEC AC-3.1, AC-3.11
- ARCHITECTURE.md media gate G7 and capability matrix
