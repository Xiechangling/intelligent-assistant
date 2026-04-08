# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Tauri desktop shell with a React/Zustand frontend and a Rust command backend.

**Key Characteristics:**
- Use `src/main.tsx` and `src/App.tsx` as a thin frontend bootstrap that mounts a single shell component from `src/app/layout/AppShell.tsx`.
- Use `src/app/state/appShellStore.ts` as the orchestration layer for UI state, session lifecycle, assistant turns, approval workflow, and execution review.
- Use Tauri commands registered in `src-tauri/src/lib.rs` as the boundary between the TypeScript UI and native filesystem, credential, session, assistant, and execution services.

## Layers

**Frontend bootstrap layer:**
- Purpose: Start the React application and load the shell stylesheet.
- Location: `src/main.tsx`, `src/App.tsx`
- Contains: React root render, initial recovery trigger, root shell selection.
- Depends on: `src/app/layout/AppShell.tsx`, `src/styles/app-shell.css`, `src/app/state/appShellStore.ts`
- Used by: Vite entry configured through `index.html` and `vite.config.ts`.

**Layout and presentation layer:**
- Purpose: Render the desktop shell regions and expose user actions.
- Location: `src/app/layout/`
- Contains: `src/app/layout/TopToolbar.tsx`, `src/app/layout/LeftSidebar.tsx`, `src/app/layout/CenterWorkspace.tsx`, `src/app/layout/RightPanel.tsx`, `src/app/layout/BottomPanel.tsx`, `src/app/layout/AppShell.tsx`
- Depends on: `src/app/state/appShellStore.ts`, `src/styles/app-shell.css`, `src/app/services/*.ts`
- Used by: `src/App.tsx`

**State and workflow orchestration layer:**
- Purpose: Hold app state and coordinate multi-step workflows.
- Location: `src/app/state/appShellStore.ts`, `src/app/state/types.ts`
- Contains: Session creation, recovery, transcript mutation, approval state, execution state, attachment state, preset state, right panel state.
- Depends on: `src/app/services/assistantService.ts`, `src/app/services/sessionService.ts`, `src/app/services/projectService.ts`, `src/app/services/attachmentService.ts`
- Used by: All components in `src/app/layout/`

**Frontend service adapter layer:**
- Purpose: Convert UI requests into Tauri invocations or plugin calls.
- Location: `src/app/services/`
- Contains: `src/app/services/assistantService.ts`, `src/app/services/sessionService.ts`, `src/app/services/projectService.ts`, `src/app/services/credentialService.ts`, `src/app/services/attachmentService.ts`
- Depends on: `@tauri-apps/api/core` and `@tauri-apps/plugin-dialog`
- Used by: `src/app/state/appShellStore.ts`, `src/app/layout/TopToolbar.tsx`, `src/app/layout/LeftSidebar.tsx`, `src/app/layout/RightPanel.tsx`

**Native command boundary layer:**
- Purpose: Expose backend capabilities to the UI through Tauri commands.
- Location: `src-tauri/src/lib.rs`
- Contains: Command registration for assistant, execution, project, credential, and session features.
- Depends on: `src-tauri/src/assistant_service.rs`, `src-tauri/src/execution_service.rs`, `src-tauri/src/project_service.rs`, `src-tauri/src/credential_service.rs`, `src-tauri/src/session_service.rs`
- Used by: All frontend service modules under `src/app/services/`

**Native domain service layer:**
- Purpose: Perform local persistence, secure credential access, remote assistant calls, and approved command execution.
- Location: `src-tauri/src/`
- Contains: Rust modules for session storage, project recents, keyring-backed credentials, Anthropic request execution, and git-based review collection.
- Depends on: `reqwest`, `keyring`, `dirs`, `std::fs`, `std::process::Command`
- Used by: `src-tauri/src/lib.rs`

## Data Flow

**Application startup flow:**

1. `src/main.tsx` mounts `src/App.tsx` and loads `src/styles/app-shell.css`.
2. `src/App.tsx` calls `attemptRecovery()` from `src/app/state/appShellStore.ts` inside `useEffect`.
3. `attemptRecovery()` loads a recovery snapshot through `src/app/services/sessionService.ts`, which invokes `load_recovery_snapshot` from `src-tauri/src/session_service.rs`.
4. If a snapshot exists, the store reloads the full session through `load_session`, updates UI state, and refreshes history.

**Project selection and session browsing flow:**

1. `src/app/layout/TopToolbar.tsx` or `src/app/layout/LeftSidebar.tsx` calls `pickProjectDirectory()` from `src/app/services/projectService.ts`.
2. `src/app/services/projectService.ts` opens the native directory picker through `@tauri-apps/plugin-dialog`, then invokes `select_project_directory`.
3. `src-tauri/src/project_service.rs` normalizes the path, marks it as standard or non-standard, persists recent projects, and returns a `ProjectRecord`.
4. `src/app/state/appShellStore.ts` stores the active project and `src/app/layout/CenterWorkspace.tsx` uses that state to show project session history or a project conversation view.

**Assistant turn flow:**

1. `src/app/layout/CenterWorkspace.tsx` gathers prompt text and attachments, then calls `submitPrompt()` in `src/app/state/appShellStore.ts`.
2. `submitPrompt()` ensures there is an active session, appends a `user-message` event, persists the session through `src/app/services/sessionService.ts`, and calls `streamAssistantResponse()` from `src/app/services/assistantService.ts`.
3. `src/app/services/assistantService.ts` invokes `start_assistant_turn` in `src-tauri/src/assistant_service.rs`.
4. `src-tauri/src/assistant_service.rs` loads secure credentials from `src-tauri/src/credential_service.rs`, builds a system prompt and user prompt, performs the Anthropic request, parses the JSON response, and returns stages, assistant text, tool summary, and an optional command proposal.
5. `src/app/state/appShellStore.ts` converts that payload into transcript events, live assistant text, pending approval state, and updated session persistence.

**Approved execution and review flow:**

1. `src/app/layout/CenterWorkspace.tsx` or `src/app/layout/BottomPanel.tsx` surfaces a pending proposal stored in `src/app/state/appShellStore.ts`.
2. `approvePendingCommand()` in `src/app/state/appShellStore.ts` appends approval and execution events, then calls `runApprovedCommand()` from `src/app/services/assistantService.ts`.
3. `src/app/services/assistantService.ts` invokes `execute_approved_command` in `src-tauri/src/execution_service.rs`.
4. `src-tauri/src/execution_service.rs` validates that `workingDirectory` stays within `projectPath`, runs the command, captures stdout and stderr, runs `git status --short` and `git diff HEAD -- <path>` to collect changed file review data, and returns execution output plus diffs.
5. `src/app/state/appShellStore.ts` updates `executionRecord`, marks review-ready files, persists the session, and `src/app/layout/BottomPanel.tsx` renders output and per-file diffs.

**Session persistence flow:**

1. `src/app/state/appShellStore.ts` creates and mutates `SessionDetail` objects defined in `src/app/state/types.ts`.
2. `src/app/services/sessionService.ts` maps those operations to `create_session`, `list_sessions`, `load_session`, `update_session_activity`, `save_recovery_snapshot`, and `load_recovery_snapshot`.
3. `src-tauri/src/session_service.rs` stores metadata JSON under a local `metadata` directory and transcript JSON under a local `transcripts` directory inside the app data namespace.
4. The same service sorts session history by `last_activity_at` and returns full session details back to the UI.

**State Management:**
- Use a single Zustand store in `src/app/state/appShellStore.ts` for application-wide UI state and workflow orchestration.
- Keep durable session data mirrored between in-memory state and Tauri-managed JSON files through `persistSession()` and recovery snapshot writes in `src/app/state/appShellStore.ts`.
- Keep presentational components mostly stateless and derived from store selectors in `src/app/layout/*.tsx`.

## Key Abstractions

**App shell regions:**
- Purpose: Divide the desktop UI into top toolbar, left navigation, center workspace, right inspector, and bottom utility tray.
- Examples: `src/app/layout/AppShell.tsx`, `src/app/layout/TopToolbar.tsx`, `src/app/layout/LeftSidebar.tsx`, `src/app/layout/RightPanel.tsx`, `src/app/layout/BottomPanel.tsx`
- Pattern: Composition of fixed layout regions controlled by store booleans and CSS grid classes in `src/styles/app-shell.css`.

**Session domain model:**
- Purpose: Represent persistent conversation and coding sessions.
- Examples: `src/app/state/types.ts`, `src-tauri/src/session_service.rs`
- Pattern: Shared camelCase JSON contract between TypeScript interfaces and Rust `serde(rename_all = "camelCase")` structs.

**Transcript event stream:**
- Purpose: Represent every user-visible step in a session timeline.
- Examples: `src/app/state/types.ts`, event append helpers in `src/app/state/appShellStore.ts`, rendering in `src/app/layout/CenterWorkspace.tsx`
- Pattern: Append-only event list with specialized `kind` values such as `stage-status`, `approval-request`, `execution-update`, and `review-available`.

**Service invocation adapters:**
- Purpose: Isolate Tauri command names from components.
- Examples: `src/app/services/assistantService.ts`, `src/app/services/sessionService.ts`, `src/app/services/projectService.ts`, `src/app/services/credentialService.ts`
- Pattern: Small async wrapper functions around `invoke()` or `open()` that return typed results.

**Native command modules:**
- Purpose: Keep backend capabilities split by concern while exposing one flat invoke surface.
- Examples: `src-tauri/src/lib.rs`, `src-tauri/src/project_service.rs`, `src-tauri/src/session_service.rs`, `src-tauri/src/credential_service.rs`, `src-tauri/src/assistant_service.rs`, `src-tauri/src/execution_service.rs`
- Pattern: Per-concern Rust modules with `#[tauri::command]` entry functions registered centrally.

## Entry Points

**Web frontend entry:**
- Location: `src/main.tsx`
- Triggers: Vite dev server from `vite.config.ts` and Tauri dev/build hooks from `src-tauri/tauri.conf.json`
- Responsibilities: Mount React, import shell CSS, render the root `App` component.

**React root application entry:**
- Location: `src/App.tsx`
- Triggers: Rendered from `src/main.tsx`
- Responsibilities: Trigger session recovery on startup and return `src/app/layout/AppShell.tsx`.

**Desktop shell entry:**
- Location: `src/app/layout/AppShell.tsx`
- Triggers: Rendered by `src/App.tsx`
- Responsibilities: Compose the full shell layout and decide whether the bottom panel is visible.

**Native executable entry:**
- Location: `src-tauri/src/main.rs`
- Triggers: Tauri runtime startup
- Responsibilities: Start the Rust library entrypoint `intelligent_assistant_lib::run()`.

**Native Tauri application entry:**
- Location: `src-tauri/src/lib.rs`
- Triggers: Called from `src-tauri/src/main.rs`
- Responsibilities: Initialize the dialog plugin, register invoke handlers, and run the Tauri app.

## Error Handling

**Strategy:** Surface recoverable backend and workflow failures as UI-safe strings while keeping most UI interactions optimistic.

**Patterns:**
- Catch async failures in `src/app/state/appShellStore.ts` and convert them into user-facing state such as `assistantError`, `sessionHistoryError`, `recoveryMessage`, or status transitions like `needs-attention`.
- Return `Result<_, String>` from Rust commands in `src-tauri/src/*.rs` and serialize simple error messages across the Tauri boundary.
- Use local `try/catch` blocks in UI components like `src/app/layout/TopToolbar.tsx`, `src/app/layout/LeftSidebar.tsx`, and `src/app/layout/RightPanel.tsx` for command actions that should not crash rendering.

## Cross-Cutting Concerns

**Logging:** Use lightweight `console.error` calls in frontend components such as `src/app/layout/TopToolbar.tsx` and `src/app/layout/LeftSidebar.tsx`. Native modules do not define a structured logging layer.

**Validation:** Validate mode requirements in `src-tauri/src/assistant_service.rs`, validate project/working-directory containment in `src-tauri/src/execution_service.rs`, validate API base URL format in `src-tauri/src/credential_service.rs`, and normalize selected project paths in `src-tauri/src/project_service.rs`.

**Authentication:** Store the Anthropic API key in the OS keyring via `src-tauri/src/credential_service.rs`, expose only status and save/clear operations through `src/app/services/credentialService.ts`, and allow an overridable API base URL persisted in a local settings JSON file from the same Rust module.

---

*Architecture analysis: 2026-04-02*
