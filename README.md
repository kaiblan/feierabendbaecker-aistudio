<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1No0sE64mTAQXQZDt9_RWZn47LgBbHgt8

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run the app: `npm run dev`

---

## How It Works

A bread-baking schedule planner. The user configures flour, yeast %, temperatures, and optional stages. The app calculates fermentation timings and generates a step-by-step baking timeline.

**Two planning modes:**
- **Forward** — set your start time, the app computes when the bread will be done
- **Backward** — set a target finish time, the app computes the required start time

**Data flow (one direction):**
```
BakerConfig (user inputs)
    ↓
utils/bakerMath.ts        Pure fermentation math (exponential temperature model)
    ↓
services/bakerService.ts  Builds ordered stage list from config
services/sessionManager.ts  Singleton state store → localStorage
    ↓
hooks/useBakeSchedule.ts  Memoized schedule with start/end times per stage
    ↓
components/               UI only — no business logic
```

**Key module roles:**

| Module | Role |
|--------|------|
| `types.ts` | All shared TypeScript interfaces and the `StageType` enum |
| `utils/bakerMath.ts` | Fermentation time calculations — pure functions, no side effects |
| `services/bakerService.ts` | `getStageDefinitions()` — single source of truth for stage order |
| `services/sessionManager.ts` | Singleton; manages session state and localStorage persistence |
| `hooks/useBakeSchedule.ts` | Memoized schedule calculation; forward/backward time anchoring |
| `constants.tsx` | All DE/EN translation keys and help content |
| `docs/fermentation-calculations.md` | Full mathematical specification of the fermentation model |

---

## Domain Glossary

| Term | Meaning |
|------|---------|
| **Autolyse** | Optional rest of flour+water before kneading; improves gluten |
| **Bulk fermentation** | First long rise after kneading (warm or cold) |
| **Stretch and fold** | Interrupts bulk fermentation; carved out of bulk time, does not add to it |
| **Proving / Proofing** | Second rise after shaping |
| **Cold bulk / Cold proof** | Fermentation in the fridge; slows but does not stop fermentation |
| **Final proof** | Short room-temp proof after cold proof, before baking |
| **Yeast %** | Baker's percentage relative to flour weight; 0.2% is a typical value |
| **targetTemp** | Dough/room temperature during warm fermentation |
| **fridgeTemp** | Fridge temperature; used to compute cold fermentation equivalence |
