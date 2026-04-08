# Phase 6: Claude Code Desktop Alignment - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Evolve the current Tauri desktop app from the completed MVP shell into a desktop experience that feels meaningfully closer to the official Claude Code v2.1.88 reference workflow, while preserving this project's local-first, Windows-first, single-user constraints. This phase should focus on the desktop product surface, session/workspace flow, and interaction model alignment with the vendored Claude Code source snapshot. It does not add multi-user collaboration, cloud sync, or plugin marketplace capabilities.

</domain>

<decisions>
## Implementation Decisions

### Reference Alignment Strategy
- **D-01:** Phase 6 should treat `claude-code-source-code-v2.1.88/` as the canonical behavioral reference for desktop-like workflow patterns, session flow, and bridge-oriented UX concepts, but not as code to transplant directly into the Tauri app.
- **D-02:** Planning should prefer adapting official workflow concepts into the existing Tauri + React + Rust architecture instead of trying to embed or run the upstream CLI UI directly.
- **D-03:** Where the official source is incomplete or stripped in npm-distributed files, planning should still preserve the visible product direction inferred from the available session, bridge, and history modules rather than falling back to unrelated custom UX.

### Desktop Shell Direction
- **D-04:** Keep the existing five-region IDE-style shell from earlier phases as the outer structure, but redesign the experience inside that shell so it feels closer to an official desktop companion rather than a generic internal admin panel.
- **D-05:** The center workspace should become the primary product surface for session selection, session attachment/resume, and rich conversation/task flow, because that is where the current app already anchors coding work.
- **D-06:** Left sidebar, toolbar, inspector, and bottom panel should support the primary workspace flow rather than compete with it; they are supporting control surfaces, not the main product story.

### Session and Workspace Experience
- **D-07:** The desktop product should emphasize attached/resumable coding sessions and active workspace context as first-class concepts, inspired by the official `AssistantSessionChooser`, session discovery, session history, and bridge/session APIs.
- **D-08:** Project-mode UX should evolve from a simple “new session vs history list” view toward a more official-feeling workspace/session chooser experience with clearer current-state visibility.
- **D-09:** Conversation-mode support should remain available, but Phase 6 priority is the official-style coding workspace experience rather than expanding generic chat features.

### Interaction Model
- **D-10:** The transcript should continue to be conversation-first, but with stronger task/session state framing so users can understand attachment state, session progress, approvals, and review readiness at a glance.
- **D-11:** Approval, execution, and review surfaces already built in Phases 4-5 should be visually integrated into a cohesive desktop workflow instead of feeling like separate MVP add-ons.
- **D-12:** Planning should prefer official-feeling status language and lifecycle cues such as ready, connected, attached, working, awaiting approval, and review-ready over generic placeholder copy.

### Scope Controls
- **D-13:** Phase 6 should stay within single-user local desktop workflow refinement; do not introduce cloud sync, multi-user workspaces, or marketplace/plugin distribution.
- **D-14:** Phase 6 may refine shell information architecture, session routing, state modeling, and native service boundaries if needed to support the official-style desktop workflow, because this is a multi-file product-alignment phase rather than a small polish pass.

### Claude's Discretion
- Exact naming of the new desktop surfaces and whether “workspace”, “session”, “attach”, or similar official-style labels appear in the UI.
- Exact distribution of details between center workspace, right inspector, and bottom panel, as long as center workspace remains primary.
- Exact visual treatment of session rows, status chips, and bridge-inspired connection state, as long as the result clearly reads as a desktop coding tool rather than a generic chat app.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — product vision, MVP scope, Windows-first/local-first constraints, and hybrid CLI + API architecture
- `.planning/REQUIREMENTS.md` — completed MVP requirements and explicit out-of-scope boundaries that Phase 6 must preserve
- `.planning/ROADMAP.md` — Phase 6 placeholder entry and prior phase goals/status
- `.planning/STATE.md` — current project state and roadmap evolution note for Phase 6

### Prior phase decisions to carry forward
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md` — fixed five-region IDE shell, mode structure, project switching, and toolbar control decisions
- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md` — resumable session model, unified history, and mainstream session UX baseline
- `.planning/phases/03-conversational-coding-workflow/03-CONTEXT.md` — conversation-first coding workflow, project-vs-conversation distinction, and stage/status event decisions

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — current frontend/store/backend layering and assistant/execution/session data flow
- `.planning/codebase/STRUCTURE.md` — location of shell, services, state, and vendored official source snapshot
- `.planning/codebase/CONVENTIONS.md` — frontend/Rust naming, state, and service-boundary conventions to preserve

### Current implementation anchors
- `src/app/layout/CenterWorkspace.tsx` — current primary session/workspace surface and transcript/composer flow
- `src/app/layout/TopToolbar.tsx` — current mode, project, status, and inspector entry surface
- `src/app/layout/LeftSidebar.tsx` — current recent sessions/projects navigation model
- `src/app/layout/RightPanel.tsx` — current inspector/settings implementation
- `src/app/layout/BottomPanel.tsx` — current approval/output/review tray
- `src/app/state/appShellStore.ts` — current workflow orchestrator for sessions, prompts, approvals, execution, and review
- `src/app/state/types.ts` — current shared shell/session/execution type contracts

### Official Claude Code v2.1.88 reference snapshot
- `claude-code-source-code-v2.1.88/src/assistant/AssistantSessionChooser.tsx` — evidence that official flow treats session choosing/attachment as a dedicated surface
- `claude-code-source-code-v2.1.88/src/assistant/sessionDiscovery.ts` — evidence that discoverable assistant sessions are first-class in the official product direction
- `claude-code-source-code-v2.1.88/src/assistant/sessionHistory.ts` — official session-event history loading model and chronological event handling
- `claude-code-source-code-v2.1.88/src/bridge/types.ts` — official vocabulary for bridge environments, attached sessions, activity, and spawn/session modes
- `claude-code-source-code-v2.1.88/src/bridge/bridgeUI.ts` — official status-line/session-count/activity presentation concepts for attached remote sessions
- `claude-code-source-code-v2.1.88/src/bridge/bridgeApi.ts` — official bridge/session lifecycle semantics (register, poll, ack, reconnect, archive, heartbeat)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/layout/CenterWorkspace.tsx` already owns project session history, active transcript rendering, inline approval card, review summary, and composer; this is the strongest base for a richer official-style workspace/session surface.
- `src/app/state/appShellStore.ts` already centralizes session creation/resume, transcript updates, approval workflow, execution state, and recovery, so Phase 6 can reshape UX without inventing a second workflow store.
- `src/app/state/types.ts` already defines transcript event kinds, execution records, proposals, attachments, and session metadata that can be extended for richer desktop session semantics.
- `src/app/layout/TopToolbar.tsx`, `LeftSidebar.tsx`, `RightPanel.tsx`, and `BottomPanel.tsx` already provide the shell control surfaces needed to support a more official-feeling desktop workflow.
- `src-tauri/src/session_service.rs`, `src-tauri/src/assistant_service.rs`, and `src-tauri/src/execution_service.rs` already give the app a native backend for session persistence, assistant turns, approvals, and execution visibility.

### Established Patterns
- The app uses a single Zustand orchestration store plus thin service adapters and Tauri commands; Phase 6 should preserve this architecture instead of importing upstream runtime patterns wholesale.
- The shell is already IDE-like and center-first; official alignment should refine information architecture and state presentation inside that structure rather than replacing it with a terminal clone.
- Transcript events are append-only and already include stage-status, approval-request, execution-update, and review-available; richer official alignment should build on those event primitives.
- Current UI copy and some surface composition still read as MVP scaffolding; this phase should systematically replace placeholder/workbench copy with cohesive desktop-product language.

### Integration Points
- Session chooser/workspace redesign will touch `CenterWorkspace.tsx`, `LeftSidebar.tsx`, `TopToolbar.tsx`, `RightPanel.tsx`, `BottomPanel.tsx`, `appShellStore.ts`, `types.ts`, and the service/native boundary modules they rely on.
- Official-style session/attachment state may require richer store types and backend payloads so the UI can present connection/attachment/resume semantics cleanly.
- Any bridge-inspired wording or session-lifecycle representation must stay compatible with the existing local-only Tauri flow rather than assuming the full remote bridge stack exists in this product.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly wants the desktop app to move closer to the official Claude Code desktop experience, with `claude-code-source-code-v2.1.88` as the reference baseline.
- The existing MVP already covers shell, sessions, conversations, approval, execution, and review; Phase 6 should unify those into a more official-feeling desktop product rather than add disconnected new capability.
- “Non-essential” clarification should be avoided; downstream planning should default to decisive implementation choices unless there is a real blocker.

</specifics>

<deferred>
## Deferred Ideas

- Multi-user collaboration or shared approvals — out of scope, still belongs to v2 requirements.
- Cloud sync, hosted session sharing, or plugin marketplace — out of scope for this phase and the current MVP boundaries.
- Literal embedding of the upstream official runtime/UI implementation into Tauri — not the goal of this phase.

</deferred>

---

*Phase: 06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c*
*Context gathered: 2026-04-06*