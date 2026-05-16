---
mode: ask
description: Add a new UI component following existing patterns
---

I need to add a new UI component to the Feierabendbaecker app.

**Component details:**
- Name: [ComponentName]
- Location: `components/[ComponentName].tsx`
- Tab it belongs to: Planning / Active / Settings / History / Amounts
- Purpose: [DESCRIBE WHAT IT SHOWS OR DOES]

**Existing component to use as template:** [e.g., `components/HistoryCard.tsx` or `components/RangeField.tsx`]

**Rules:**
- No business logic in components — if you need a calculation, it belongs in `utils/` or `hooks/`
- User-visible strings must use `t('key')` from `useLanguage()`, with key added to `constants.tsx`
- Props interface should be defined inline at the top of the file
- Use existing shared components: `<Card>`, `<Button>`, `<Modal>`, `<Headline>`, `<ToggleSwitch>`, `<Slider>`

**Files to change:**
1. Create `components/[ComponentName].tsx`
2. Import and use in the appropriate tab component
3. Add any new translation keys to `constants.tsx` (both `de` and `en`)
