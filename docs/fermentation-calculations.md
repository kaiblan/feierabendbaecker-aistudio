# Fermentation Timing Model

This document explains how the baking session derives warm-proof, warm-bulk, and cold-stage durations from the current configuration (`BakerConfig`). It mirrors the calculations in `utils/bakerMath.ts` so you can trace how yeast, temperature, cold storage, and the user-adjusted final-proof slider interact.

## Warm fermentation targets

The model starts with baseline warm fermentation durations that assume 0.5% yeast at 24 °C:

- Bulk target: 300 minutes
- Proof target: 180 minutes

Yeast scales total time inversely: if the baker sets `yeast = y`, every warm target multiplies by the **yeast factor**

$$
	ext{yeastFactor} = \frac{0.5}{y}
$$

Temperature adjustments use different exponential bases for bulk and proof (the `(T - 24)/2` exponent encodes a 2 °C step for each halving/doubling of the effect):

- Bulk temperature effect: $0.85^{(T-24)/2}$
- Proof temperature effect: $0.80^{(T-24)/2}$

The resulting warm targets are

$$
\begin{aligned}
	ext{bulkWarmTarget} &= 300 \times \text{yeastFactor} \times 0.85^{(T-24)/2} \\
	ext{proofWarmTarget} &= 180 \times \text{yeastFactor} \times 0.80^{(T-24)/2}
\end{aligned}
$$

## Cold fermentation adjustments

Cold stages slow fermentation rather than halt it. The configuration fields for cold bulk/proof are entered in hours, so we first convert them to minutes before using them in the equations (hours × 60). The following function then maps fridge temperature to a “warm equivalent” multiplier $A(T)$:

- $A(T)=0$ for $T \leq 2$°C
- $A(T)=0.05 \times \frac{T-2}{3}$ for $2 < T < 5$°C (linear interpolation)
- $A(T)=k \times 2^{(T-20)/10}$ for $T \geq 5$°C, where continuity at 5 °C forces $A(5)=0.05$ and therefore $k \approx 0.1414$ (since $0.05 = k \times 2^{-1.5}$).

After converting cold durations to minutes, the model subtracts their warm equivalents from the warm targets and clamps each result to zero before summing:

$$
\begin{aligned}
	ext{bulkWarmRemaining} &= \max\big(0,\text{bulkWarmTarget} - \text{coldBulkMins} \times A(T)\big) \\
	ext{proofWarmRemaining} &= \max\big(0,\text{proofWarmTarget} - \text{coldProofMins} \times A(T)\big) \\
	ext{totalWarmMins} &= \text{bulkWarmRemaining} + \text{proofWarmRemaining}
\end{aligned}
$$

This means each cold minute contributes a scaled amount of warm fermentation time, and the clamping guarantees the remaining warm minutes never go negative.

## Final proof slider override

The UI exposes a `RangeField` (0–180 minutes, 5-minute steps) that writes to `finalProofDurationMinutes`. The code rounds the stored value (which matches the slider’s own granularity) and clamps it to the inclusive range before computing how much of the warm budget is dedicated to proof. That process is:

1. Clamp the requested value to the slider’s range, so the code never tries to schedule a negative value or more than 180 min of room-temperature proof:
	$$
		ext{proofSetting} = \text{clamp}(0\text{ min}, \text{finalProofDurationMinutes}, 180\text{ min})
	$$
2. The actual warm proof time is the minimum of that clamp and the remaining warm minutes:
	$$
		ext{proofMins} = \min(\text{totalWarmMins}, \text{proofSetting})
	$$
3. Bulk absorbs whatever time remains in the warm budget:
	$$
		ext{bulkMins} = \max(0, \text{totalWarmMins} - \text{proofMins})
	$$

Because the slider already steps in five-minute increments, the rounding operation merely echoes that precision. `proofMins` always represents the warm proof segment produced by this slider and never includes cold proof minutes.

Note: The `bulkMins` includes time for stretch-and-fold (45 minutes), which is subtracted from the warm bulk budget when building the schedule stages. If `bulkMins < 45`, folds are truncated accordingly.

## Summary of outputs

The hook returns these durations for the scheduler so downstream code can build stages and calculate the overall timeline:

- `bulkMins`: total warm room-temperature bulk minutes (after proof takes its share), which includes time for stretch-and-fold (up to 45 minutes)
- `proofMins`: warm final proof minutes (clamped to 0–180 min and separate from any cold proof)
- `coldBulkMins`: cold bulk minutes (user-configured hours × 60)
- `coldProofMins`: cold proof minutes (user-configured hours × 60)

Because yeast, temperature, cold time, and the final-proof slider feed into these numbers, adjusting any of them instantly updates the stage durations produced by `generateBakingStages` and the total process time calculation.
