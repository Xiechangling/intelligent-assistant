---
plan_id: "04"
phase: "03"
title: "Close the true assistant streaming gap"
wave: 4
depends_on:
  - "01"
  - "02"
  - "03"
files_modified:
  - "src/app/services/assistantService.ts"
  - "src/app/state/appShellStore.ts"
  - "src/app/state/types.ts"
  - "src-tauri/src/assistant_service.rs"
  - "src-tauri/src/lib.rs"
  - "src-tauri/Cargo.toml"
requirements_addressed:
  - "CHAT-02"
  - "CHAT-03"
autonomous: true
gap_closure: true
gaps_addressed:
  - "Assistant responses stream into the active session with visible in-progress state"
---

## Objective
Replace the current fake frontend chunking path with a real end-to-end streaming pipeline so assistant text reaches the active session incrementally from the Rust backend, persists safely while streaming, and remains compatible with the existing project-mode and conversation-mode transcript model.

## Gap Being Closed
Phase 3 verification found that the UI only simulates streaming after a fully completed backend response arrives. This plan closes that exact gap by introducing true backend incremental delivery, frontend event subscription and assembly, mid-stream transcript persistence, and verification that can distinguish real streaming from post-hoc pseudo-chunking.

## Must Haves
- Assistant text reaches the frontend as real incremental deltas before the turn is complete
- `assistantService.ts` no longer word-splits a completed message locally
- `appShellStore.ts` assembles one live assistant transcript event from backend deltas and preserves partial output if the turn fails
- Session persistence records in-progress transcript growth during streaming rather than only after completion
- Existing Phase 3 UX remains intact: project mode still shows stage/task-flow cues, conversation mode still shows standard chat streaming, and later approval/review compatibility is not broken

<tasks>
  <task id="04.1" type="auto">
    <objective>Define the real streaming contract and add proof-oriented verification seams before replacing the transport.</objective>
    <read_first>
- .planning/phases/03-conversational-coding-workflow/03-VERIFICATION.md
- .planning/phases/03-conversational-coding-workflow/01-SUMMARY.md
- .planning/phases/03-conversational-coding-workflow/02-SUMMARY.md
- .planning/phases/03-conversational-coding-workflow/03-SUMMARY.md
- src/app/services/assistantService.ts
- src/app/state/types.ts
- src-tauri/src/assistant_service.rs
- src-tauri/src/lib.rs
    </read_first>
    <action>Create an explicit streaming event contract shared across Rust and TypeScript so execution no longer depends on a single completed `AssistantTurnResponse`. Extend the assistant boundary to use a discriminated stream event shape with concrete event kinds such as `stage-status`, `assistant-start`, `assistant-delta`, `tool-summary`, `command-proposal`, `complete`, and `error`. Add a stable `turnId` so one request maps to one frontend subscription and cleanup path. Keep `start_assistant_turn` available only if needed for backward compatibility, but define a new primary path that is unmistakably stream-oriented and is the only path used by Phase 3 prompt submission after this plan. In the same task, add focused verification seams that can prove ordering: backend tests must assert that at least one delta event is emitted before complete, and frontend/service verification must assert that `streamChunks()`-style post-hoc splitting is removed entirely.</action>
    <verify>
      <automated>cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests:: -- --nocapture</automated>
      <automated>npm run build</automated>
    </verify>
    <acceptance_criteria>
- There is a concrete assistant stream event type shared by Rust and TypeScript instead of an implicit completed-payload contract only
- The plan of record for Phase 3 prompt submission names one streaming-first command/interface, not the current blocking one-shot path
- Verification scaffolding exists that can fail if `complete` arrives before any assistant delta
- `assistantService.ts` no longer contains the current local pseudo-streaming helper as the primary delivery mechanism
    </acceptance_criteria>
  </task>

  <task id="04.2" type="auto">
    <objective>Implement true backend incremental delivery from Rust to the Tauri frontend bridge.</objective>
    <read_first>
- src-tauri/src/assistant_service.rs
- src-tauri/src/lib.rs
- src/app/services/assistantService.ts
- .planning/phases/03-conversational-coding-workflow/03-VERIFICATION.md
- .planning/phases/03-conversational-coding-workflow/03-RESEARCH.md
    </read_first>
    <action>Replace the blocking one-shot backend turn path with a real streaming transport compatible with the current Tauri desktop architecture. Add a stream-start command in `src-tauri/src/assistant_service.rs` that validates input, creates a `turnId`, spawns the assistant request asynchronously, and emits per-turn events back to the frontend through Tauri events scoped by that `turnId`. Use Anthropic's streaming response mode rather than waiting for one completed JSON payload. Parse server-sent events incrementally and forward assistant text as soon as text deltas arrive. Emit deterministic stage-status events from the backend at milestones such as request accepted, contacting assistant, first token received, and finalizing, so project-mode task flow keeps visible progress without depending on fake frontend chunk timing. Preserve current compatibility by continuing to emit optional `tool-summary` and `command-proposal` events when the backend can derive them, but do not block assistant text streaming on those optional artifacts. If `Cargo.toml` needs async/stream features for `reqwest` or a runtime dependency for this path, add only the minimal features required for SSE consumption inside Tauri.</action>
    <verify>
      <automated>cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests::streams_deltas_before_completion -- --exact</automated>
      <automated>cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests::emits_stage_and_complete_events_in_order -- --exact</automated>
      <automated>npm run build</automated>
    </verify>
    <acceptance_criteria>
- Rust no longer waits for one fully completed assistant payload before anything can reach the UI
- At least one `assistant-delta` event is emitted before the backend emits `complete`
- Backend stage-status events are emitted from the real request lifecycle rather than from frontend timing simulation
- The frontend can subscribe to a single turn-specific event stream using the returned `turnId`
- Optional tool summary / command proposal compatibility is preserved without making assistant body streaming wait for them
    </acceptance_criteria>
  </task>

  <task id="04.3" type="auto">
    <objective>Switch the frontend to subscribe, assemble, and persist the live transcript during streaming.</objective>
    <read_first>
- src/app/services/assistantService.ts
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- src/app/services/sessionService.ts
- src/app/layout/CenterWorkspace.tsx
- .planning/phases/03-conversational-coding-workflow/03-VERIFICATION.md
- .planning/phases/03-conversational-coding-workflow/03-HUMAN-UAT.md
    </read_first>
    <action>Refactor `src/app/services/assistantService.ts` so `streamAssistantResponse()` starts a backend stream, subscribes to Tauri events for the returned `turnId`, forwards each event to existing handler callbacks, and always unregisters listeners on completion or error. Remove the current `streamChunks()` post-processing path entirely. In `src/app/state/appShellStore.ts`, keep the existing project/conversation submission flow but change transcript mutation to be event-driven: create the assistant transcript placeholder on `assistant-start` or first delta, append incoming text to the same assistant event as each `assistant-delta` arrives, apply stage-status and optional tool-summary / command-proposal events as they stream, and persist the session incrementally while the turn is in progress. Use a concrete persistence rule rather than "persist at the end only": persist immediately after user submit, after stage events, after assistant-start, then throttle assistant-delta persistence to a short interval such as 250-500ms plus a final flush on complete/error so app restarts do not lose the whole streamed answer. On failure, keep already streamed assistant text in the transcript, set session status/recent activity appropriately, and avoid discarding the partial assistant body. Preserve current visible in-progress state in `CenterWorkspace.tsx`; only adjust that UI if the store needs a more precise stage label or completion signal.</action>
    <verify>
      <automated>npm run build</automated>
      <automated>cargo test --manifest-path src-tauri/Cargo.toml assistant_service::tests::stream_contract_examples_round_trip -- --exact</automated>
      <automated>MISSING — create a lightweight automated verification harness (for example a Rust-backed mock stream plus a frontend service/store contract check) that fails if the first assistant transcript bytes appear only after backend completion</automated>
    </verify>
    <acceptance_criteria>
- `assistantService.ts` subscribes to backend stream events and no longer fabricates streaming by splitting a finished string
- `appShellStore.ts` assembles one live assistant transcript event from backend deltas in both project and conversation modes
- Session persistence updates during streaming, not just after completion, with a documented throttling rule
- Partial assistant text remains persisted if the stream errors after some deltas have already arrived
- Existing project-mode stage/task-flow rendering and conversation-mode mainstream chat rendering continue to work on the same transcript model
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Confirm `src/app/services/assistantService.ts` no longer awaits a full assistant message and no longer calls local word-splitting to fake streaming.
- Confirm `src-tauri/src/assistant_service.rs` uses a real streaming request path and emits turn-scoped events before the full response finishes.
- Confirm `src/app/state/appShellStore.ts` persists the transcript at submit time, during streaming, and on final flush/error.
- Confirm the new automated checks can fail on the old behavior where the first assistant chunk appears only after the backend response is complete.
- Re-run the specific Phase 3 truth from `03-VERIFICATION.md`: assistant responses stream into the active session with visible in-progress state.

## Notes for Execution
- Stay inside Phase 3 scope. Do not redesign approval, execution-log, review, or Phase 6 workflow surfaces.
- Preserve compatibility with current transcript event kinds and later-phase consumers; extend carefully rather than replacing unrelated Phase 4/5 behavior.
- Prefer the smallest realistic Tauri event-streaming architecture that proves true incremental delivery end to end.
