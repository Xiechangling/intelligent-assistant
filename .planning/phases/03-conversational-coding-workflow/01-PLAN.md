---
plan_id: "01"
phase: "03"
title: "Define conversation event model and assistant orchestration state"
wave: 1
depends_on: []
files_modified:
  - "src/app/state/types.ts"
  - "src/app/state/appShellStore.ts"
  - "src/app/services/sessionService.ts"
  - "src/app/services/assistantService.ts"
requirements_addressed:
  - "CHAT-01"
  - "CHAT-02"
  - "CHAT-03"
autonomous: true
---

## Objective
Establish the shared conversation foundation for both project mode and pure conversation mode by extending the transcript/event model, adding prompt submission and streaming orchestration state, and wiring transcript persistence back into the existing session system.

## Must Haves
- Transcript model supports the approved visible event types for project-mode workflows
- Shell store can submit prompts, track in-progress assistant work, and persist transcript/recent-activity updates
- Assistant orchestration stays behind a service boundary rather than living inside layout components

<tasks>
  <task id="01.1">
    <objective>Extend the transcript domain model for real conversation and project-task events.</objective>
    <read_first>
- src/app/state/types.ts
- src/app/state/appShellStore.ts
- src/app/services/sessionService.ts
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
- .planning/phases/03-conversational-coding-workflow/03-RESEARCH.md
    </read_first>
    <action>Update src/app/state/types.ts so the transcript model supports the four approved visible event kinds in project mode: user message, assistant body message, stage-status event, and tool/action summary event. Keep the existing session record and session detail structures, but replace the current minimal SessionMessage shape with a concrete event schema that includes stable id, event kind, display role when relevant, text/body content, created timestamp, and optional structured metadata for stage label and tool-summary details. Keep pure conversation mode compatible by allowing user and assistant body events to render as standard chat messages. Do not add approval, diff, or full execution-log types in this phase. Align any related store/service typings in src/app/state/appShellStore.ts and src/app/services/sessionService.ts with the new event model.</action>
    <acceptance_criteria>
- src/app/state/types.ts contains an event/message type that distinguishes user, assistant-body, stage-status, and tool-summary transcript entries
- transcript event type contains stable id, created timestamp, and content/body fields needed for rendering
- transcript event type contains structured fields for stage-status and tool-summary rendering without relying on string parsing
- src/app/services/sessionService.ts type signatures accept the updated transcript/event array
- no transcript/event type introduces approval-review or diff-review event kinds
    </acceptance_criteria>
  </task>

  <task id="01.2">
    <objective>Create an assistant orchestration service contract for prompt submission and streaming.</objective>
    <read_first>
- src/app/services/sessionService.ts
- src/app/state/types.ts
- src/app/state/appShellStore.ts
- package.json
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
    </read_first>
    <action>Create src/app/services/assistantService.ts as the Phase 3 orchestration boundary for conversational work. Define concrete operations and types for submitting a prompt to the current session, creating stage-status updates, streaming assistant body chunks, appending tool-summary events, and finalizing the assistant response into a transcript event list that can be persisted through sessionService. The service may use a mocked or local-first simulation path for now, but its contract must clearly support streaming callbacks or async iteration rather than one-shot full-response replacement. Keep the API focused on Phase 3 conversation requirements only.</action>
    <acceptance_criteria>
- src/app/services/assistantService.ts exists
- assistantService exposes a prompt submission entry point for the active session
- assistantService exposes a streaming-oriented API shape such as async iterator, callback hooks, or chunk handlers
- assistantService supports stage-status and tool-summary event emission in addition to assistant body output
- assistantService does not embed approval-gate or execution-log responsibilities from later phases
    </acceptance_criteria>
  </task>

  <task id="01.3">
    <objective>Wire conversation submission and streaming state into the shell store.</objective>
    <read_first>
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- src/app/services/sessionService.ts
- src/app/services/assistantService.ts
- .planning/phases/02-session-persistence-recovery/02-SUMMARY.md
- .planning/phases/03-conversational-coding-workflow/03-VALIDATION.md
    </read_first>
    <action>Extend src/app/state/appShellStore.ts so it can manage active conversation state for the current session. Add explicit state for current transcript events, draft prompt values where appropriate, assistant in-progress state, streaming/error status, and actions to submit a prompt, append streaming updates, finalize the assistant response, and persist transcript plus recent-activity summary through sessionService. Reuse the existing activeSession and recovery foundations instead of creating a separate root store. Ensure submission updates session recent activity and keeps project/model/session context synchronized while a response is streaming.</action>
    <acceptance_criteria>
- src/app/state/appShellStore.ts contains explicit assistant in-progress and streaming/error state
- src/app/state/appShellStore.ts contains an action that submits a prompt for the active session
- prompt submission path appends a user transcript event before assistant output begins
- assistant streaming path can append stage-status, tool-summary, and assistant-body transcript events
- transcript finalization path updates persisted session transcript and recent activity through sessionService
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read src/app/state/types.ts and confirm the transcript model supports the four approved event kinds with structured metadata
- Read src/app/services/assistantService.ts and confirm prompt submission plus streaming-oriented assistant output is defined behind a service boundary
- Read src/app/state/appShellStore.ts and confirm prompt submission, streaming, transcript persistence, and recent-activity updates are explicit store responsibilities
- Confirm no new type or service crosses into approval, execution-log, or diff-review scope
