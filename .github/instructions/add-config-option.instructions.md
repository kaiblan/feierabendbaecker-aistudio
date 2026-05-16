---
applyTo: "types.ts,components/SettingsTab.tsx,services/bakerService.ts,utils/bakerMath.ts"
---

# How to Add a New Config Option

`BakerConfig` in `types.ts` is the single source of truth for all user-configurable parameters.  
Persistence is free — `sessionManager` automatically serializes the entire config to `localStorage`.

## Step 1 — `types.ts`: Add field to `BakerConfig`

```typescript
export interface BakerConfig {
  // ...existing fields...
  myNewOption: boolean;          // or number, string
  myNewOptionValue?: number;     // optional sub-value, e.g. for toggle + slider pairs
}
```

## Step 2 — `services/sessionManager.ts`: Add default value

Find `DEFAULT_CONFIG` (or the config initialization object) and add:
```typescript
myNewOption: false,
myNewOptionValue: 60,
```

## Step 3 — `components/SettingsTab.tsx`: Add UI control

Use existing components as templates:
- Boolean toggle → `<ToggleSwitch>`
- Number slider → `<RangeField>` or `<Slider>`

```tsx
<ToggleSwitch
  checked={config.myNewOption}
  onChange={(v) => onConfigChange('myNewOption', v)}
  label={t('myNewOptionLabel')}
/>
```

## Step 4 (if affects stage generation) — `services/bakerService.ts`

Add a conditional `stages.push(...)` inside `getStageDefinitions()`, guarded by `config.myNewOption`.

## Step 5 (if affects fermentation timing) — `utils/bakerMath.ts`

Add the calculation to `calculateFermentationTimes(config)`. Keep the function pure.

## Step 6 — `constants.tsx`: Add translation key

```typescript
de: { myNewOptionLabel: 'Meine neue Option' },
en: { myNewOptionLabel: 'My new option' },
```

## Checklist
- [ ] Field added to `BakerConfig` in `types.ts`
- [ ] Default value added to `DEFAULT_CONFIG` in `sessionManager.ts`
- [ ] UI control added in `SettingsTab.tsx`
- [ ] Translation key in both `de` and `en` blocks in `constants.tsx`
- [ ] Stage generation updated in `bakerService.ts` (if needed)
- [ ] Fermentation math updated in `bakerMath.ts` (if needed)
