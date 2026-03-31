# Phase 2: Session Persistence & Recovery - Research

**Date:** 2026-03-30
**Status:** Complete
**Phase:** 02-session-persistence-recovery

## Research Objective

Determine what needs to be true for Phase 2 planning to deliver durable session creation, direct session resume, project-filterable history, and restart-safe recovery in the current Windows-first Tauri + React shell.

## Inputs Reviewed

- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md`
- `.planning/phases/01-desktop-shell-project-foundation/02-PLAN.md`
- `.planning/phases/01-desktop-shell-project-foundation/02-SUMMARY.md`
- `src/app/state/types.ts`
- `src/app/state/appShellStore.ts`
- `src/app/layout/CenterWorkspace.tsx`
- `src/app/layout/LeftSidebar.tsx`
- `src/app/layout/TopToolbar.tsx`
- `src/app/layout/RightPanel.tsx`
- `src/app/services/projectService.ts`
- `src/app/services/credentialService.ts`
- `src/app/layout/BottomPanel.tsx`

## Current Codebase Findings

### Existing assets Phase 2 can build on
- The shell already reserves a distinct `project-sessions` workspace state in `src/app/state/types.ts` and `src/app/layout/CenterWorkspace.tsx`.
- The app already separates global default model from per-session model override in `src/app/state/types.ts` and `src/app/state/appShellStore.ts`.
- The left sidebar already has a dedicated recent-sessions section in `src/app/layout/LeftSidebar.tsx`, but it is still placeholder-only.
- The top toolbar already exposes active project and model state in `src/app/layout/TopToolbar.tsx`, which are the exact shell surfaces that session resume must rehydrate.
- Tauri command invocation is already the service pattern for native capabilities in `src/app/services/projectService.ts` and `src/app/services/credentialService.ts`.

### Gaps that Phase 2 must close
- There is no session domain model yet: no `SessionRecord`, session metadata type, transcript item type, or persisted activity status shape.
- There is no session persistence service on either the frontend or the Tauri backend.
- There is no transcript storage, no session-history retrieval, and no restore-on-startup flow.
- The current shell store holds session-related primitives but not an active session object, a history list, or recovery status.
- The current UI placeholders do not yet encode how sessions are grouped, filtered, or resumed.

## Implementation Implications

### 1. Session persistence should be metadata-first and local-first
Because the product is explicitly single-user and local-first, Phase 2 should store session data locally with a clear split between:
- **Session metadata** for fast list rendering and filtering
- **Transcript content** for full resume and replay
- **Recovery snapshot** for last-opened or active session restoration on app restart

This aligns with the product constraint in `.planning/PROJECT.md` and avoids premature cloud/account architecture.

### 2. Session identity should be stable and explicit
To support resume/history/restart recovery, each session needs a stable ID and immutable creation metadata. At minimum, the persisted session model should include:
- session id
- project identifier/path
- project display name
- created timestamp
- updated timestamp / last activity timestamp
- effective model id
- title/summary label for list display
- status (active / idle / completed / errored or equivalent)
- recent activity summary

Without this metadata layer, the app cannot satisfy SESS-02, SESS-03, SESS-04 cleanly.

### 3. Resume should rehydrate shell state before rendering conversation detail
The user chose direct resume. That means clicking a session should do more than navigate:
- restore active project path
- restore active session id
- restore active session model override or effective model
- load transcript/messages
- restore lightweight recent-activity state
- route the shell to the active session workspace

This is a shell-state rehydration problem, not just a data fetch.

### 4. History should support global listing with project filter, not duplicated list systems
The user explicitly wants a global unified history list with project filtering. Planning should therefore avoid building separate primary session lists for:
- global history
n- per-project history

Instead, implement one canonical session query surface with filter arguments. A project-specific view can become a pre-filtered variant of the same source.

### 5. “Recent activity state” should remain lightweight in Phase 2
The user did not ask for full UI-state restoration. That suggests Phase 2 should restore a compact operational state such as:
- last active timestamp
- whether the session was mid-conversation or simply idle
- a short last-task / last-turn summary
- possibly whether there was unfinished output

It should not try to restore every panel toggle, filter chip, or sidebar expansion state in this phase.

### 6. Native persistence should likely follow the existing Tauri service boundary
Current native interactions use frontend service wrappers around Tauri commands. Phase 2 should likely follow the same shape:
- `sessionService.ts` on the frontend
- Rust-side Tauri commands for create/list/load/update session state
- local filesystem or app-data storage under a stable app-owned directory

This preserves consistency with project/credential capabilities and fits the Windows-first desktop architecture.

## Recommended Planning Decomposition

### Slice A — Session domain and persistence contract
Plan a first slice that defines durable session types and persistence APIs before UI wiring. This should establish:
- session metadata schema
- transcript/message schema (minimal but extendable)
- recent activity snapshot shape
- create/list/load/update storage operations
- restart recovery lookup for the last active or resumable session

### Slice B — Shell-store integration and recovery flow
Plan a second slice that integrates persisted session data into the shell store:
- active session state
- session history state
- loading/error states
- resume action that rehydrates project/model/activity state
- boot-time recovery hook

### Slice C — Session history and resume UI
Plan a third slice that replaces placeholders with real UX:
- global session list in center workspace and/or sidebar
- project filter control
- recent-session rows with metadata
- direct click-to-resume behavior
- empty, loading, and error states

This sequencing respects the current codebase: backend/service contract first, shell rehydration second, visible history/resume UI third.

## Risks and Planning Watchouts

### Risk: over-scoping transcript architecture too early
Phase 3 owns the full conversational workflow. Phase 2 should only store enough transcript structure to support resume/history, not a full future-proof chat engine abstraction.

### Risk: mixing active-session state with shell-global state too loosely
The app already has shell-global mode/project/model state. Planning should clearly separate:
- shell-global defaults
- active session state
- persisted session history cache

Otherwise resume behavior will become fragile.

### Risk: project identity based only on display text
Use project path or another stable local identifier as the primary association. Display names alone are insufficient for reliable filtering and recovery.

### Risk: session list UI designed before metadata contract exists
If UI is built before metadata fields are locked, the plan may produce churn. Metadata and persistence shape should come first.

### Risk: security ambiguity around local persistence
SECR-02 requires session metadata persistence, but not insecure secret persistence. Plans should keep credentials separate from session storage and never duplicate API secrets into session records.

## Recommended Mainstream Product Baseline

Given the user’s preference, mainstream agent/chat session behavior should mean:
- one canonical history list
- sort by recent activity descending
- lightweight project/context filter
- click to directly reopen/resume
- visible but compact metadata (title, project, time, model, status)
- restore enough state to continue work, not every UI pixel

This baseline is strong enough for MVP and avoids custom complexity.

## Validation Architecture

### Goal-backward validation targets
A valid Phase 2 plan must collectively prove that the product can:
1. Create a new persisted session for a selected project.
2. Reopen the app and resume a prior session with preserved transcript and metadata.
3. Browse session history globally while filtering by project.
4. Restore project/model/recent activity state when resuming.
5. Keep session persistence local and separate from credential secrets.

### Required evidence for later execution/verification
Plans should make later execution produce evidence such as:
- session persistence service exists and reads/writes durable local session records
- shell store contains active session state and recovery/hydration actions
- UI renders real session entries instead of placeholders
- project filter affects the displayed session list
- resume action restores project and model state before showing the active session
- restart path can discover and reload resumable session state
- credential storage remains isolated from session persistence logic

### Suggested testing strategy for planning
- Unit tests for session record normalization and storage read/write operations
- Integration tests for create/list/load/resume session flows
- UI/state tests for project filtering and direct resume behavior
- Recovery test covering app-start hydration of a previously active/resumable session

## Planning Recommendations

1. Start with a dedicated session domain model rather than bolting session fields ad hoc onto existing shell types.
2. Use one session query path with optional project filtering to match the chosen UX.
3. Keep recovery state intentionally small in Phase 2: project, model, recent activity, transcript metadata.
4. Route all persistence through explicit session services and native commands rather than storing everything in frontend-only state.
5. Preserve Phase 1 shell structure; replace placeholders instead of redesigning layout.

## Research Conclusion

Phase 2 should be planned as a local persistence and shell-rehydration phase, not merely a session-list UI phase. The core success factor is establishing a durable session contract that the shell can restore consistently across app restarts while exposing a mainstream, low-friction history-and-resume UX.
