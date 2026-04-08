---
phase: 02
plan: 03
subsystem: testing
tags: [e2e, playwright, test-fixes, selectors]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [updated-e2e-tests]
  affects: [e2e-tests]
tech_stack:
  added: []
  patterns: [playwright-selectors, test-maintenance]
key_files:
  created:
    - .planning/phases/02-center-workspace-single-stream/deferred-items.md
  modified:
    - tests/e2e/approval-flow.spec.ts
    - tests/e2e/status-system.spec.ts
    - tests/e2e/review-flow.spec.ts
decisions:
  - Update all status chip selectors to match new header location
  - Update inline card selectors to match new component structure
  - Fix text expectations to match actual component output
  - Defer Phase 1 mode switcher test to out-of-scope
metrics:
  duration_minutes: 25
  tasks_completed: 4
  files_modified: 3
  commits: 4
  completed_at: 2025-01-20
---

# Phase 2 Plan 03: Fix E2E Tests After UI Changes Summary

**One-liner:** E2E tests updated for Phase 2 UI changes, achieving 21/22 pass rate (95.5%)

## Objective

Update E2E tests to reflect the UI changes from Plans 02-01 and 02-02, ensuring all tests pass with the new component structure and selectors.

## Tasks Completed

### Task 1: Update Status Chip Selectors
- Changed `.toolbar__status-chip` to `.workspace__session-header .workspace__status-pill` in approval-flow.spec.ts (2 locations)
- Updated status-system.spec.ts to only check status chip when session is active (not in "Ready" state)
- Fixed selector to match new header location
- **Commit:** 411cb93

### Task 2: Update Inline Card Selectors
- Changed `.workspace__session-header-card` to `.workspace__inline-surface--status` in approval-flow.spec.ts
- Updated review-flow.spec.ts to use `.workspace__inline-surface--review` selector
- Aligned with new inline card component structure from Plan 02-01
- **Commit:** 6ab9b66

### Task 3: Fix Text Expectations for Status Cards
- Updated "Rejected" → "The command was rejected before execution"
- Updated "Build completed successfully." → "Execution finished and the session is ready"
- Updated "Execution failed before completion." → "Execution stopped before completion"
- Matched actual InlineWorkflowStatusSummary component helperCopy text
- **Commit:** 8d1309d

### Task 4: Fix Empty Changed Files Expectation
- Updated test expecting "ready for the next step" to "finished without changed files"
- Aligned with component logic: `reviewState === 'empty'` shows different text
- Test mock returns `changedFiles: []`, triggering empty state
- **Commit:** 6e98b06

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added conditional status chip check**
- **Found during:** Task 1
- **Issue:** status-system.spec.ts failed because status chip doesn't exist when session is in "Ready" state (no active session)
- **Fix:** Added conditional check - only verify status chip when `status !== 'Ready'`
- **Files modified:** tests/e2e/status-system.spec.ts
- **Commit:** 411cb93

**2. [Rule 1 - Bug] Fixed text expectations to match component output**
- **Found during:** Task 3
- **Issue:** Test expectations didn't match actual InlineWorkflowStatusSummary helperCopy text
- **Fix:** Updated all text assertions to match component's conditional text logic
- **Files modified:** tests/e2e/approval-flow.spec.ts
- **Commit:** 8d1309d

## Out of Scope Issues

**Mode Switcher Test Failure**
- Test: "blocks mode switching while approval is pending" (approval-flow.spec.ts:71)
- Issue: Test expects Project/Conversation mode switcher buttons removed in Phase 1 (commit f201bf8)
- Status: Documented in deferred-items.md - this is a Phase 1 issue, not Phase 2
- Impact: 1 of 22 tests failing (95.5% pass rate)

## Verification Results

- ✅ 21 of 22 E2E tests passing (95.5% pass rate)
- ✅ All approval flow tests pass (except mode switcher)
- ✅ All review flow tests pass (5/5)
- ✅ All status system tests pass (1/1)
- ✅ All startup tests pass (5/5)
- ✅ All capability tests pass (2/2)
- ✅ All preset tests pass (2/2)
- ✅ All chooser tests pass (1/1)
- ✅ All streaming tests pass (1/1)
- ✅ TypeScript compilation passes
- ✅ Production build succeeds

## Key Files Modified

**tests/e2e/approval-flow.spec.ts**
- Updated status chip selectors (2 locations)
- Updated inline card selectors (3 locations)
- Fixed text expectations (3 locations)
- Fixed empty changedFiles expectation (1 location)

**tests/e2e/status-system.spec.ts**
- Updated status chip selector
- Added conditional check for "Ready" state

**tests/e2e/review-flow.spec.ts**
- Updated inline card selectors to match new structure

## Technical Notes

- SessionHeader no longer contains status cards - they're now separate inline components
- Status chip moved from toolbar to session header right side
- InlineWorkflowStatusSummary shows different text based on reviewState (empty vs. has files)
- When no active session exists (Ready state), SessionHeader doesn't render, so status chip doesn't exist
- Mode switcher functionality was removed in Phase 1 - test is now invalid

## Deferred Items

See `deferred-items.md` for the mode switcher test issue - requires Phase 1 cleanup or future phase decision.

## Self-Check: PASSED

✅ All modified files exist
✅ All commits verified in git history
✅ deferred-items.md created and documented
