# Deferred Items - Phase 2

## Out of Scope Issues

### E2E Test: "blocks mode switching while approval is pending"

**File:** `tests/e2e/approval-flow.spec.ts:71`

**Issue:** Test fails because it expects Project/Conversation mode switcher buttons that were removed in Phase 1 (commit f201bf8).

**Root Cause:** Phase 1 simplified the toolbar and removed the mode switching UI. The test is now invalid.

**Recommendation:** 
- Option 1: Remove the test entirely if mode switching is permanently removed
- Option 2: Update the test if mode switching was moved to a different location
- Option 3: Re-implement mode switching if it's still a required feature

**Status:** Deferred to Phase 1 cleanup or future phase

**Impact:** 1 of 22 E2E tests failing (95.5% pass rate)
