---
status: updated-for-04-03
phase: 04-safe-execution-visibility
source: [04-03-PLAN.md, 04-CONTEXT.md, 04-RESEARCH.md, current implementation]
started: 2026-04-06T00:00:00Z
updated: 2026-04-06T00:00:00Z
---

## Native Trust Verification Checklist

Run from `E:/work/ai/agent`:

1. Start the native shell with `npm run tauri:dev`.
2. Open project mode and attach to a workspace session.
3. Trigger one approval-required command.
4. Keep the center workspace, bottom tray, and right panel visible during the checks below.

## Checks

### 1. Approval request stays conversation-first while the tray auto-expands
expected: The center workspace remains the primary conversation surface, while the bottom tray auto-expands into the approval flow.
result: blocked
notes: `npm run tauri:dev` was started for verification, but this environment could not complete an interactive native-shell check within the CLI session. Re-run locally and confirm the tray opens automatically when approval is requested.

### 2. Approval surface shows exact command and working context together
expected: The approval UI shows summary, exact command, workspace path, working directory, and approval controls together.
result: pending-manual
notes: Automated Playwright coverage asserts `Approve and run`, `Reject command`, `Workspace path`, `Working directory`, `Impact`, and exact command copy. Native shell still needs manual confirmation.

### 3. Reject path preserves active session continuity
expected: Rejecting the command keeps the session attached, records rejection in the transcript, and leaves the composer usable.
result: pending-manual
notes: Automated coverage now asserts rejected toolbar/header/transcript state and enabled composer after rejection. Native shell still needs one trust pass.

### 4. Approve path shows labeled execution output
expected: Approving a safe command shows labeled `system`, `stdout`, and `stderr` lines in the bottom tray without replacing the conversation surface.
result: pending-manual
notes: Automated review coverage asserts labeled output lines in the output tab. Native shell still needs confirmation that the desktop tray matches the web harness.

### 5. Failed execution remains understandable without losing context
expected: A failed command visibly enters a failed state across shell surfaces while keeping the user in the same session.
result: pending-manual
notes: Automated approval coverage now asserts failed toolbar state, stderr visibility, session-header summary, right-panel status, and enabled composer after failure.

### 6. Out-of-project working directory is blocked with explicit safety messaging
expected: Native execution refuses a working directory outside the selected project root and surfaces a clear boundary error.
result: pending-manual
notes: This behavior is enforced in Rust and cannot be fully proven by the browser harness. Use the dev/test harness to provoke the escape-path attempt and record the exact rejection message observed in the desktop shell.

### 7. Degraded review path is explicit when review artifacts are unavailable
expected: If execution succeeds but review artifacts are unavailable, the tray shows explicit degraded review messaging rather than an empty success state.
result: pending-manual
notes: Automated review coverage asserts `Review unavailable`, the degraded system message, zero changed files, and review-tab fallback guidance.

## Automated Verification Run During 04-03 Execution

### Commands
- `npm run test:e2e:approval`
- `npm run test:e2e:review`
- `npm run test:e2e:status`
- `npm run build`
- `npm run tauri:dev`

### Results
- `npm run build` — pass
- `npm run test:e2e:approval` — blocked by missing Playwright browser executable (`chrome-headless-shell.exe` not installed)
- `npm run test:e2e:review` — blocked by missing Playwright browser executable (`chrome-headless-shell.exe` not installed)
- `npm run test:e2e:status` — blocked by missing Playwright browser executable (`chrome-headless-shell.exe` not installed)
- `npx playwright install chromium` — failed due to repeated download timeout / connection reset in this environment
- `npm run tauri:dev` — launched as verification attempt, but no interactive desktop result could be captured in this CLI session

## Follow-up Recording Section

When rerunning locally, update each checklist item above with one of:
- `pass`
- `fail`
- `blocked`

For any `fail` or `blocked`, append:
- observed behavior
- exact error text if visible
- whether the issue is web-only, native-only, or both
