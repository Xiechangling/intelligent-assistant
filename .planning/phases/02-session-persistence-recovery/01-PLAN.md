---
plan_id: "01"
phase: "02"
title: "Create session persistence domain and native storage contract"
wave: 1
depends_on: []
files_modified:
  - "src/app/state/types.ts"
  - "src/app/services/sessionService.ts"
  - "src-tauri/src/session_service.rs"
  - "src-tauri/src/lib.rs"
requirements_addressed:
  - "SESS-01"
  - "SESS-02"
  - "SECR-02"
autonomous: true
---

## Objective
Establish the durable local session model and native persistence contract so the desktop shell can create, load, list, and update sessions without pulling credential data into session storage.

## Must Haves
- Session metadata, transcript content, and recovery snapshot have explicit local-first types
- Native commands exist for create/list/load/update/recovery flows
- Session persistence keeps credential secrets out of session records and transcript files

<tasks>
  <task id="01.1">
    <objective>Define the Phase 2 session domain types in the frontend state layer.</objective>
    <read_first>
- .planning/phases/02-session-persistence-recovery/02-CONTEXT.md
- .planning/phases/02-session-persistence-recovery/02-RESEARCH.md
- src/app/state/types.ts
- src/app/state/appShellStore.ts
    </read_first>
    <action>Extend src/app/state/types.ts with explicit session types for SessionRecord, SessionStatus, SessionMessage, SessionRecentActivity, SessionRecoverySnapshot, and any small query/filter shapes needed for a canonical history list. Each session record must include a stable session id, project path, project display name, created timestamp, updated/last-activity timestamp, effective model id, title, status label, and recent-activity summary. Keep the transcript/message schema minimal and focused on resume/history needs rather than Phase 3 chat workflow abstractions.</action>
    <acceptance_criteria>
- src/app/state/types.ts contains SessionRecord type or interface
- src/app/state/types.ts contains a session status type with lightweight labels suitable for UI display
- src/app/state/types.ts contains transcript/message and recent-activity state shapes
- src/app/state/types.ts contains a recovery snapshot shape for last active or resumable session restoration
- no session type includes API key or credential secret fields
    </acceptance_criteria>
  </task>

  <task id="01.2">
    <objective>Create native session persistence commands and local storage layout.</objective>
    <read_first>
- src-tauri/src/lib.rs
- src-tauri/src/project_service.rs
- src-tauri/src/credential_service.rs
- .planning/phases/02-session-persistence-recovery/02-RESEARCH.md
    </read_first>
    <action>Create src-tauri/src/session_service.rs and register it in src-tauri/src/lib.rs. Implement Tauri commands for creating a new session, listing sessions with optional project filtering, loading a session by id, appending or replacing transcript content as needed for resume support, updating recent activity/status, persisting the last active recovery snapshot, and reading the last resumable session on startup. Store session metadata and transcript data under an app-owned local directory with a stable structure that separates metadata from transcript content and keeps credentials managed only by the existing credential service.</action>
    <acceptance_criteria>
- src-tauri/src/session_service.rs exists
- src-tauri/src/session_service.rs contains create-session command logic
- src-tauri/src/session_service.rs contains list-sessions command logic with optional project filter support
- src-tauri/src/session_service.rs contains load-session command logic by session id
- src-tauri/src/session_service.rs contains recovery snapshot read/write logic
- src-tauri/src/lib.rs registers the session service commands
- session persistence logic does not import, store, or serialize raw API credential values
    </acceptance_criteria>
  </task>

  <task id="01.3">
    <objective>Create the frontend session service contract that mirrors the native commands.</objective>
    <read_first>
- src/app/services/projectService.ts
- src/app/services/credentialService.ts
- src/app/state/types.ts
- src-tauri/src/session_service.rs
    </read_first>
    <action>Create src/app/services/sessionService.ts with typed wrappers for the native session commands. The service must expose at least createSession, listSessions, loadSession, updateSessionActivity, saveRecoverySnapshot, and loadRecoverySnapshot operations. Keep listSessions as the single canonical query path with filter arguments instead of separate global-history and per-project-history APIs.</action>
    <acceptance_criteria>
- src/app/services/sessionService.ts exists
- src/app/services/sessionService.ts calls Tauri session commands through invoke
- src/app/services/sessionService.ts exposes a single listSessions path with optional filtering arguments
- src/app/services/sessionService.ts exposes create and load operations for session resume flow
- frontend session service types align with the session types defined in src/app/state/types.ts
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read src/app/state/types.ts and confirm durable session metadata, transcript, recent-activity, and recovery types exist
- Read src-tauri/src/session_service.rs and confirm create/list/load/recovery commands exist with local-only persistence
- Read src/app/services/sessionService.ts and confirm one canonical listSessions API supports optional project filtering
- Confirm no session persistence file or type stores credential secrets or duplicates credential-service responsibilities
