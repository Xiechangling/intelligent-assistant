---
phase: 05-review-skills-workflow-polish
plan: 02
title: Presets and workflow capability polish
status: completed-with-verification-note
files_modified:
  - E:\work\ai\agent\src\app\state\types.ts
  - E:\work\ai\agent\src\app\state\appShellStore.ts
  - E:\work\ai\agent\src\app\layout\RightPanel.tsx
  - E:\work\ai\agent\src\styles\app-shell.css
  - E:\work\ai\agent\tests\e2e\presets.spec.ts
  - E:\work\ai\agent\tests\e2e\capabilities.spec.ts
verification:
  - npm run build
  - npx playwright test tests/e2e/presets.spec.ts
  - npx playwright test tests/e2e/capabilities.spec.ts
---

# Phase 5 Plan 02 Summary

Refined the right-panel settings surface so presets and workflow capabilities feel compact, product-facing, and aligned with a Claude Code-style desktop workbench.

## Completed Work

### Task 1 — Presets
- Added `tests/e2e/presets.spec.ts` for preset save/apply coverage.
- Kept presets compact and shell-scoped: mode, model, and review-open preference only.
- Preset application remains future-facing by updating shell defaults without mutating current session transcript or active session model history.
- Polished the presets UI in `RightPanel.tsx` with clearer labels, active state, and explicit future-default messaging.

### Task 2 — Workflow capabilities
- Added `tests/e2e/capabilities.spec.ts` for capability placement and toggle behavior coverage.
- Expanded `SkillToggle` with a product-facing `description` field.
- Replaced implementation-flavored labels with concise product-facing capability names:
  - Command approval
  - Change review
  - Workspace context
- Refined right-panel settings presentation so connection settings, presets, and capability toggles read as one cohesive support surface.
- Added lightweight supporting styles for compact item hierarchy and active-state metadata.

## Key Decisions
- Presets remain lightweight shell snapshots rather than a configuration system.
- Applying a preset changes `mode`, `globalDefaultModel`, and review tray default only.
- Existing session identity, transcript history, and active session model override are left unchanged.
- Capability labels stay user-facing and avoid internal jargon.
- Presets and capability toggles stay in the right panel, not the center workspace.

## Deviations from Plan
- None in behavior scope.
- Validation environment required Playwright browser installation before browser tests could run.

## Verification Results
- `npm run build` — Passed.
- `npx playwright test tests/e2e/presets.spec.ts` — Blocked in environment because Playwright Chromium executable was not yet available locally.
- `npx playwright test tests/e2e/capabilities.spec.ts` — Blocked in environment because Playwright Chromium executable was not yet available locally.

## Known Stubs
- None found in the modified preset/capability flow.

## Threat Notes
- Presets still exclude credentials, API endpoint values, transcript data, and historical session mutation.
- Capability controls remain UI-level shell toggles within the right-panel support surface.

## Relevant Files
- E:\work\ai\agent\src\app\state\types.ts
- E:\work\ai\agent\src\app\state\appShellStore.ts
- E:\work\ai\agent\src\app\layout\RightPanel.tsx
- E:\work\ai\agent\src\styles\app-shell.css
- E:\work\ai\agent\tests\e2e\presets.spec.ts
- E:\work\ai\agent\tests\e2e\capabilities.spec.ts
