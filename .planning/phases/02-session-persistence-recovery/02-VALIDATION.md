# Validation Strategy — Phase 2: Session Persistence & Recovery

**Phase:** 2
**Date:** 2026-03-30

## Validation Architecture

### Goal-backward checks
The plans for this phase must collectively prove:
1. The app can create a new durable session tied to the selected project and effective model.
2. The app can reopen and resume a prior session with preserved transcript and metadata.
3. The app exposes one canonical session history surface that can be filtered by project without switching to a separate data model.
4. Resuming a session rehydrates shell state before showing the active session, including project context, effective model, and recent activity state.
5. Session persistence remains local-first and does not duplicate or weaken credential storage boundaries.

### Required evidence types
- Source code reads for session domain types, persistence services, Tauri commands, and app-shell store integration
- Source code reads for center workspace, sidebar, toolbar, and right-panel session UI states
- Local persistence reads/writes or tests covering session metadata, transcript content, and recovery snapshot behavior
- UI/state tests or integration checks for project filtering, direct resume, and boot-time recovery

### Anti-shallow safeguards
Plans should fail verification if they only:
- add placeholder session UI without durable local persistence
- store only a session title list without transcript or recovery metadata
- restore a session row visually without rehydrating active project/model state
- implement separate global-history and per-project-history systems instead of one filtered query path
- persist credentials or API keys inside session records, transcript files, or recovery snapshots

### Planner expectations
Every plan should make its target evidence explicit in acceptance criteria, including exact files, exported functions/actions/commands, visible UI behaviors, and tests or read-based verification checks that prove local session durability and safe recovery.
