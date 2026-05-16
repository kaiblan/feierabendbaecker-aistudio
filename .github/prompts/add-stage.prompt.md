---
mode: ask
description: Add a new baking stage to the workflow
---

I need to add a new baking stage to the Feierabendbaecker app.

**New stage details:**
- Name: [STAGE_NAME]
- Duration: [X] minutes
- Stage type: active (user does work) / passive (waiting)
- Cold stage (fridge): yes / no
- Position in sequence: after [PREVIOUS_STAGE]
- Translation (DE): [German label]
- Translation (EN): [English label]

Please follow the steps in `.github/instructions/add-stage.instructions.md` and update these files in order:
1. `types.ts` — add to `StageType` enum
2. `services/bakerService.ts` — add to `getStageDefinitions()`
3. `constants.tsx` — add translation key to both `de` and `en`
