---
plan_id: "02"
phase: "02"
title: "Integrate persisted sessions into shell state and recovery flow"
wave: 2
depends_on:
  - "01"
files_modified:
  - "src/app/state/types.ts"
  - "src/app/state/appShellStore.ts"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/RightPanel.tsx"
  - "src/App.tsx"
requirements_addressed:
  - "SESS-02"
  - "SESS-04"
  - "SECR-02"
autonomous: true
---

## Objective
Wire durable session data into the shell store so the app can track active session state, restore project/model/activity context, and recover the last resumable session safely on startup.

## Must Haves
- Shell store distinguishes shell-global defaults from active session state and persisted history cache
- Resuming a session restores project context, effective model, and recent activity before the active session workspace renders
- App startup can attempt lightweight recovery without blocking the rest of the shell when recovery fails

<tasks>
  <task id="02.1">
    <objective>Extend the shell store with active session, session history, and recovery state.</objective>
    <read_first>
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- .planning/phases/01-desktop-shell-project-foundation/02-PLAN.md
- .planning/phases/02-session-persistence-recovery/01-PLAN.md
    </read_first>
    <action>Update src/app/state/appShellStore.ts so it stores activeSession, sessionHistory, sessionHistoryFilter, sessionHistoryStatus, recoveryStatus, and resume-in-progress state separately from globalDefaultModel and activeSessionModelOverride. Add store actions for creating a session, loading history, applying a project filter, resuming a session by id, and applying a recovery snapshot. Preserve the existing shell-state boundaries from Phase 1 instead of splitting state across unrelated feature stores.</action>
    <acceptance_criteria>
- src/app/state/appShellStore.ts contains active session state separate from global default model state
- src/app/state/appShellStore.ts contains session history collection state
- src/app/state/appShellStore.ts contains loading/error or status state for history and recovery flows
- src/app/state/appShellStore.ts contains actions for load history, resume session, and apply project filter
- store actions set activeProjectPath, activeSessionModelOverride, and activeShellView during resume flow
    </acceptance_criteria>
  </task>

  <task id="02.2">
    <objective>Implement boot-time session recovery and direct resume wiring.</objective>
    <read_first>
- src/App.tsx
- src/app/state/appShellStore.ts
- src/app/services/sessionService.ts
- src/app/layout/TopToolbar.tsx
    </read_first>
    <action>Update the app bootstrap path so startup attempts to load the last recovery snapshot and, when valid, restores the active project path, effective model context, active session id, recent activity state, and project-sessions workspace before showing the restored session. If recovery fails, keep the shell usable and fall back to normal history loading rather than blocking the app. Ensure direct resume from history uses the same rehydration path as boot-time recovery.</action>
    <acceptance_criteria>
- src/App.tsx or equivalent bootstrap path triggers recovery attempt on startup
- recovery flow reads from sessionService rather than embedding storage logic in UI components
- recovery success updates active project, session model override/effective model, and active shell view
- recovery failure preserves shell usability and records an error/retry-capable state
- direct resume path and startup recovery path share the same state rehydration logic or store action
    </acceptance_criteria>
  </task>

  <task id="02.3">
    <objective>Expose active session context in always-visible shell surfaces.</objective>
    <read_first>
- src/app/layout/TopToolbar.tsx
- src/app/layout/RightPanel.tsx
- src/app/state/appShellStore.ts
- .planning/phases/02-session-persistence-recovery/02-UI-SPEC.md
    </read_first>
    <action>Update TopToolbar and RightPanel so they show lightweight active session metadata without displacing existing project/model visibility. The toolbar must add an active session title or fallback label, session status, and compact last-activity text. The right panel may show project, model, created time, last activity, and recent activity summary for the active session. Keep these surfaces informational; do not turn them into a read-only resume workflow screen.</action>
    <acceptance_criteria>
- src/app/layout/TopToolbar.tsx renders active session title or fallback label
- src/app/layout/TopToolbar.tsx renders session status and last activity metadata
- src/app/layout/RightPanel.tsx renders lightweight session detail when a session is active
- toolbar still shows active project and model context prominently after session metadata is added
- no component requires an intermediate detail page before resuming a session
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read appShellStore.ts and confirm history, active-session, and recovery state are explicit and separate from shell-global defaults
- Read bootstrap wiring and confirm startup recovery uses sessionService and updates project/model/session state before routing to the active workspace
- Read TopToolbar.tsx and RightPanel.tsx and confirm active session metadata is visible but lightweight
- Confirm resume and recovery logic keep failures non-blocking and preserve a retryable shell state
