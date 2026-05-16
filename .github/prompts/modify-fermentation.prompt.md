---
mode: ask
description: Adjust fermentation timing or temperature model
---

I need to modify the fermentation timing logic.

**Context (read first):**
- Mathematical spec: `docs/fermentation-calculations.md`
- Implementation: `utils/bakerMath.ts`

**What I want to change:**
[DESCRIBE THE CHANGE — e.g., "adjust the cold equivalence factor for temperatures between 2°C and 5°C", or "change the proof baseline from 120 min to 150 min"]

**Constraints:**
- Only edit `utils/bakerMath.ts` (pure functions, no side effects)
- Keep the baseline: 0.2% yeast @ 24°C → 240 min bulk, 120 min proof
- Preserve all four return values: `{ bulkMins, proofMins, coldBulkMins, coldProofMins }`
- Update `docs/fermentation-calculations.md` if the mathematical model changes
