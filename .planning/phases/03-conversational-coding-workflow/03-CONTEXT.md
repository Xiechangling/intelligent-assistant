# Phase 3: Conversational Coding Workflow - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the core desktop interaction loop for natural-language coding assistance with streaming responses in the chosen project context. This phase adds prompt submission, streaming assistant output, and project-aware coding-task interaction inside the active session. It does not yet add approval gating, execution output review, or diff review surfaces.

</domain>

<decisions>
## Implementation Decisions

### Input Surfaces
- **D-01:** Project mode and pure conversation mode must use different input experiences.
- **D-02:** Project mode uses a coding command bar rather than a standard chat textbox.
- **D-03:** The project-mode input should feel closer to Claude Code CLI / agent workflows, emphasizing tasking the assistant against the active project.
- **D-04:** Pure conversation mode uses a standard mainstream chat input.
- **D-05:** The visual and behavioral distinction between project-mode input and pure-conversation input should remain obvious to the user.

### Response Presentation
- **D-06:** Both project mode and pure conversation mode use streaming responses.
- **D-07:** Project-mode responses use a task-flow presentation rather than plain chat-only rendering.
- **D-08:** Pure conversation mode uses a standard chat-style streaming presentation.
- **D-09:** Project-mode task flow should show stage-oriented progress segments, inspired by Claude Code CLI and similar agent workflows.
- **D-10:** Project-mode stage flow should be understandable at a glance, such as understanding request → analyzing project → acting/generating result → done.

### Message Structure
- **D-11:** Project sessions must support at least four visible message/event types: user messages, assistant body messages, stage-status messages, and tool/action summary messages.
- **D-12:** Stage-status messages should communicate workflow progress, not just generic loading.
- **D-13:** Tool/action summary messages should provide lightweight visibility into what the assistant did without turning the UI into a full execution log viewer.

### Coding Task Presentation
- **D-14:** In project mode, Claude Code-style coding tasks should be represented directly in the conversation experience, not reduced to plain Q&A.
- **D-15:** Task results should be conversation-first, with compact task summary blocks embedded alongside the main assistant response.
- **D-16:** Task summary blocks are supporting context; the primary reading flow remains the assistant conversation.

### Claude's Discretion
- Exact wording for stage labels and helper copy.
- Exact visual composition of task summary blocks, as long as they remain secondary to the main conversation flow.
- Exact send shortcuts and small interaction affordances, unless later discussion changes them.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — product vision, MVP scope, hybrid desktop + CLI/API direction, and validated Phase 2 progress
- `.planning/REQUIREMENTS.md` — Phase 3 requirements CHAT-01, CHAT-02, CHAT-03 and overall MVP traceability
- `.planning/ROADMAP.md` — Phase 3 goal, scope boundary, and success criteria
- `.planning/STATE.md` — current project status and active phase focus

### Prior phase decisions and implemented foundations
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md` — shell layout, mode structure, toolbar placement, and center-chat-first shell decisions
- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md` — session UX baseline, direct resume, restored project/model context, and mainstream session patterns
- `.planning/phases/02-session-persistence-recovery/01-SUMMARY.md` — session persistence contracts and local recovery snapshot support
- `.planning/phases/02-session-persistence-recovery/02-SUMMARY.md` — shell-store recovery/resume wiring and visible session context surfaces
- `.planning/phases/02-session-persistence-recovery/03-SUMMARY.md` — session history UI and active-session presentation that Phase 3 will build on

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/state/appShellStore.ts` — already owns active session, session history, recovery state, and shell view transitions; Phase 3 can extend this rather than creating a parallel conversation store.
- `src/app/state/types.ts` — already defines `SessionMessage`, `SessionDetail`, and session-related metadata; Phase 3 can evolve these types for conversation rendering.
- `src/app/layout/CenterWorkspace.tsx` — already acts as the primary center-pane session surface and is the natural place to host project-mode conversation/task rendering.
- `src/app/layout/TopToolbar.tsx` and `src/app/layout/RightPanel.tsx` — already surface active project, model, session title, and recent activity, which support project-aware conversations.
- `src/app/services/sessionService.ts` and `src-tauri/src/session_service.rs` — already provide local session persistence and transcript storage to back streaming conversation history.

### Established Patterns
- The five-region IDE-style shell from Phase 1 remains fixed; Phase 3 should extend it rather than redesigning layout.
- Project mode and pure conversation mode are already distinct top-level modes, so differentiated input/response UX fits the existing architecture.
- Session history, restoration, and active-session visibility are already mainstream and lightweight; Phase 3 should layer conversation behavior onto that foundation without replacing it.
- The app currently keeps most UI state in a single shell-level Zustand store, which suggests Phase 3 should preserve centralized workflow state unless a narrowly scoped local state is clearly better.

### Integration Points
- Prompt submission must integrate with the active session in `appShellStore` and persist transcript updates through `sessionService`.
- Streaming assistant output must render in the center workspace while keeping session metadata synchronized for sidebar/history recovery.
- Project-mode coding-task presentation should plug into the existing session view and right-panel context surfaces, while leaving approval/execution-detail workflows for later phases.
- Pure conversation mode needs its own standard chat interaction path while still fitting into the same top-level shell and session model.

</code_context>

<specifics>
## Specific Ideas

- Project-mode interaction should feel inspired by Claude Code CLI and related agent workflows, not just a generic chatbot embedded in a desktop app.
- Project-mode progress should read like a staged agent workflow rather than a raw terminal log.
- Conversation remains the primary reading surface even when task summaries are shown.

</specifics>

<deferred>
## Deferred Ideas

- Full approval gating and impactful action review — Phase 4.
- Execution output viewer and detailed runtime logs — Phase 4.
- Diff review surfaces for changed files — Phase 5.
- Skills/config templates and workflow capability controls — Phase 5.

</deferred>

---

*Phase: 03-conversational-coding-workflow*
*Context gathered: 2026-03-30*
