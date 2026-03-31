# Phase 3: Conversational Coding Workflow - Research

**Date:** 2026-03-30
**Status:** Complete (inline fallback)
**Phase:** 03-conversational-coding-workflow

## Research Objective

Determine what needs to be true for Phase 3 planning to deliver a desktop conversational coding workflow with differentiated project-mode and pure-conversation-mode interaction, streaming responses, and Claude Code-style project task presentation on top of the validated Phase 2 session foundation.

## Inputs Reviewed

- `.planning/phases/03-conversational-coding-workflow/03-CONTEXT.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md`
- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md`
- `.planning/phases/02-session-persistence-recovery/01-SUMMARY.md`
- `.planning/phases/02-session-persistence-recovery/02-SUMMARY.md`
- `.planning/phases/02-session-persistence-recovery/03-SUMMARY.md`
- `src/app/state/types.ts`
- `src/app/state/appShellStore.ts`
- `src/app/layout/CenterWorkspace.tsx`
- `src/app/layout/TopToolbar.tsx`
- `src/app/layout/RightPanel.tsx`
- `src/app/layout/LeftSidebar.tsx`
- `src/app/services/sessionService.ts`
- `src-tauri/src/session_service.rs`
- `src/App.tsx`
- `package.json`

## Current Codebase Findings

### Existing assets Phase 3 can build on
- The shell already distinguishes project mode and pure conversation mode at the top level, which makes separate input experiences feasible without changing the overall shell architecture.
- `appShellStore` already tracks active session, session history, recovery state, active shell view, project context, and model context in one place.
- Session persistence already stores transcript arrays, so Phase 3 can extend the transcript schema rather than inventing a separate message store.
- The center workspace is already the primary session-management surface, and is the natural place to host a real conversation timeline plus input surface.
- Toolbar and right panel already display project/session/model context, so project-aware conversation flows can reuse visible shell context instead of duplicating it in the timeline.

### Gaps Phase 3 must close
- There is no real message timeline UI yet — only session-history and placeholder workspace states.
- There is no prompt-composer/input component for either project mode or pure conversation mode.
- There is no streaming response loop or assistant in-progress rendering.
- `SessionMessage` only supports a minimal role/content shape and does not yet encode stage-status or tool-summary events.
- There is no assistant orchestration service yet for turning a prompt into streamed updates and persisted transcript changes.

## Implementation Implications

### 1. The message model should evolve, not restart
Phase 2 already persisted transcript data. Phase 3 should extend the session message schema to support richer event types while preserving the local-first transcript foundation. A likely direction is adding an event/message kind field alongside role/content so project-mode sessions can mix assistant body messages, stage updates, and tool summaries in one ordered timeline.

### 2. Project-mode and pure-conversation-mode need different composer components
The user explicitly chose different input experiences. Planning should therefore avoid one shared generic composer and instead create two mode-specific composer surfaces that still plug into the same session lifecycle and persistence flow.

### 3. Streaming state should stay shell-aware but conversation-local in rendering
The store already owns high-level session context. Phase 3 likely needs a split where shell/global session state remains in Zustand while in-progress streaming chunks and composer-specific UI behavior are handled in conversation-focused state/hooks close to the center workspace.

### 4. Project-mode needs structured agent workflow cues without becoming Phase 4 early
The user wants Claude Code CLI / agent workflow inspiration. That suggests Phase 3 should surface staged progress and tool/action summaries in the conversation timeline, but stop short of approval gates, raw execution logs, or full command-review UX. Planning must preserve that boundary.

### 5. Pure conversation mode should remain lightweight and mainstream
Pure conversation mode should feel like a normal chat app. Planning should keep it simpler than project mode: standard message stack, standard chat composer, standard streaming assistant output, but still reuse the same core assistant/session infrastructure underneath.

### 6. The first assistant integration should be transcript-first
To satisfy CHAT-01/02/03 cleanly, the first implementation should likely focus on: submit prompt → append user message → create assistant placeholder/in-progress events → stream updates into transcript → persist final transcript and session recent activity. This creates a stable base before later execution and review phases add more complex artifacts.

## Recommended Planning Decomposition

### Slice A — Conversation domain model and assistant orchestration contract
Define richer transcript/event types, an app-side assistant service contract, and the state/actions needed to submit prompts and stream assistant output into the active session safely.

### Slice B — Project-mode conversational workflow UI
Build the project conversation timeline, coding command bar, stage segments, and task summary blocks that make project mode feel like an agent workflow.

### Slice C — Pure conversation mode UI and shared session integration
Build the standard chat timeline/composer for pure conversation mode while reusing the same session/message infrastructure and preserving model/session context.

## Risks and Planning Watchouts

### Risk: overbuilding execution workflow too early
Phase 3 should not accidentally implement Phase 4 approval and execution visibility features. Stage messages and tool summaries should remain lightweight and conversation-scoped.

### Risk: duplicating state between shell store and conversation components
The app already centralizes shell/session context. Planning should clearly separate shell state from conversation rendering state to avoid conflicting sources of truth.

### Risk: transcript schema too narrow for project-mode task flow
If Phase 3 keeps only role/content strings, the project-mode workflow requirements will become awkward. Planning should extend the schema enough to support the decided four visible message/event types.

### Risk: transcript schema overfits future phases
At the same time, Phase 3 should avoid building a huge generalized event system for all future execution/review phases. The schema should only cover what this phase visibly needs.

### Risk: mode differentiation becomes only cosmetic
The user explicitly wants different interaction models. Planning should make project-mode vs pure-conversation-mode differences real in composer behavior and message presentation, not just labels.

## Recommended Mainstream Product Baseline

- Project mode: coding command bar + conversation timeline + stage-progress segments + compact task summary blocks.
- Pure conversation mode: mainstream chat composer + mainstream streaming transcript.
- Shared base: one session transcript model, one assistant service/orchestration layer, one persistence pipeline, one active session context.

## Validation Architecture

### Goal-backward checks
A valid Phase 3 plan must collectively prove that the product can:
1. Accept a prompt from the desktop UI in both project mode and pure conversation mode.
2. Stream assistant responses into the active session with visible in-progress state.
3. Represent Claude Code-style project tasks in the conversation UI without requiring Phase 4 approval/review features.
4. Persist transcript and recent activity updates into the existing session model.
5. Keep project/model/session context synchronized while the user converses.

### Required evidence for later execution/verification
- Source code for a richer session message/event schema and transcript persistence path
- Source code for prompt submission and assistant streaming orchestration
- Center workspace rendering for both project-mode and pure-conversation-mode conversation flows
- Visible stage-status and tool-summary events in project mode
- Standard streaming assistant messages in pure conversation mode
- Persistence updates that keep session history and recent activity coherent after conversations

## Planning Recommendations

1. Extend `SessionMessage` into a richer event model before building the UI timelines.
2. Keep the assistant integration behind a clear service boundary rather than embedding streaming logic directly inside layout components.
3. Plan project-mode and pure-conversation-mode UIs as separate surfaces on top of shared transcript infrastructure.
4. Reuse existing toolbar/right-panel context visibility rather than duplicating context headers inside every conversation message.
5. Preserve the Phase 4 boundary: no approval workflow, no full execution-log viewer, no diff review surface in this phase.

## Research Conclusion

Phase 3 should be planned as a transcript-and-orchestration phase plus two differentiated conversation experiences: a project-mode agent workflow and a pure-conversation chat flow. The key success factor is creating one shared conversation foundation that can support both experiences while preserving the existing session persistence and shell-state architecture.
