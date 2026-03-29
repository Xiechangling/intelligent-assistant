# Phase 1: Desktop Shell & Project Foundation - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a usable Windows-first desktop shell that defines the product’s primary workspace structure, supports project-root selection and switching, provides visible mode and model controls, and creates a secure local credential foundation. This phase defines the shell and navigation model, not the full later-phase implementation of conversational workflows, execution, or diff review.

</domain>

<decisions>
## Implementation Decisions

### App Shell Layout
- **D-01:** Use an IDE-style application shell rather than a simple chat app layout.
- **D-02:** Keep the center area chat-first so conversation remains the primary workspace.
- **D-03:** Use mixed left navigation with recent sessions at the top and project list below.
- **D-04:** Place terminal/log output in a collapsible bottom panel.
- **D-05:** Use a right-side dynamic panel that normally shows context and can switch to settings/details.
- **D-06:** Use an action-oriented top toolbar rather than a minimal status bar.

### Model Controls
- **D-07:** Support a global default model plus per-session override.
- **D-08:** Allow model changes during an active session.
- **D-09:** A model change only affects subsequent turns/tasks, not prior session history.
- **D-10:** Put the primary model switcher in a persistent top-toolbar dropdown.
- **D-11:** After a model switch, update the visible top-level model state only; do not inject a session timeline status message.

### Project Switching
- **D-12:** Phase 1 project entry should start with opening a local folder.
- **D-13:** Remember opened projects and show them in the project list as recents.
- **D-14:** Allow active-project switching from both the top toolbar and the left navigation.
- **D-15:** After switching projects, land on that project’s session list so the user can resume or create a session.
- **D-16:** If a selected folder does not look like a standard project directory, warn the user but still allow continuing.

### Mode Structure
- **D-17:** The app shell must support both project mode and pure conversation mode.
- **D-18:** Current mode must always be visibly displayed.
- **D-19:** Mode switching belongs in the top toolbar.
- **D-20:** After switching mode, route to the destination mode’s natural home: project selection/session flow for project mode, ordinary conversation/session flow for pure conversation mode.
- **D-21:** Phase 1 only needs to establish the shell and routing support for pure conversation mode; the full non-project conversation experience can continue in later phases.

### Claude's Discretion
- Exact visual styling, spacing, iconography, and typography within the chosen shell structure.
- Exact wording for non-project-directory warning copy.
- Exact component composition for the top toolbar and right-side dynamic panel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — product vision, MVP scope, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs and overall MVP traceability
- `.planning/ROADMAP.md` — Phase 1 goal, scope boundary, and success criteria
- `.planning/STATE.md` — current project status and active phase focus

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing product source code yet — Phase 1 planning should assume a greenfield implementation.

### Established Patterns
- Current repository only contains planning artifacts; no UI, state, routing, or desktop-shell implementation patterns are established yet.
- Prior research recommends a Tauri + React + TypeScript + Rust orchestration direction, which should inform planning but is not yet implemented code.

### Integration Points
- Phase 1 should establish the initial desktop shell, navigation model, mode switching surface, model controls surface, and project-selection entry points that later phases plug into.
- Session persistence from Phase 2, conversational workflow from Phase 3, and execution visibility from Phase 4 will all integrate into the shell decisions captured here.

</code_context>

<specifics>
## Specific Ideas

- The product should feel closer to a developer IDE/workbench than a plain chatbot.
- Pure conversation mode should resemble mainstream multimodal chat products in accessibility, while still coexisting with project mode.
- The top toolbar should remain a high-frequency control surface because it carries mode switching, model switching, and project switching.

</specifics>

<deferred>
## Deferred Ideas

- Full pure conversation interaction behavior beyond shell/routing support — later phase work.
- Credential setup flow details were not discussed yet and remain open for planning/research unless surfaced during plan-phase.

</deferred>

---

*Phase: 01-desktop-shell-project-foundation*
*Context gathered: 2026-03-30*
