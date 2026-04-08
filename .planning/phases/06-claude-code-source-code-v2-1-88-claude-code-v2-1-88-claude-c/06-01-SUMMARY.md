---
phase: 06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c
plan: 01
subsystem: state-and-service-contracts
status: completed
implemented_at: 2026-04-06
files_modified:
  - E:/work/ai/agent/src/app/state/types.ts
  - E:/work/ai/agent/src/app/state/appShellStore.ts
  - E:/work/ai/agent/src/app/services/sessionService.ts
  - E:/work/ai/agent/src/app/services/assistantService.ts
verification:
  - npm run build
  - Later desktop-flow verification covered by 06-04-SUMMARY.md and 06-VERIFICATION.md
---

# Phase 6 Plan 01 Summary

Implemented the canonical Phase 6 desktop workflow contract so later shell work could consume one shared workflow vocabulary, one store-derived state machine, and thin typed service boundaries instead of panel-local lifecycle mappings.

## What Changed

### Shared workflow interfaces
- Expanded `E:/work/ai/agent/src/app/state/types.ts` with the canonical desktop workflow vocabulary required by the Phase 6 UI contract.
- Added the exact shared status union:
  - `DesktopWorkflowStatus`
  - `DesktopStartupState`
  - `DesktopTrayMode`
- Added typed view-model contracts for the startup/chooser/session surfaces used by later plans, including:
  - recovery spotlight metadata
  - workspace summary metadata
  - chooser row contracts
  - desktop chooser view model
  - desktop session header
  - desktop workflow view model
- Centralized session attention and action typing so approval, review, failure, recovery, resume, attach, and start-new affordances no longer depend on ad hoc local unions.

### Store state machine and derived selectors
- Refactored `E:/work/ai/agent/src/app/state/appShellStore.ts` into the canonical workflow source of truth for Phase 6 lifecycle state.
- Added centralized derivation helpers and shared exports for later layout plans, including:
  - `deriveDesktopStatus()`
  - `getDesktopWorkflow()`
  - `getDesktopTrayMode()`
  - `getChooserView()`
  - `getActiveSessionHeader()`
- Implemented explicit startup and lifecycle derivation for the required states described in Plan 01:
  - recovery available
  - chooser ready
  - no workspace
  - recovery failed
  - active attached session
  - awaiting approval
  - working/executing
  - review ready
  - failed / needs attention
- Added normalized chooser, recovery, workspace, and attached-session view models so all shell regions can consume the same derived state without inventing local wording.
- Wired tray mode derivation from runtime lifecycle state instead of relying only on manual tab state.

### Lifecycle alignment in persisted session state
- Updated session creation, recovery, resume, prompt submission, approval, rejection, execution, and review transitions so persisted recent activity and runtime state map cleanly onto the canonical workflow labels used by later UI surfaces.
- Ensured active session header and chooser rows can reflect the same shared state for:
  - workflow status
  - current activity summary
  - approval/review/failure attention
  - recovery targeting / spotlight behavior
- Kept project-mode and conversation-mode support intact while normalizing the desktop workflow contract around the shared Phase 6 vocabulary.

### Service contract alignment
- Kept `E:/work/ai/agent/src/app/services/sessionService.ts` and `E:/work/ai/agent/src/app/services/assistantService.ts` as thin wrappers over Tauri invoke calls.
- Tightened typed payload boundaries for:
  - recovery snapshot loading/saving
  - session history records and session detail loading
  - assistant turn payloads and command proposal payloads
  - approved command execution callbacks and changed-file review payloads
- Deliberately did not move UI derivation or presentation logic into service modules; all desktop workflow semantics remain store-owned.

## Key Outputs

- `DesktopWorkflowStatus` now exposes the canonical Phase 6 labels from the shared state contract.
- `DesktopStartupState` and `DesktopTrayMode` provide central typing for startup and lifecycle tray behavior.
- Shared chooser/session view-model contracts now exist for the later shell surfaces, including recovery spotlight, chooser rows, workspace summary, and active session header models.
- The Zustand store now exports one canonical derivation path for status, tray mode, chooser data, and attached-session header state.
- Frontend service modules remain thin typed invoke wrappers aligned to the store contract rather than becoming another source of lifecycle semantics.

## Verification

### Automated

- `npm run build`
  - Result: PASSED
  - Evidence basis: recorded as passed in later Phase 6 summaries and verification artifacts after the canonical contract landed.

### Follow-on validation coverage

- Later UI integration and desktop-flow verification were covered in:
  - `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-04-SUMMARY.md`
  - `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-VERIFICATION.md`
- Those artifacts confirm the shared state contract was consumed by toolbar, chooser, session header, sidebar markers, and tray behavior through the canonical selectors added in this plan.

## Deviations from Plan

None recorded in the available implementation and verification artifacts.

## Known Stubs

None in the Plan 01 store/type/service contract surface.

## Threat Flags

None added by this plan. The service boundary remained thin and approval-gated execution behavior stayed in the existing trust model.

## Notes

- This plan established the contract foundation for the later Phase 6 shell refactors rather than introducing the visible shell redesign by itself.
- `chooser` / `recovery` / `session header` view-models and shared status derivation were intentionally implemented before the Plan 02 and Plan 03 surface work.
- No git commit was created for this backfilled summary.

## Self-Check: PASSED

Confirmed from repository code and existing Phase 6 artifacts that Plan 01 delivered the shared desktop workflow interfaces, centralized store derivation, and thin service-contract alignment required by the plan.