---
applyTo: "services/bakerService.ts,types.ts,constants.tsx"
---

# How to Add a New Baking Stage

Follow these steps **in order**. All three files must be changed; forgetting any one will cause a runtime error or missing translation.

## Step 1 — `types.ts`: Add to the enum

```typescript
export enum StageType {
  // ... existing values ...
  YOUR_NEW_STAGE = 'YOUR_NEW_STAGE',  // ← add here
}
```

## Step 2 — `services/bakerService.ts`: Insert into `getStageDefinitions()`

`getStageDefinitions()` is the **only** place that defines stage order.  
Insert your `stages.push(...)` block at the correct position in the sequence:

```
AUTOLYSE? → KNEADING → BULK_FERMENTATION (with S&F carved out) → SHAPING → PROVING → BAKING → COOLING
```

Template:
```typescript
stages.push({
  type: 'your_new_stage',          // lowercase string id
  stageType: StageType.YOUR_NEW_STAGE,
  label: translateFn('yourNewStageKey'),
  durationMinutes: <fixed_minutes_or_calculated>,
  isActive: true,   // true = user does work; false = passive waiting
  isCold: false,    // true only for fridge stages
});
```

If the stage duration depends on fermentation math, compute it in `utils/bakerMath.ts` (pure function) and call it here, similar to how `bulkMins` / `proofMins` are used.

## Step 3 — `constants.tsx`: Add translation key to both languages

Find the `translations` object. Add your key to **both** `de` and `en` blocks:

```typescript
const translations = {
  de: {
    // ...
    yourNewStageKey: 'Dein neues Stadium',
  },
  en: {
    // ...
    yourNewStageKey: 'Your new stage',
  },
};
```

## Checklist
- [ ] `StageType` enum updated in `types.ts`
- [ ] `stages.push(...)` added at correct position in `getStageDefinitions()`
- [ ] Translation key added to **both** `de` and `en` in `constants.tsx`
- [ ] `isActive` and `isCold` flags set correctly
