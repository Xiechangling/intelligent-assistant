# Codebase Concerns

**Analysis Date:** 2026-04-02

## Tech Debt

**Monolithic client state store:**
- Issue: `zustand` state, async workflows, transcript mutation, approval flow, execution flow, recovery flow, attachment flow, and preset logic all live in one file.
- Files: `src/app/state/appShellStore.ts`
- Impact: Small workflow changes can break unrelated UI state, approval handling, session recovery, or transcript updates. The file is already large enough to discourage safe refactoring.
- Fix approach: Split `src/app/state/appShellStore.ts` into focused slices or service-backed actions for session lifecycle, assistant streaming, execution/review, and UI shell state.

**Large view component owns too many responsibilities:**
- Issue: Rendering of transcript rows, composer, attachment chips, approval card, review summary, empty states, history list, and multiple mode-specific shells all live in one component tree.
- Files: `src/app/layout/CenterWorkspace.tsx`
- Impact: UI changes require editing a large file with intertwined conditional rendering, which increases regression risk for project mode, conversation mode, and session history screens.
- Fix approach: Extract `Transcript`, `Composer`, session-history surface, approval/review surfaces, and mode-specific shells into separate files under `src/app/layout/`.

**Single stylesheet concentrates nearly all shell styling:**
- Issue: Most application layout and component styles are centralized in one long CSS file.
- Files: `src/styles/app-shell.css`
- Impact: Style updates have broad blast radius, selector collisions are harder to reason about, and component-level styling is difficult to evolve safely.
- Fix approach: Split `src/styles/app-shell.css` by surface or component area such as toolbar, sidebar, workspace, right panel, and bottom panel.

**Backend services are file-based and tightly coupled to storage format:**
- Issue: Session metadata, transcripts, recovery snapshots, recent projects, and assistant settings are written directly as JSON files with no repository abstraction, locking, migration layer, or indexing.
- Files: `src-tauri/src/session_service.rs`, `src-tauri/src/project_service.rs`, `src-tauri/src/credential_service.rs`
- Impact: Future schema changes, corruption handling, and concurrent access become harder to implement. Recovery behavior depends directly on ad hoc file shapes.
- Fix approach: Introduce storage modules with versioned records and centralized read/write validation before adding more persisted features.

## Known Bugs

**Attachments are collected in the UI but not sent to the assistant provider:**
- Symptoms: Users can add files or images and see them in the conversation UI, but the backend request body only includes prompt text and input segments.
- Files: `src/app/services/attachmentService.ts`, `src/app/state/appShellStore.ts`, `src-tauri/src/assistant_service.rs`
- Trigger: Add attachments in the composer and submit a prompt.
- Workaround: Reference attachment contents manually in the text prompt; attached files are not actually processed by `start_assistant_turn`.

**Streaming is simulated after the full response returns:**
- Symptoms: The UI appears to stream assistant output word by word, but only after the entire backend request has completed.
- Files: `src/app/services/assistantService.ts`, `src-tauri/src/assistant_service.rs`
- Trigger: Submit any prompt and observe that `streamAssistantResponse` waits for a full `start_assistant_turn` result, then splits `assistantMessage` with `streamChunks`.
- Workaround: None in-app. Users must wait for the full network round trip before any visible response begins.

**Review diff is missing for newly created files:**
- Symptoms: Changed-file review can show `No diff available for ...` for files that were newly added.
- Files: `src-tauri/src/execution_service.rs`, `src/app/layout/BottomPanel.tsx`
- Trigger: Approve a command that creates an untracked file, then open the Review tab.
- Workaround: Inspect the file directly in the project; `git diff HEAD -- <path>` does not produce useful output for untracked files in the current implementation.

**Conversation recovery can retain stale project selection:**
- Symptoms: Restoring a pure conversation session does not clear the previously selected project path.
- Files: `src/app/state/appShellStore.ts`
- Trigger: Open a project session, switch context, then restore a conversation session through `resumeSession` or `attemptRecovery`.
- Workaround: Manually reselect the intended project before starting a project-mode task.

## Security Considerations

**API key can be exfiltrated through arbitrary relay URL configuration:**
- Risk: Any user-provided `apiBaseUrl` beginning with `http://` or `https://` is accepted, and the app sends the Anthropic API key to that URL in the `x-api-key` header.
- Files: `src/app/layout/RightPanel.tsx`, `src/app/services/credentialService.ts`, `src-tauri/src/credential_service.rs`, `src-tauri/src/assistant_service.rs`
- Current mitigation: `normalize_api_base_url` in `src-tauri/src/credential_service.rs` only checks scheme and trims trailing slash.
- Recommendations: Restrict allowed hosts, require explicit relay opt-in, store relay metadata separately from the key, and show a strong warning before sending credentials to non-Anthropic endpoints.

**Approved commands still run through a shell interpreter:**
- Risk: The app requires approval, but once approved it executes the raw command string via `cmd /C` on Windows or `sh -lc` elsewhere.
- Files: `src-tauri/src/execution_service.rs`, `src/app/layout/BottomPanel.tsx`, `src/app/state/appShellStore.ts`
- Current mitigation: `validate_working_directory` ensures `working_directory` stays inside `project_path`, and approval is explicit.
- Recommendations: Add command allow/deny policies, preview parsed arguments, capture executed command provenance, and consider safer execution for common git/file operations.

**Sensitive local paths are persisted in plain JSON session data:**
- Risk: Session transcript events and recovery snapshots persist project paths, working directories, command proposals, and attachment paths under local app data.
- Files: `src-tauri/src/session_service.rs`, `src-tauri/src/execution_service.rs`, `src/app/state/types.ts`
- Current mitigation: Data is stored in the local app data directory rather than in the repo.
- Recommendations: Minimize persisted path data, redact attachment paths when possible, and document where these files live for user inspection and cleanup.

## Performance Bottlenecks

**Synchronous blocking network request on the Tauri command path:**
- Problem: Assistant generation uses `reqwest::blocking::Client` with a 60-second timeout inside a Tauri command.
- Files: `src-tauri/src/assistant_service.rs`
- Cause: `start_assistant_turn` performs a blocking HTTP request and JSON decode before returning anything to the frontend.
- Improvement path: Move to async requests or event-driven streaming so the app can surface partial progress and reduce perceived stalls.

**Word-by-word UI updates can cause excessive rerenders for long responses:**
- Problem: The frontend splits the full assistant response into whitespace tokens and updates transcript state for each token.
- Files: `src/app/services/assistantService.ts`, `src/app/state/appShellStore.ts`
- Cause: `streamChunks` loops over all words and `onAssistantChunk` rewrites transcript state on every iteration.
- Improvement path: Batch chunks by sentence or timed intervals, or stream incremental deltas from the backend instead of replaying a completed response.

**Session history scans every session file on each load:**
- Problem: Listing session history reads all metadata JSON files and sorts them in memory every time.
- Files: `src-tauri/src/session_service.rs`, `src/app/state/appShellStore.ts`
- Cause: `list_sessions` iterates through `metadata_dir()` with `fs::read_dir`, deserializes every file, then sorts by `last_activity_at`.
- Improvement path: Maintain an index file, paginate results, or cache summaries for recent sessions.

## Fragile Areas

**Approval, execution, and transcript state are tightly interwoven:**
- Files: `src/app/state/appShellStore.ts`, `src/app/services/assistantService.ts`, `src-tauri/src/execution_service.rs`
- Why fragile: The same store mutation path controls pending proposals, execution status, output lines, changed-file review, and session transcript persistence. A change in one stage can desynchronize UI status and persisted session state.
- Safe modification: Change one workflow segment at a time and verify project-mode prompt submission, approval, rejection, execution success, execution failure, and review rendering.
- Test coverage: No project test files were detected under `src/` or `src-tauri/`, and `package.json` has no app-level test script.

**Recovery and session restoration logic duplicates behavior:**
- Files: `src/app/state/appShellStore.ts`, `src-tauri/src/session_service.rs`
- Why fragile: `resumeSession` and `attemptRecovery` perform nearly the same rehydration flow with slightly different state resets. Divergence between the two paths can create inconsistent restored state.
- Safe modification: Consolidate both restore paths behind one shared client-side helper and verify both manual resume and automatic recovery flows.
- Test coverage: No automated recovery tests were detected.

**Review surface depends on git command behavior and string parsing:**
- Files: `src-tauri/src/execution_service.rs`, `src/app/layout/BottomPanel.tsx`, `src/app/layout/CenterWorkspace.tsx`
- Why fragile: Review generation parses `git status --short` output manually and assumes `git diff HEAD -- <path>` is enough for all file states.
- Safe modification: Handle tracked, untracked, renamed, and deleted files explicitly before changing review UI expectations.
- Test coverage: No automated tests were detected for execution review behavior.

## Scaling Limits

**Local JSON session storage:**
- Current capacity: Suitable for a small single-user local session history with modest transcript volume.
- Limit: Performance and manageability degrade as `src-tauri/src/session_service.rs` accumulates many metadata and transcript JSON files because listing and restore are full-file operations.
- Scaling path: Add indexed metadata, transcript chunking, archival, or a lightweight embedded database before increasing retention depth.

**Single-store frontend architecture:**
- Current capacity: Works for the current MVP shell and one active session.
- Limit: Additional workflow types, more panes, or richer execution/review states will keep expanding `src/app/state/appShellStore.ts` and increase accidental coupling.
- Scaling path: Introduce bounded state slices and feature-level modules before adding more assistant workflow complexity.

## Dependencies at Risk

**No dedicated test tooling installed for app code:**
- Risk: The repo currently has no app-level test script in `package.json` and no detected project test files under `src/` or `src-tauri/`.
- Impact: Regressions in session restore, command approval, credential handling, and review generation can ship unnoticed.
- Migration plan: Add a frontend/unit runner such as Vitest for `src/` and Rust tests for `src-tauri/src/` before expanding behavior further.

## Missing Critical Features

**No automated test coverage for core workflows:**
- Problem: Core user promises—session recovery, credential persistence, safe command approval, execution output, and changed-file review—are implemented without automated verification.
- Blocks: Safe refactoring of `src/app/state/appShellStore.ts`, `src-tauri/src/assistant_service.rs`, `src-tauri/src/execution_service.rs`, and `src-tauri/src/session_service.rs`.

**No explicit validation of attachment existence or size before use:**
- Problem: Attachments are accepted from the picker and marked `ready` without checking file existence, size, readability, or upload support.
- Blocks: Reliable file-aware assistant workflows and trustworthy attachment UX.

## Test Coverage Gaps

**Assistant request/response path:**
- What's not tested: Input validation, model mapping, JSON parsing, relay URL behavior, and error propagation.
- Files: `src-tauri/src/assistant_service.rs`, `src/app/services/assistantService.ts`
- Risk: Provider response changes or malformed JSON can break the entire assistant workflow unnoticed.
- Priority: High

**Command execution and review collection:**
- What's not tested: Working-directory validation, shell execution result mapping, git review collection, and untracked-file review behavior.
- Files: `src-tauri/src/execution_service.rs`, `src/app/layout/BottomPanel.tsx`
- Risk: Unsafe execution edge cases or misleading review output can reach users without detection.
- Priority: High

**Session persistence and recovery:**
- What's not tested: Create/list/load/update flows, recovery snapshot restore, sorting/filtering behavior, and conversation/project restore transitions.
- Files: `src-tauri/src/session_service.rs`, `src/app/state/appShellStore.ts`
- Risk: Users can lose continuity or see inconsistent restored state after restart.
- Priority: High

---

*Concerns audit: 2026-04-02*
