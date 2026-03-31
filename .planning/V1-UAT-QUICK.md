---
status: pending
scope: v1-mvp-quick
source: [V1-UAT.md]
started: 2026-03-30T00:00:00Z
updated: 2026-03-30T00:00:00Z
---

# v1 UAT Quick Check

Use this when you want a fast 10-minute confidence pass before doing the full checklist.

## Quick Steps

### 1. Build
expected: `npm run build` succeeds.
result: [pending]

### 2. Launch app
expected: `npm run tauri:dev` opens the desktop shell successfully.
result: [pending]

### 3. Select project and create session
expected: In project mode, select a project and create a new session.
result: [pending]

### 4. Send a coding task
expected: The center workspace shows staged assistant progress and streaming response.
result: [pending]

### 5. Review approval gate
expected: Approval UI clearly shows command, project path, and working directory.
result: [pending]

### 6. Reject once
expected: Rejecting prevents execution and records the rejection in the timeline.
result: [pending]

### 7. Approve once
expected: Approving starts execution and shows output in the bottom panel.
result: [pending]

### 8. Inspect review surface
expected: After execution completes, changed files and diff preview are available from the review UI.
result: [pending]

### 9. Save a preset
expected: The settings panel can save the current configuration as a preset.
result: [pending]

### 10. Toggle a workflow capability
expected: A skill/workflow capability can be enabled or disabled from settings.
result: [pending]

## Quick Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0
blocked: 0
