# Phase 4: Safe Execution & Visibility - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Make assistant-driven actions trustworthy by adding approval controls, execution output visibility, and explicit working-context safeguards. This phase covers how impactful commands are reviewed before execution, how execution output and progress are surfaced in the desktop app, and how workspace/working-directory context stays visible to the user. It does not expand into diff review ergonomics beyond execution-linked visibility; richer review surfaces remain Phase 5 work.

</domain>

<decisions>
## Implementation Decisions

### Approval Visibility
- **D-01:** Impactful project commands must stop for explicit approval before execution.
- **D-02:** Approval UI must show the command summary, exact command string, workspace path, and working directory together.
- **D-03:** Approval controls should remain close to the main coding workflow, with a compact inline summary in the center workspace and detailed structured context in the bottom panel.
- **D-04:** Approval must support both approve and reject outcomes without losing the active session context.

### Execution Output Surface
- **D-05:** Execution output belongs in the collapsible bottom panel rather than replacing the conversation surface.
- **D-06:** Output should stream as labeled `system`, `stdout`, and `stderr` lines so the user can understand what happened without reading raw terminal state elsewhere.
- **D-07:** The bottom panel should auto-expand when approval or execution starts so the workflow remains visible without manual hunting.

### Working-Context Safeguards
- **D-08:** The selected project and working directory must stay explicit before and during execution.
- **D-09:** Approved execution must remain constrained to the selected project boundary; do not allow commands to escape the project root.
- **D-10:** Command execution state should remain synchronized with the active session timeline via transcript events and recent-activity summaries.

### Presentation Model
- **D-11:** Project-mode workflow remains conversation-first, but approval requests and execution updates are visible event types in the session transcript.
- **D-12:** The right panel may summarize pending approval or execution state, but it is a supporting surface rather than the primary approval interface.
- **D-13:** Exact status wording may evolve, but the user must always understand whether the session is waiting for approval, running work, or failed.

### Claude's Discretion
- Exact wording for approval/execution helper copy and status labels.
- Exact iconography and compact layout treatment of the bottom panel tabs and approval cards.
- Exact ordering of transcript execution events as long as request → approval → execution → result remains understandable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — product vision, local-first constraints, explicit safety boundaries
- `.planning/REQUIREMENTS.md` — `EXEC-01`, `EXEC-02`, `EXEC-03` requirement definitions and traceability
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria
- `.planning/STATE.md` — current milestone state and prior implementation context

### Prior phase decisions and foundations
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md` — locked shell layout with bottom panel and right-side inspector
- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md` — lightweight resume behavior and restored project/model context
- `.planning/phases/03-conversational-coding-workflow/03-CONTEXT.md` — conversation-first project workflow, transcript event types, and task-flow presentation

### Relevant implementation anchors
- `src/app/state/types.ts` — transcript event kinds, command proposal, execution record, changed-file review contracts
- `src/app/state/appShellStore.ts` — approval gating, execution state transitions, transcript mutation, and session persistence
- `src/app/layout/CenterWorkspace.tsx` — inline approval/review summaries and conversation surface
- `src/app/layout/BottomPanel.tsx` — approval, output, and review tray presentation
- `src/app/layout/RightPanel.tsx` — support-only execution/context summaries
- `src/app/services/assistantService.ts` — assistant turn and approved-command frontend boundary
- `src-tauri/src/execution_service.rs` — native execution guardrails, stdout/stderr capture, and git review extraction

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/state/appShellStore.ts` already centralizes pending proposals, execution records, transcript events, and approval/execution mutations.
- `src/app/state/types.ts` already includes `approval-request`, `approval-resolution`, `execution-update`, and `review-available` event kinds plus typed command/execution payloads.
- `src/app/layout/CenterWorkspace.tsx` already supports inline workflow surfaces tied to the active session.
- `src/app/layout/BottomPanel.tsx` already owns approval, output, and review detail presentation.
- `src-tauri/src/execution_service.rs` already validates working-directory containment and captures execution output plus changed-file review data.

### Established Patterns
- Workflow state is derived centrally in the Zustand store and consumed by shell regions.
- The product keeps conversation as the primary reading surface while auxiliary workflow details live in adjacent panels.
- Native commands return typed payloads that the frontend maps into timeline events and panel state.

### Integration Points
- Approval UI must integrate with `pendingProposal`, `approvePendingCommand`, and `rejectPendingCommand` in the store.
- Execution output and review data flow from `assistantService.ts` into `appShellStore.ts`, then into `BottomPanel.tsx` and `CenterWorkspace.tsx`.
- Working-directory safety is enforced in `src-tauri/src/execution_service.rs` and must remain visible in approval UI.

</code_context>

<specifics>
## Specific Ideas

- Approval should feel like a natural checkpoint in the coding session, not a detached modal.
- Output visibility should make background command work understandable without requiring terminal fluency.
- Safety trust comes from context clarity: command, workspace, working directory, and result state must be obvious.

</specifics>

<deferred>
## Deferred Ideas

- Richer diff review ergonomics and file-inspection polish — Phase 5.
- Skills/config workflow controls — Phase 5.
- Any remote/cloud execution or shared approval model — out of scope.

</deferred>

---

*Phase: 04-safe-execution-visibility*
*Context gathered: 2026-04-06*