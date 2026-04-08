---
phase: 06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c
plan: 02
status: completed
implemented_at: 2026-04-06
summary: Center workspace now delivers a session-first startup, chooser, and attached-session surface aligned to the Phase 6 desktop workflow vocabulary.
files_modified:
  - E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx
  - E:/work/ai/agent/src/app/layout/AppShell.tsx
  - E:/work/ai/agent/src/styles/app-shell.css
verification:
  - npm run build
---

# Phase 6 Plan 02 Summary

Implemented the Phase 6 center-workspace redesign so the desktop now lands in a recovery-first, workspace-first, or chooser-first surface instead of the earlier MVP-style history list.

## What Changed

### Center workspace
- Rebuilt `CenterWorkspace.tsx` around Phase 6 startup states:
  - recovery callout
  - no-workspace state
  - recovery-failed state
  - chooser surface
  - attached session surface
- Added official-feeling chooser/session sub-surfaces:
  - `RecoveryCallout`
  - `WorkspaceSummaryCard`
  - `ResumeSessionSpotlight`
  - `SessionList`
  - `SessionSurface`
  - `InlineApprovalSummary`
  - `InlineReviewSummary`
- Replaced MVP copy with Phase 6 copy such as:
  - `No workspace selected`
  - `Open workspace`
  - `Resume session`
  - `Open session chooser`
  - `Start new session`
  - `Send instruction`
  - `Send message`
  - `Approve and run`
  - `Reject command`
  - `Open review`
- Added real workspace-opening behavior in the no-workspace state by wiring the CTA to `pickProjectDirectory()` and store project selection.
- Reframed active project sessions as attached coding sessions with a durable session header, canonical status chip, structured metadata, subordinate system events, and a composer that reflects project vs conversation mode.

### Shell hierarchy
- Updated `AppShell.tsx` to mark bottom-panel-open state on the shell root so layout emphasis can adapt without changing the five-region structure.
- Preserved the same five top-level shell regions while keeping center workspace ownership intact.

### Styling
- Added Phase 6 center-surface styling in `app-shell.css` for:
  - recovery card
  - chooser cards and spotlight
  - workspace summary
  - session surface/header
  - attention markers
  - canonical status pills
  - conversation entry de-emphasis
  - composer footer/slash hint
- Rebalanced shell emphasis so the center workspace reads as the dominant product surface while the drawer remains visually subordinate.

## Verification

Executed:

```bash
npm run build
```

Result: passed.

## Deviations from Plan

### Auto-fixed Issues

1. [Rule 3 - Blocking issue] Replaced invalid inferred component prop types in `CenterWorkspace.tsx`
- **Found during:** build verification
- **Issue:** `ReturnType<ReturnType<typeof useAppShellStore>...` resolved to `unknown` and broke TypeScript compilation.
- **Fix:** Switched component prop typing to explicit store view-model types (`WorkspaceSummaryViewModel`, `RecoverySpotlight`).
- **Files modified:** `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`

2. [Rule 2 - Missing critical functionality] Wired the `Open workspace` CTA to the native project picker
- **Found during:** implementation review of no-workspace state
- **Issue:** the required primary CTA existed visually but did not actually open a workspace, which would have made the startup path incomplete.
- **Fix:** Imported `pickProjectDirectory`, selected a workspace through the store, and refreshed session history for the chosen project.
- **Files modified:** `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`

## Known Stubs

None.

## Threat Flags

None.

## Notes

- `STATE.md`, `ROADMAP.md`, and `REQUIREMENTS.md` were intentionally not modified per execution instruction.
- No git commit was created per execution instruction.

## Self-Check: PASSED

Verified that all planned output files exist and the required build gate passed.