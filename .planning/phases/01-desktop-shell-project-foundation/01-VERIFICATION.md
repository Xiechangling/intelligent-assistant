---
phase: 01-desktop-shell-project-foundation
verified: 2026-04-08T00:00:00Z
status: passed
score: 4/4 must-haves verified
overrides_applied: 0
---

# Phase 01: Desktop Shell & Project Foundation Verification Report

**Phase Goal:** Establish a usable Windows-first desktop shell that lets the user manage project roots, choose models, and configure secure local credentials.
**Verified:** 2026-04-08T00:00:00Z
**Status:** passed
**Re-verification:** No — prior report was refreshed against the current codebase and fresh validation evidence.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User can launch the desktop app and add/open a local project directory. | ✓ VERIFIED | `src/app/layout/TopToolbar.tsx` and `src/app/layout/CenterWorkspace.tsx` both call `pickProjectDirectory()`. `src/app/services/projectService.ts` opens the native directory picker and invokes Tauri `select_project_directory`. `src-tauri/src/project_service.rs` normalizes the path, creates a `ProjectRecord`, persists it into `recent-projects.json`, and returns it to the UI. Fresh evidence: `npm run test:e2e:startup` passed with 5 tests, including startup entry-state coverage. |
| 2 | User can switch between known projects and always see the active project context clearly. | ✓ VERIFIED | `src-tauri/src/project_service.rs` exposes `list_recent_projects` and persists recents; `TopToolbar.tsx` loads recents on mount and shows the active workspace in the toolbar context block; `LeftSidebar.tsx` renders recent workspaces and lets the user activate them; `RightPanel.tsx` shows mode, workspace, model, credential state, and workflow state. `useAppShellStore.setActiveProject()` updates `activeProjectPath`, recents ordering, shell view, and warning banner state. |
| 3 | User can choose and change the active Claude model from the GUI. | ✓ VERIFIED | `TopToolbar.tsx` renders a persistent model selector. The selector writes to `useAppShellStore.setGlobalDefaultModel()`. `tests/e2e/startup.spec.ts` verifies both that the toolbar model selector is visible and that changing it updates the future default model while preserving an active session override. Fresh evidence: `npm run test:e2e:startup` passed. |
| 4 | User can store required API credentials securely without plaintext secrets in normal UI config. | ✓ VERIFIED | `RightPanel.tsx` provides the credential/settings form and calls `saveCredential`, `replaceCredential`, `clearCredential`, and assistant connection settings helpers. `src/app/services/credentialService.ts` bridges those calls to Tauri commands. `src-tauri/src/credential_service.rs` stores API keys via OS keyring (`keyring::Entry`) rather than frontend config, while only the non-secret base URL is serialized to `assistant-settings.json`. The current UI surfaces credential state but does not expose plaintext stored secrets. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `E:/work/ai/agent/src/app/layout/TopToolbar.tsx` | Persistent top-level mode/project/model controls and visible active context | ✓ VERIFIED | Substantive component with mode switcher, workspace picker, model selector, context summary, credential/settings entry points, and recents/credential bootstrap wiring. |
| `E:/work/ai/agent/src/app/layout/LeftSidebar.tsx` | Known-project switching surface plus recent session navigation | ✓ VERIFIED | Renders recent workspaces, highlights active workspace, shows non-standard warning marker, and resumes sessions from chooser-derived rows. |
| `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` | Main workspace shell states for no-workspace, recovery, chooser, and attached session | ✓ VERIFIED | Substantive stateful surface with no-workspace entry, recovery CTA, session chooser, and project-session surface. Not a placeholder. |
| `E:/work/ai/agent/src/app/layout/RightPanel.tsx` | Context visibility plus secure settings/credential entry surface | ✓ VERIFIED | Renders workspace/session context and a settings form wired to credential and connection-setting services. |
| `E:/work/ai/agent/src/app/state/appShellStore.ts` | Central state wiring for project context, model state, warnings, and credential state | ✓ VERIFIED | Large Zustand store with concrete state transitions for `setActiveProject`, model changes, recovery, sessions, and derived desktop workflow state. |
| `E:/work/ai/agent/src/app/services/projectService.ts` | Frontend-to-Tauri bridge for project picking and recent projects | ✓ VERIFIED | Uses Tauri dialog + `invoke()` commands; includes Playwright mocks for automated behavioral checks. |
| `E:/work/ai/agent/src/app/services/credentialService.ts` | Frontend-to-Tauri bridge for secure credential operations | ✓ VERIFIED | Uses `invoke()` for status/store/replace/clear/get/save settings operations; includes Playwright mocks. |
| `E:/work/ai/agent/src-tauri/src/project_service.rs` | Backend persistence and validation for project records | ✓ VERIFIED | Normalizes path, detects standard project markers, tags non-standard folders, and persists recent projects locally. |
| `E:/work/ai/agent/src-tauri/src/credential_service.rs` | Backend secure secret storage implementation | ✓ VERIFIED | Uses OS keyring for secrets, validates non-empty keys, supports clear/status/read, and stores only non-secret assistant connection settings in local app data. |
| `E:/work/ai/agent/tests/e2e/startup.spec.ts` | Runnable behavioral coverage for startup shell and model controls | ✓ VERIFIED | Contains 5 substantive Playwright tests covering recovery state, no-workspace state, and model selector behavior. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `TopToolbar.tsx` / `CenterWorkspace.tsx` | `projectService.pickProjectDirectory()` | UI button handlers | ✓ WIRED | Both components call `pickProjectDirectory()` and then route the returned `ProjectRecord` into `setActiveProject(...)`. |
| `projectService.ts` | Tauri `select_project_directory` / `list_recent_projects` | `invoke()` | ✓ WIRED | `pickProjectDirectory()` invokes `select_project_directory`; `getRecentProjects()` invokes `list_recent_projects`. |
| `src-tauri/src/lib.rs` | `project_service.rs` commands | `tauri::generate_handler!` | ✓ WIRED | `select_project_directory` and `list_recent_projects` are registered in the invoke handler. |
| `TopToolbar.tsx` | `appShellStore.setGlobalDefaultModel()` | `<select onChange>` | ✓ WIRED | Model dropdown writes into shared store; tests verify state changes. |
| `RightPanel.tsx` | `credentialService.ts` | settings form submit/clear handlers | ✓ WIRED | Save/Clear actions call credential and connection-settings helpers, then sync `credentialStatus` back into store/UI. |
| `credentialService.ts` | Tauri credential commands | `invoke()` | ✓ WIRED | `credential_status`, `store_api_credential`, `replace_api_credential`, `clear_api_credential`, `get_assistant_connection_settings`, `save_assistant_connection_settings`, and `clear_assistant_connection_settings` are all invoked from the frontend bridge. |
| `src-tauri/src/lib.rs` | `credential_service.rs` commands | `tauri::generate_handler!` | ✓ WIRED | All credential-related commands are registered in the Tauri invoke handler. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `TopToolbar.tsx` | `activeProjectPath`, `globalDefaultModel`, `credentialStatus`, `activeSession` | Zustand store + `getRecentProjects()` + `getCredentialStatus()` | Yes | ✓ FLOWING |
| `LeftSidebar.tsx` | `recentProjects`, `sessionHistory`, chooser rows | Zustand store; project recents are loaded from Tauri persistence | Yes | ✓ FLOWING |
| `RightPanel.tsx` | `credentialStatus`, connection settings drafts | Zustand store + `getAssistantConnectionSettings()` + credential save/clear calls | Yes | ✓ FLOWING |
| `project_service.rs` | recent projects list | Reads/writes `%LocalAppData%`-backed `recent-projects.json` via `dirs::data_local_dir()` | Yes | ✓ FLOWING |
| `credential_service.rs` | API credential status and secret | Reads/writes OS keyring via `keyring::Entry`; base URL persisted separately | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Startup shell and entry states behave correctly | `npm run test:e2e:startup` | User-provided fresh evidence: passed, 5 tests passed | ✓ PASS |
| Current desktop app builds successfully | `npm run build` | User-provided fresh evidence: passed | ✓ PASS |
| Toolbar model selector updates future default model | Covered by Playwright test `shows a desktop model selector and updates the future default model from the toolbar` | Included in the passing `test:e2e:startup` run | ✓ PASS |
| Toolbar model selector preserves active session override | Covered by Playwright test `toolbar model selector keeps current session model stable while updating the future default model` | Included in the passing `test:e2e:startup` run | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| PROJ-01 | ROADMAP Phase 1 | User can add and open a local project directory from the desktop app. | ✓ SATISFIED | UI calls native picker; frontend invokes Tauri project command; Rust backend returns/persists project record. |
| PROJ-02 | ROADMAP Phase 1 | User can switch between previously added project directories. | ✓ SATISFIED | Recent projects are persisted and listed; `LeftSidebar.tsx` and store `setActiveProject()` support switching between known workspaces. |
| PROJ-03 | ROADMAP Phase 1 | User can see the currently active project context clearly before running actions. | ✓ SATISFIED | Toolbar context block and right-panel context rows show workspace, mode, session, model, and workflow state. |
| CONF-01 | ROADMAP Phase 1 | User can choose the active Claude model from the desktop UI. | ✓ SATISFIED | Persistent toolbar selector is wired to store state and covered by E2E tests. |
| CONF-02 | ROADMAP Phase 1 | User can switch models for future interactions without editing CLI configuration manually. | ✓ SATISFIED | Toolbar selector updates `globalDefaultModel`; E2E verifies future default changes without mutating active session override. |
| SECR-01 | ROADMAP Phase 1 | User can store required API credentials securely on the local machine. | ✓ SATISFIED | Secrets use OS keyring in Rust backend; UI only manipulates status and submission, not plaintext config persistence. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None requiring Phase 1 failure classification | — | No blocking placeholder/stub pattern found in the verified Phase 1 shell, project, or credential paths. | ℹ️ Info | Current codebase has evolved beyond Phase 1, but the Phase 1 foundation remains implemented rather than stubbed. |

### Human Verification Required

None. The prior `human_needed` status was based on missing runtime confirmation. The fresh evidence supplied for this verification cycle closes that gap: startup E2E coverage passed and the production build passed.

### Gaps Summary

No Phase 1 gaps found against the roadmap contract. The current codebase not only retains the original Phase 1 foundation, but also demonstrates working behavioral coverage for startup shell states and toolbar model controls. The secure credential path remains backed by OS keyring storage, project selection remains wired through Tauri, and active workspace/model context remains visible in the shell.

---

_Verified: 2026-04-08T00:00:00Z_
_Verifier: Claude (gsd-verifier)_