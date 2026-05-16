# Copilot Instructions — Feierabendbaecker AI Studio

## What This App Does
A bread-baking schedule planner. The user configures flour, yeast %, temperatures, and optional stages. The app calculates fermentation timings and generates a step-by-step baking timeline. Supports **forward planning** (set start time → calculate end) and **backward planning** (set target finish time → calculate start).

---

## Architecture Overview

Data flows in one direction: Config → Math → Service → Hooks → UI

```
BakerConfig (types.ts)
    ↓
utils/bakerMath.ts         ← Pure math: fermentation time formulas (exponential model)
    ↓
services/bakerService.ts   ← Builds ordered stage list from config
services/sessionManager.ts ← Singleton: holds session state, persists to localStorage
services/historyManager.ts ← Persists completed sessions
    ↓
hooks/useBakeSchedule.ts   ← Schedule calculation + forward/backward time anchoring
hooks/useSession.ts        ← React bridge to sessionManager
hooks/useTimer.ts          ← Countdown per active stage
hooks/useHistory.ts        ← History CRUD
hooks/useDragToAdjust.ts   ← Timeline drag interaction
    ↓
components/                ← UI only; no business logic
App.tsx                    ← Orchestrator: wires hooks → components
```

---

## Module Roles (single-sentence each)

| File | Role |
|------|------|
| `types.ts` | All shared interfaces and the `StageType` enum |
| `utils/bakerMath.ts` | Deterministic fermentation math — pure functions, no side effects |
| `utils/timeUtils.ts` | Date/time formatting helpers |
| `utils/sessionUtils.ts` | Stage sequencing utilities |
| `utils/coldFermentationUtils.ts` | Cold-fermentation slider ↔ hour conversions |
| `utils/yeastSliderUtils.ts` | Yeast percentage slider ↔ display conversions |
| `services/bakerService.ts` | `getStageDefinitions()` — single source of truth for stage order |
| `services/sessionManager.ts` | Singleton session store; use `sessionManager.getSession()` / `sessionManager.update()` |
| `services/historyManager.ts` | localStorage history CRUD |
| `hooks/useBakeSchedule.ts` | Memoized schedule; returns `scheduleWithTimes`, `sessionStartTime`, `sessionEndTime` |
| `constants.tsx` | All i18n translation keys and help content (DE/EN) |
| `docs/fermentation-calculations.md` | Full mathematical specification of the fermentation model |

---

## Key Types

```typescript
// Session lifecycle
type SessionStatus = 'planning' | 'recipe' | 'active' | 'completed';

// Baking stages (strict order in getStageDefinitions)
enum StageType {
  AUTOLYSE, KNEADING, BULK_FERMENTATION, STRETCH_AND_FOLD,
  SHAPING, PROVING, BAKING, COOLING, PREFERMENT, FINISHED
}

// Core config (drives all calculations)
interface BakerConfig {
  totalFlour, hydration, salt, yeast,     // Recipe
  targetTemp, fridgeTemp,                   // Temperatures
  autolyseEnabled, autolyseDurationMinutes,
  coldBulkEnabled, coldBulkDurationHours,
  coldProofEnabled, coldProofDurationHours,
  finalProofDurationMinutes
}
```

---

## Domain Glossary (Bread Baking)

| Term | Meaning |
|------|---------|
| **Autolyse** | Optional 20–60 min rest of flour+water before kneading; improves gluten |
| **Bulk fermentation** | First long rise after kneading (warm or cold) |
| **Stretch and fold** | Interrupts bulk fermentation at 45 min intervals; strengthens dough |
| **Shaping** | Pre-shaping the loaf |
| **Proving / Proofing** | Second rise after shaping (warm or cold) |
| **Cold bulk / Cold proof** | Fermentation in the fridge; slows but doesn't stop fermentation |
| **Final proof** | Short room-temp proof after cold proof before baking |
| **Yeast %** | Baker's percentage (relative to flour weight); 0.2% is a typical value |
| **targetTemp** | Room temperature of the dough during warm fermentation |
| **fridgeTemp** | Fridge temperature; used to compute cold equivalence factor |

---

## Critical Invariants — Do Not Break

1. **`sessionManager` is a singleton** — never instantiate a second one; import the exported instance.
2. **`getStageDefinitions()` is the only place** that defines stage order — do not define stage sequences elsewhere.
3. **`utils/` functions are pure** — they receive all inputs as parameters and return values; no state access.
4. **Fermentation math baseline**: 0.2% yeast @ 24°C → 240 min bulk, 120 min proof. The exponential temperature model uses base `0.85` (bulk) and `0.80` (proof) per 2°C step.
5. **Date serialization**: `sessionManager` uses a custom JSON replacer/reviver with `{ __type: 'Date' }` — do not bypass this when persisting Date objects.
6. **All translations go in `constants.tsx`** — never hardcode user-visible strings in components.

---

## Common Tasks & Which Files to Change

### Add a new stage type
1. Add value to `StageType` enum in `types.ts`
2. Add stage to `getStageDefinitions()` in `services/bakerService.ts` (correct position in sequence)
3. Add translation key to both language objects in `constants.tsx`

### Change fermentation timing logic
1. Read `docs/fermentation-calculations.md` first — the math is documented there
2. Edit `utils/bakerMath.ts` only
3. Do NOT change stage durations in `bakerService.ts` for fermentation timing

### Modify UI for the planning tab
- `components/PlanningTab.tsx` → layout
- `components/PlanningTimeline.tsx` → timeline visual
- `components/PlanningView.tsx` → planning mode toggle

### Add a new config option
1. Add field to `BakerConfig` in `types.ts`
2. Add slider/input in `components/SettingsTab.tsx`
3. Handle it in `services/bakerService.ts` if it affects stage generation
4. Handle it in `utils/bakerMath.ts` if it affects fermentation timing

### Add a setting that persists
All persistence is handled automatically by `sessionManager` — just add the field to `BakerConfig`.

---

## Known Tricky Areas

- **Forward vs. backward planning** (`hooks/useBakeSchedule.ts`): In `forward` mode, `startTimeStr` is the anchor and end time is computed. In `backward` mode, `startTimeStr` is the *target end time* and the real session start is calculated by subtracting `totalProcessMins`. The `planningMode` prop on `useBakeSchedule` controls this.

- **Cold fermentation equivalence**: 1 minute cold ≠ 0 minutes warm. The `coldEquivalenceFactor(fridgeTemp)` function in `bakerMath.ts` computes the warm-equivalent rate. At 4°C ≈ 0.05 warm min per cold min (i.e., 20× slowdown).

- **Stretch-and-fold carve-out**: S&F stages are carved *out of* the bulk fermentation time — they don't add to it. See `getStageDefinitions()` in `bakerService.ts`.

- **memoization in `useBakeSchedule`**: Multiple `useMemo` layers with specific dependency arrays. Add to deps only when the value actually varies with them to avoid infinite loops.

---

## Tech Stack

- React 18, TypeScript, Vite
- No external state library (custom singleton + hooks)
- i18n: manual DE/EN in `constants.tsx`, via `LanguageContext`
- Persistence: `localStorage` only
- Styling: CSS Modules + inline styles; one `Slider.css`
