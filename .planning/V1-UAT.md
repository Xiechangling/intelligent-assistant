---
status: pending
scope: v1-mvp
source: [ROADMAP.md, REQUIREMENTS.md, STATE.md]
started: 2026-03-30T00:00:00Z
updated: 2026-03-30T00:00:00Z
---

# v1 UAT Checklist

## 0. Startup & Build

### 1. Verify build succeeds
expected: Running `npm run build` completes without TypeScript or Vite errors.
result: [pending]

### 2. Verify desktop shell launches
expected: Running `npm run tauri:dev` opens the desktop UI without blank screen or fatal startup failure.
result: [pending]

## 1. Desktop Shell & Project Foundation

### 3. Verify top-level mode switching
expected: The toolbar lets the user switch between **Project** and **Conversation** modes, and the center workspace changes accordingly.
result: [pending]

### 4. Verify project selection and visibility
expected: Selecting a project updates visible project context in the toolbar, sidebar, and right-panel context surfaces.
result: [pending]

### 5. Verify model selection
expected: Changing the active model in the toolbar updates the effective model display without breaking session flow.
result: [pending]

### 6. Verify credential status visibility
expected: Credential status is visible from the shell and settings/context surfaces instead of being hidden.
result: [pending]

## 2. Session Persistence & Recovery

### 7. Verify project session creation
expected: With an active project selected, clicking **New Session** creates a project-tied session and makes it active.
result: [pending]

### 8. Verify session history and resume
expected: The session appears in history and can be resumed from the center workspace or sidebar with project/model/activity context restored.
result: [pending]

### 9. Verify restart recovery
expected: Restarting the app restores the most recent session snapshot and preserves transcript plus recent activity.
result: [pending]

## 3. Conversational Coding Workflow

### 10. Verify pure conversation mode chat flow
expected: In conversation mode, the user can create or continue a lightweight chat session and receive a streaming assistant reply in the session transcript.
result: [pending]

### 11. Verify project-mode coding conversation flow
expected: In project mode, the center workspace shows a coding-task conversation surface with staged workflow markers and assistant output.
result: [pending]

### 12. Verify transcript persistence and activity updates
expected: Sending prompts updates transcript events and recent activity summaries instead of losing conversation state.
result: [pending]

## 4. Safe Execution & Visibility

### 13. Verify approval card details
expected: A project task that proposes impactful work shows an approval card with command text, project path, and working directory before execution starts.
result: [pending]

### 14. Verify reject path
expected: Rejecting the proposed command prevents execution, appends a rejection event to the transcript, and shows no execution output stream.
result: [pending]

### 15. Verify approve-and-run path
expected: Approving the proposed command starts execution, updates visible execution state, and streams output into the bottom panel.
result: [pending]

### 16. Verify execution state synchronization
expected: Toolbar, right panel, bottom panel, and transcript all stay synchronized while execution runs and after it completes.
result: [pending]

## 5. Review, Skills & Workflow Polish

### 17. Verify review-ready indicators
expected: After execution completes, the session shows review-ready indicators and exposes changed-file review surfaces.
result: [pending]

### 18. Verify changed-files list
expected: The user can inspect a list of changed files associated with the assistant action from the UI.
result: [pending]

### 19. Verify diff preview
expected: Selecting a changed file shows a diff preview in the review surface without leaving the shell.
result: [pending]

### 20. Verify preset save/apply
expected: The user can save the current shell configuration as a preset and reapply it later from the settings panel.
result: [pending]

### 21. Verify workflow capability toggles
expected: The user can enable or disable workflow capabilities/skills from the settings UI and see the state update immediately.
result: [pending]

## 6. End-to-End MVP Flow

### 22. Verify end-to-end desktop workflow
expected: The full flow works end-to-end: launch app → select project → create session → send coding task → review approval → approve execution → inspect output → inspect changed files/diff → save preset.
result: [pending]

## Summary

total: 22
passed: 0
issues: 0
pending: 22
skipped: 0
blocked: 0

## Notes

- Current implementation uses local-first simulated assistant/execution/review data for MVP shell validation.
- UAT should focus on UX closure, state synchronization, and persistence behavior rather than real filesystem code modification.
