---
phase: 03-conversational-coding-workflow
plan: 04
subsystem: true-assistant-streaming
summary_type: execution
status: completed_with_environment_notes
completed_at: 2026-04-08
files_modified:
  - E:\work\ai\agent\src\app\services\assistantService.ts
  - E:\work\ai\agent\src\app\state\appShellStore.ts
  - E:\work\ai\agent\src\app\state\types.ts
  - E:\work\ai\agent\src-tauri\src\assistant_service.rs
  - E:\work\ai\agent\src-tauri\src\lib.rs
  - E:\work\ai\agent\src-tauri\Cargo.toml
verification:
  commands:
    - command: cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests:: -- --nocapture
      result: passed
    - command: npm run build
      result: passed
environment_limits:
  - GSD init helper path under $HOME was unavailable in this environment, so execution used the provided plan files directly instead of gsd-tools init output.
  - No live desktop runtime / human UAT was run in this pass, so verification is limited to code inspection plus automated Rust/frontend build checks.
---

# Phase 3 Plan 04: Close the true assistant streaming gap Summary

Implemented a real end-to-end assistant streaming path so Phase 3 no longer fakes streaming by word-splitting a completed backend response.

## What Changed

### 1. Replaced pseudo-streaming with a real stream contract
- Added `AssistantStreamEventKind`, `AssistantStreamEvent`, and `AssistantStreamStartResponse` to `E:\work\ai\agent\src\app\state\types.ts`.
- The stream contract is now explicit and turn-scoped with `turnId` and concrete event kinds:
  - `stage-status`
  - `assistant-start`
  - `assistant-delta`
  - `tool-summary`
  - `command-proposal`
  - `complete`
  - `error`
- This closes the old implicit contract where the frontend only received a fully completed `AssistantTurnResponse`.

### 2. Added true backend incremental delivery in Rust
- Reworked `E:\work\ai\agent\src-tauri\src\assistant_service.rs` to add a new streaming-first command: `start_assistant_turn_stream`.
- The backend now:
  - validates input
  - creates a stable `turnId`
  - starts an async request using streaming mode against the Anthropic messages endpoint
  - parses SSE incrementally
  - emits per-turn Tauri events on `assistant-turn-event`
- Assistant body text is forwarded as `assistant-delta` events as soon as text deltas arrive, instead of waiting for the full response body.
- Backend stage events now come from real lifecycle milestones:
  - Request accepted
  - Contacting assistant
  - First token received
  - Finalizing
- Added focused Rust tests proving ordering and contract shape:
  - delta before complete
  - stage ordering through completion
  - event JSON round-trip contract
  - SSE parser split-message handling

### 3. Switched the frontend assistant service to event subscription
- Refactored `E:\work\ai\agent\src\app\services\assistantService.ts` so `streamAssistantResponse()` now:
  - invokes `start_assistant_turn_stream`
  - subscribes to Tauri events
  - filters by `turnId`
  - forwards each backend event to handlers
  - unregisters the listener on completion/error
- Removed the old `streamChunks()` fake streaming behavior entirely.
- Kept a legacy mock replay path for test/mocked browser environments, but it is no longer the real app delivery mechanism.

### 4. Changed the store to assemble and persist one live transcript entry
- Updated `E:\work\ai\agent\src\app\state\appShellStore.ts` so the transcript is now assembled from backend stream events rather than post-hoc local chunking.
- The store now:
  - persists immediately after user submit
  - appends `stage-status` events as they arrive
  - creates the assistant transcript event on `assistant-start` or first delta
  - appends all `assistant-delta` text into that same assistant event
  - preserves partial assistant text if the stream fails
- Added throttled mid-stream persistence via `createStreamingSessionPersister()` with a 350ms rule plus forced flushes for stage/tool/proposal/complete transitions.
- This directly closes the verification gap that previously showed visible in-progress UI without true backend streaming.

## Verification Results

### Passed
- `cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests:: -- --nocapture`
  - 4 assistant streaming tests passed
- `npm run build`
  - TypeScript compile passed
  - Vite production build passed

### Verified Against the Plan Gap
- `assistantService.ts` no longer word-splits a completed response to simulate streaming.
- Rust now emits turn-scoped stream events before completion.
- The store persists submit-time transcript state, mid-stream updates, and final/failed state.
- Partial streamed assistant content is retained in the session if the turn fails after deltas arrive.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Tauri async spawn required a Send-compatible streaming sink**
- **Found during:** Rust test/build verification
- **Issue:** `tauri::async_runtime::spawn` rejected the async task because the stream sink trait object was not `Send`.
- **Fix:** Added `Send` bound to the sink trait and made the streaming function generic over the sink type.
- **Files modified:** `E:\work\ai\agent\src-tauri\src\assistant_service.rs`

**2. [Rule 3 - Blocking issue] TypeScript listener cleanup path failed to type-check**
- **Found during:** `npm run build`
- **Issue:** Tauri unlisten cleanup narrowed incorrectly and TypeScript treated the call target as non-callable.
- **Fix:** Switched cleanup to an explicit function-type cast and guarded invocation with `typeof cleanup === 'function'`.
- **Files modified:** `E:\work\ai\agent\src\app\services\assistantService.ts`

## Known Stubs

None found in the changed files that block this plan's goal.

## Threat Flags

None identified beyond the intended assistant streaming surface already within this plan's scope.

## Environment Notes

- The requested GSD init helper command could not run because the expected `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` path was unavailable in this environment.
- I did not run a live desktop Tauri session or human verification flow in this pass, so verification is automated/build-based rather than runtime visual proof.
- Per user instruction, no git commit was created.
