# Coding Conventions

**Analysis Date:** 2026-04-02

## Naming Patterns

**Files:**
- Use `camelCase` for TypeScript service and state files in `src/app/services/` and `src/app/state/`, for example `src/app/services/assistantService.ts`, `src/app/services/projectService.ts`, and `src/app/state/appShellStore.ts`.
- Use `PascalCase` for React component files in `src/app/layout/`, for example `src/app/layout/AppShell.tsx`, `src/app/layout/TopToolbar.tsx`, and `src/app/layout/CenterWorkspace.tsx`.
- Use lowercase snake_case for Rust backend modules in `src-tauri/src/`, for example `src-tauri/src/assistant_service.rs`, `src-tauri/src/session_service.rs`, and `src-tauri/src/project_service.rs`.
- Use kebab-style class segments in CSS under `src/styles/app-shell.css`, following a BEM-like pattern such as `.app-shell__drawer--open` and `.workspace__conversation-shell--project`.

**Functions:**
- Use `camelCase` for TypeScript functions and callbacks, for example `formatRelativeTime`, `handleProjectPick`, `createConversationSession`, and `streamAssistantResponse` in `src/app/layout/TopToolbar.tsx`, `src/app/layout/CenterWorkspace.tsx`, and `src/app/services/assistantService.ts`.
- Use verb-first names for async operations in the frontend service layer, for example `getCredentialStatus`, `saveCredential`, `loadSession`, and `openImageAttachments` in `src/app/services/credentialService.ts`, `src/app/services/sessionService.ts`, and `src/app/services/attachmentService.ts`.
- Use snake_case for Rust functions and command handlers, for example `start_assistant_turn`, `execute_approved_command`, `select_project_directory`, and `load_recovery_snapshot` in `src-tauri/src/assistant_service.rs`, `src-tauri/src/execution_service.rs`, `src-tauri/src/project_service.rs`, and `src-tauri/src/session_service.rs`.

**Variables:**
- Use `camelCase` for local variables and state selectors in TypeScript, for example `activeProjectPath`, `credentialBusy`, `nextExecution`, and `filteredLabel` in `src/app/layout/RightPanel.tsx`, `src/app/layout/CenterWorkspace.tsx`, and `src/app/state/appShellStore.ts`.
- Use descriptive boolean names prefixed with `is`, `show`, or `should` when deriving UI state, for example `isConversation`, `showProjectConversation`, `showBottomPanel`, and `shouldKeepActiveSession` in `src/app/layout/CenterWorkspace.tsx`, `src/app/layout/AppShell.tsx`, and `src/app/state/appShellStore.ts`.
- Use `UPPER_SNAKE_CASE` for Rust constants, for example `DEFAULT_ANTHROPIC_URL`, `APP_NAMESPACE`, and `RECOVERY_FILE` in `src-tauri/src/assistant_service.rs`, `src-tauri/src/session_service.rs`, and `src-tauri/src/credential_service.rs`.

**Types:**
- Use `PascalCase` for TypeScript types and interfaces in `src/app/state/types.ts` and service modules, for example `SessionDetail`, `ExecutionRecord`, `AssistantStreamInput`, and `ExecutionHandlers`.
- Use string-literal unions for constrained UI state in `src/app/state/types.ts`, for example `AppMode`, `ShellView`, `ExecutionStatus`, and `SessionTranscriptEventKind`.
- Use `PascalCase` structs with `#[serde(rename_all = "camelCase")]` in Rust to match the TypeScript payload shape, for example `AssistantTurnInput`, `ExecuteCommandResponse`, `SessionRecord`, and `AssistantConnectionSettings` in `src-tauri/src/assistant_service.rs`, `src-tauri/src/execution_service.rs`, `src-tauri/src/session_service.rs`, and `src-tauri/src/credential_service.rs`.

## Code Style

**Formatting:**
- No dedicated formatter config file is present in `E:/work/ai/agent`; `.prettierrc`, `prettier.config.*`, `eslint.config.*`, and `biome.json` are not detected.
- TypeScript formatting is consistent with Prettier-style defaults: single quotes, no semicolons, trailing commas in multiline literals, and compact arrow functions. See `src/main.tsx`, `src/app/layout/AppShell.tsx`, and `src/app/services/credentialService.ts`.
- JSX favors one prop per line when expressions become long, as shown by the buttons and transcript components in `src/app/layout/CenterWorkspace.tsx` and `src/app/layout/RightPanel.tsx`.
- Rust formatting follows standard `rustfmt` layout with grouped `use` imports, trailing commas in multiline structs, and one responsibility per helper. See `src-tauri/src/assistant_service.rs`, `src-tauri/src/session_service.rs`, and `src-tauri/src/execution_service.rs`.

**Linting:**
- No ESLint configuration file or lint npm script is defined in `package.json`.
- TypeScript strictness is enforced through `tsconfig.json`, especially `"strict": true`, `"noEmit": true`, `"forceConsistentCasingInFileNames": true`, and `"allowJs": false`.
- Node-side config typing is isolated in `tsconfig.node.json` with `"types": ["node"]` for `vite.config.ts`.
- Frontend and backend payloads are aligned by explicit types rather than runtime validators. Match the existing compile-time discipline used in `src/app/state/types.ts` and the serde-backed Rust structs in `src-tauri/src/*.rs`.

## Import Organization

**Order:**
1. External packages first, for example `react`, `lucide-react`, `zustand`, `@tauri-apps/api/core`, and `@tauri-apps/plugin-dialog` in `src/main.tsx`, `src/app/layout/TopToolbar.tsx`, and `src/app/state/appShellStore.ts`.
2. Internal relative imports second, grouped after external imports, for example `../services/...` and `../state/...` in `src/app/layout/CenterWorkspace.tsx` and `src/app/layout/RightPanel.tsx`.
3. Type-only imports are separated with `import type` where appropriate, for example in `src/app/services/assistantService.ts`, `src/app/services/sessionService.ts`, and `src/app/services/attachmentService.ts`.

**Path Aliases:**
- Not detected. Imports use relative paths such as `../services/sessionService` in `src/app/state/appShellStore.ts` and `./app/layout/AppShell` in `src/App.tsx`.

## Error Handling

**Patterns:**
- Wrap async UI handlers in `try/catch` and surface a short user-facing message in component state, as shown by `handleCredentialSubmit` and `handleCredentialClear` in `src/app/layout/RightPanel.tsx`.
- For fire-and-forget UI actions, call async functions and swallow rejected promises with `.catch(() => undefined)` to avoid unhandled promise warnings, as shown in `src/App.tsx`, `src/app/layout/CenterWorkspace.tsx`, and `src/app/layout/RightPanel.tsx`.
- Normalize unknown errors through a shared helper before storing them in state. `getErrorMessage` in `src/app/state/appShellStore.ts` prefers `Error.message`, then string values, then a fallback.
- Backend Rust code returns `Result<_, String>` from Tauri commands and maps lower-level failures into readable strings with `map_err`, for example in `src-tauri/src/assistant_service.rs`, `src-tauri/src/session_service.rs`, and `src-tauri/src/execution_service.rs`.
- Validate inputs early and return immediately on invalid state, for example empty prompt and missing project guards in `src/app/state/appShellStore.ts`, empty API key validation in `src-tauri/src/credential_service.rs`, and working-directory validation in `src-tauri/src/execution_service.rs`.

## Logging

**Framework:** console

**Patterns:**
- Logging is minimal and limited to direct UI failure points. `console.error('Failed to pick project directory')` appears in `src/app/layout/TopToolbar.tsx` and `src/app/layout/LeftSidebar.tsx`.
- Most recoverable errors are shown in UI state instead of being logged, for example `assistantError`, `sessionHistoryError`, and `credentialMessage` in `src/app/state/appShellStore.ts` and `src/app/layout/RightPanel.tsx`.
- Rust backend modules do not use a logging framework; command functions return error strings instead of writing logs in `src-tauri/src/*.rs`.

## Comments

**When to Comment:**
- Prefer self-explanatory naming over inline comments. The sampled TypeScript and Rust files contain almost no explanatory comments, including `src/app/layout/CenterWorkspace.tsx`, `src/app/state/appShellStore.ts`, and `src-tauri/src/session_service.rs`.
- Use semantic component and helper names to carry intent, such as `ApprovalCard`, `ReviewSummary`, `parseInputSegments`, and `collect_git_review` in `src/app/layout/CenterWorkspace.tsx`, `src/app/state/appShellStore.ts`, and `src-tauri/src/execution_service.rs`.

**JSDoc/TSDoc:**
- Not used in the current frontend files.
- Rust command modules also omit doc comments in `src-tauri/src/assistant_service.rs`, `src-tauri/src/credential_service.rs`, and `src-tauri/src/session_service.rs`.

## Function Design

**Size:**
- Keep service-layer functions small and single-purpose. Examples include `getRecentProjects` in `src/app/services/projectService.ts`, `openImageAttachments` in `src/app/services/attachmentService.ts`, and `loadRecoverySnapshot` in `src/app/services/sessionService.ts`.
- Allow store modules and major UI containers to be large orchestration units. `useAppShellStore` in `src/app/state/appShellStore.ts` and `CenterWorkspace` in `src/app/layout/CenterWorkspace.tsx` are the main exceptions and act as composition roots.
- In Rust, keep public Tauri commands focused and move reusable transformations into private helpers like `build_system_prompt`, `normalize_api_base_url`, `summarize_status`, and `normalize_path` in `src-tauri/src/assistant_service.rs`, `src-tauri/src/credential_service.rs`, `src-tauri/src/execution_service.rs`, and `src-tauri/src/project_service.rs`.

**Parameters:**
- Use typed object parameters when inputs have multiple fields or may expand, for example `AssistantStreamInput` in `src/app/services/assistantService.ts`, `CreateSessionInput` in `src/app/services/sessionService.ts`, and `CreateSessionInput` in `src-tauri/src/session_service.rs`.
- Use simple positional parameters for short service wrappers, for example `saveCredential(apiKey)`, `loadSession(sessionId)`, and `updateSessionActivity(sessionId, update)` in `src/app/services/credentialService.ts` and `src/app/services/sessionService.ts`.
- Pass callback objects for stream-like workflows. `streamAssistantResponse` and `runApprovedCommand` in `src/app/services/assistantService.ts` use handler objects instead of many positional callbacks.

**Return Values:**
- Return early on no-op states instead of throwing, for example attachment pickers with empty selections in `src/app/services/attachmentService.ts` and empty prompt guards in `src/app/state/appShellStore.ts`.
- Frontend services usually return the direct `invoke` payload without extra wrapping, as shown in `src/app/services/sessionService.ts`, `src/app/services/projectService.ts`, and `src/app/services/credentialService.ts`.
- Rust helpers prefer explicit domain payloads over tuples or untyped maps, as shown by `ExecuteCommandResponse` in `src-tauri/src/execution_service.rs` and `SessionDetail` in `src-tauri/src/session_service.rs`.

## Module Design

**Exports:**
- Export named functions from service and component modules, for example `export async function getCredentialStatus` in `src/app/services/credentialService.ts` and `export function TopToolbar` in `src/app/layout/TopToolbar.tsx`.
- Use a default export only for the application root in `src/App.tsx`.
- Keep shared domain types centralized in `src/app/state/types.ts` and import them into services and layout modules with `import type`.
- Register Rust modules centrally in `src-tauri/src/lib.rs`, then expose Tauri commands from each module through `tauri::generate_handler!`.

**Barrel Files:**
- Not used in the mapped frontend area. Imports target concrete files such as `src/app/layout/BottomPanel.tsx` and `src/app/services/assistantService.ts`.
- Rust also uses direct module references in `src-tauri/src/lib.rs` rather than re-export barrels.

---

*Convention analysis: 2026-04-02*
