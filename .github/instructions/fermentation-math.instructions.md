---
applyTo: "utils/bakerMath.ts"
---

# How to Modify Fermentation Timing Logic

**Read `docs/fermentation-calculations.md` before changing anything here.**  
That file is the mathematical specification. `utils/bakerMath.ts` is its implementation.

## Key Invariants

- **Baseline**: 0.2% yeast @ 24°C → 240 min warm bulk, 120 min warm proof
- **Yeast scaling**: `yeastFactor = 0.2 / yeastPercent` (inverse linear)
- **Temperature effect (bulk)**:  `0.85 ^ ((tempC - 24) / 2)` — factor < 1 means warmer is faster
- **Temperature effect (proof)**: `0.80 ^ ((tempC - 24) / 2)` — proof reacts more strongly to temp
- **Cold equivalence**: 1 cold minute ≠ 0 warm minutes. At 4°C ≈ 0.05 warm min per cold min

## Function Map

| Function | Purpose |
|----------|---------|
| `coldEquivalenceFactor(tempC)` | Returns warm-equivalent rate for 1 cold minute at `tempC` |
| `calculateFermentationTimes(config)` | Main entry point — returns `{ bulkMins, proofMins, coldBulkMins, coldProofMins }` |
| `calculateTotalProcessTime(...)` | Sums all stage durations for the full session |

## Rules

1. **Only edit `utils/bakerMath.ts`** for fermentation timing. Do NOT add duration logic to `bakerService.ts`.
2. Functions must remain **pure** — no imports from React, no side effects, no state access.
3. `calculateFermentationTimes` must always return all four values: `bulkMins`, `proofMins`, `coldBulkMins`, `coldProofMins`.
4. Do not change the baseline constants (240, 120, 0.2, 0.85, 0.80) without updating `docs/fermentation-calculations.md`.

## Cold Fermentation — Piecewise Logic

`coldEquivalenceFactor(T)` has three zones; handle all three if adjusting temperature thresholds:

```
T ≤ 2°C   → factor = 0           (essentially no fermentation)
2 < T < 5  → linear interpolation  (transition zone)
T ≥ 5°C   → exponential Q10 model
```
