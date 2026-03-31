# Validation Strategy — Phase 3: Conversational Coding Workflow

**Phase:** 3
**Date:** 2026-03-30

## Validation Architecture

### Goal-backward checks
The plans for this phase must collectively prove:
1. The app can accept prompts from the desktop UI in both project mode and pure conversation mode.
2. The app can stream assistant responses into the active session with visible in-progress state.
3. The app can represent project-aware Claude Code-style task flow in project mode without implementing later approval/review phases early.
4. The app can persist transcript and recent activity updates through the existing local session foundation.
5. The app keeps project association, effective model, and active session context synchronized during conversation.

### Required evidence types
- Source code reads for extended transcript/event types and assistant orchestration services
- Source code reads for project-mode composer/timeline UI and pure-conversation-mode composer/timeline UI
- Verification that session persistence updates transcript content and recent activity after prompt/response flow
- UI/state checks for streaming, in-progress state, and mode-specific rendering behavior
- Read-based confirmation that Phase 3 does not absorb Phase 4 approval/logging or Phase 5 diff review scope

### Anti-shallow safeguards
Plans should fail verification if they only:
- add a text input without real streaming assistant behavior
- stream plain text without preserving transcript updates in the session model
- make project mode and pure conversation mode differ only by label instead of real interaction differences
- show project task flow as raw terminal output or execution logs, effectively pulling in Phase 4 early
- persist only final assistant messages while dropping stage-status or tool-summary events required by the approved project-mode UX

### Planner expectations
Every Phase 3 plan should make target evidence explicit in acceptance criteria, including exact files, concrete message/event shapes, rendering states, persistence behaviors, and visible UI outcomes that prove prompt submission, streaming, and project-aware coding-task presentation work end-to-end.
