# Testing Patterns

**Analysis Date:** 2026-04-02

## Test Framework

**Runner:**
- Not detected in the application repository.
- Config: Not detected. `jest.config.*`, `vitest.config.*`, and `playwright.config.*` are absent from `E:/work/ai/agent`.

**Assertion Library:**
- Not detected.

**Run Commands:**
```bash
Not available in E:/work/ai/agent/package.json   # Run all tests
Not available in E:/work/ai/agent/package.json   # Watch mode
Not available in E:/work/ai/agent/package.json   # Coverage
```

## Test File Organization

**Location:**
- No application test files are present under `E:/work/ai/agent/src` or `E:/work/ai/agent/src-tauri/src`.
- No `*.test.*` or `*.spec.*` files are detected in the mapped project.
- Current verification appears manual and workflow-driven rather than automated, based on the absence of test files and the minimal npm scripts in `E:/work/ai/agent/package.json`.

**Naming:**
- Not established. Add new automated tests with an explicit naming convention before growing the suite.

**Structure:**
```
No test directory or co-located test pattern is established in E:/work/ai/agent.
```

## Test Structure

**Suite Organization:**
```typescript
// No in-repo test suite pattern is available to copy.
// The closest reusable structure is the state/action orchestration style in:
// `E:/work/ai/agent/src/app/state/appShellStore.ts`
// and the thin service wrapper style in:
// `E:/work/ai/agent/src/app/services/*.ts`
```

**Patterns:**
- Setup pattern: Not established by test files.
- Teardown pattern: Not established by test files.
- Assertion pattern: Not established by test files.
- The codebase shape suggests three natural future unit boundaries:
  - Pure formatting helpers such as `formatRelativeTime` and `formatStatusLabel` in `src/app/layout/TopToolbar.tsx`, `src/app/layout/LeftSidebar.tsx`, and `src/app/layout/CenterWorkspace.tsx`.
  - State transition helpers such as `getErrorMessage`, `parseInputSegments`, and `buildExecutionRecord` in `src/app/state/appShellStore.ts`.
  - Rust helper functions such as `normalize_api_base_url`, `validate_working_directory`, `summarize_status`, and `strip_code_fences` in `src-tauri/src/credential_service.rs`, `src-tauri/src/execution_service.rs`, and `src-tauri/src/assistant_service.rs`.

## Mocking

**Framework:** Not detected

**Patterns:**
```typescript
// No formal mocking pattern exists yet.
// New frontend tests will need to mock Tauri boundaries such as:
// `@tauri-apps/api/core` used in `E:/work/ai/agent/src/app/services/assistantService.ts`
// `@tauri-apps/api/core` used in `E:/work/ai/agent/src/app/services/sessionService.ts`
// `@tauri-apps/plugin-dialog` used in `E:/work/ai/agent/src/app/services/projectService.ts`
// `@tauri-apps/plugin-dialog` used in `E:/work/ai/agent/src/app/services/attachmentService.ts`
```

**What to Mock:**
- Mock `invoke` calls from `@tauri-apps/api/core` when testing frontend services in `src/app/services/assistantService.ts`, `src/app/services/sessionService.ts`, and `src/app/services/credentialService.ts`.
- Mock `open` from `@tauri-apps/plugin-dialog` when testing file and project selection flows in `src/app/services/projectService.ts` and `src/app/services/attachmentService.ts`.
- Mock store actions around command execution when testing UI shells such as `src/app/layout/CenterWorkspace.tsx` and `src/app/layout/RightPanel.tsx`.
- In Rust, isolate command helpers that touch filesystem, keyring, HTTP, and subprocess boundaries in `src-tauri/src/credential_service.rs`, `src-tauri/src/session_service.rs`, `src-tauri/src/assistant_service.rs`, and `src-tauri/src/execution_service.rs`.

**What NOT to Mock:**
- Do not mock pure transformation helpers like `parseInputSegments` in `src/app/state/appShellStore.ts`, path normalization in `src-tauri/src/project_service.rs`, or status summarization in `src-tauri/src/execution_service.rs`.
- Do not mock static type contracts from `src/app/state/types.ts`; use realistic payload objects that match these interfaces instead.

## Fixtures and Factories

**Test Data:**
```typescript
// No shared fixture directory exists.
// Reuse the repo's current payload shape when adding fixtures, for example:
// - `CommandProposal` from `E:/work/ai/agent/src/app/state/types.ts`
// - `SessionDetail` from `E:/work/ai/agent/src/app/state/types.ts`
// - `ExecuteCommandResponse` from `E:/work/ai/agent/src/app/services/assistantService.ts`
// - `SessionRecoverySnapshot` from `E:/work/ai/agent/src/app/state/types.ts`
```

**Location:**
- Not established. No `fixtures`, `factories`, or test utility modules are present in `E:/work/ai/agent/src` or `E:/work/ai/agent/src-tauri/src`.

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
Not available; no coverage command or config is defined in E:/work/ai/agent/package.json.
```

## Test Types

**Unit Tests:**
- Not currently used in the repository.
- The most testable frontend seams are the service wrappers in `src/app/services/*.ts` and the helper logic embedded in `src/app/state/appShellStore.ts`.
- The most testable backend seams are helper functions in `src-tauri/src/assistant_service.rs`, `src-tauri/src/credential_service.rs`, `src-tauri/src/project_service.rs`, and `src-tauri/src/execution_service.rs`.

**Integration Tests:**
- Not currently used in the repository.
- Future integration coverage should focus on Tauri command boundaries wired in `src-tauri/src/lib.rs`, because that file composes `start_assistant_turn`, `execute_approved_command`, `select_project_directory`, credential commands, and session persistence commands into a single app surface.

**E2E Tests:**
- Not used.
- No Playwright, Cypress, or Tauri E2E configuration is present in `E:/work/ai/agent`.

## Common Patterns

**Async Testing:**
```typescript
// No existing async test pattern is present.
// New tests should mirror the async service API shape used in:
// `E:/work/ai/agent/src/app/services/assistantService.ts`
// `E:/work/ai/agent/src/app/services/sessionService.ts`
// `E:/work/ai/agent/src/app/services/credentialService.ts`
// and assert resolved payloads plus error propagation from `invoke(...)`.
```

**Error Testing:**
```typescript
// No existing error test pattern is present.
// Prioritize failure cases already encoded in the app:
// - empty prompt short-circuit in `E:/work/ai/agent/src/app/state/appShellStore.ts`
// - invalid URL rejection in `E:/work/ai/agent/src-tauri/src/credential_service.rs`
// - invalid project/working directory rejection in `E:/work/ai/agent/src-tauri/src/execution_service.rs`
// - unsupported mode and missing project path rejection in `E:/work/ai/agent/src-tauri/src/assistant_service.rs`
```

---

*Testing analysis: 2026-04-02*
