# Phase 5: Review, Skills & Workflow Polish - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Finish the MVP with review surfaces and configuration ergonomics that make the product meaningfully better than terminal-only usage. This phase covers changed-file inspection, diff preview tied to session activity, reusable configuration presets, and GUI control over available workflow capabilities. It does not add new collaboration, sync, or marketplace features.

</domain>

<decisions>
## Implementation Decisions

### Review Surfaces
- **D-01:** Changed files should stay tied to the active session and latest approved execution rather than becoming a detached project-wide diff browser.
- **D-02:** Review should use a split layout with a changed-file list and a diff preview, remaining in the bottom panel as a supporting workflow surface.
- **D-03:** Review-ready state should be visible inline in the center workspace and detailed in the bottom panel.
- **D-04:** When review artifacts are unavailable, the app should show explicit degraded-review messaging rather than an ambiguous empty state.

### Presets and Reuse
- **D-05:** The app should support saving and reusing compact runtime presets from the existing shell state rather than introducing a separate heavy configuration system.
- **D-06:** Presets should capture meaningful workflow-facing choices such as mode, model, and review preference state.
- **D-07:** Applying a preset should affect future interactions and shell defaults without rewriting prior session history.

### Workflow Capabilities
- **D-08:** Workflow capabilities should be configurable from the GUI as lightweight enable/disable toggles.
- **D-09:** Capability controls belong in settings/support surfaces, not in the center workspace.
- **D-10:** Capability labels should stay product-facing and understandable rather than exposing internal implementation jargon.

### Product Cohesion
- **D-11:** Review, settings, presets, and capability toggles should feel like polish on the same desktop workflow, not a disconnected admin area.
- **D-12:** Right panel remains the primary location for presets and workflow capability settings, while bottom panel remains the primary review/detail surface.
- **D-13:** The overall result should make the desktop shell feel more cohesive than terminal-only Claude Code workflows.

### Claude's Discretion
- Exact naming of presets and capability labels.
- Exact visual treatment of review rows, diff typography, and empty/degraded review states.
- Exact small-copy wording in the settings panel as long as it stays concise and tool-like.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — MVP boundaries and product intent
- `.planning/REQUIREMENTS.md` — `REVW-01`, `REVW-02`, `CONF-03`, `CONF-04` requirement definitions and traceability
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria
- `.planning/STATE.md` — current milestone context and already-completed foundations

### Prior phase decisions and foundations
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md` — shell region ownership and top-toolbar/right-panel/bottom-panel layout decisions
- `.planning/phases/02-session-persistence-recovery/02-CONTEXT.md` — session continuity and lightweight mainstream session behavior
- `.planning/phases/03-conversational-coding-workflow/03-CONTEXT.md` — conversation-first project workflow and inline task context
- `.planning/phases/04-safe-execution-visibility/04-CONTEXT.md` — approval/output/tray safety and execution visibility decisions

### Relevant implementation anchors
- `src/app/layout/BottomPanel.tsx` — review rail, diff preview, degraded review states
- `src/app/layout/RightPanel.tsx` — presets, settings, and workflow capability controls
- `src/app/state/appShellStore.ts` — preset saving/applying, capability toggles, review selection state
- `src/app/state/types.ts` — review-related types, preset contracts, capability toggles, changed-file structures
- `src/app/services/credentialService.ts` — settings and connection persistence surface
- `src/app/services/projectService.ts` — project-oriented supporting shell integration

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/layout/BottomPanel.tsx` already provides a review file rail, diff preview, output panel, and degraded-review messaging.
- `src/app/layout/RightPanel.tsx` already provides settings, presets, and workflow capability toggles as a support-only surface.
- `src/app/state/appShellStore.ts` already supports preset save/apply operations, capability toggles, selected review file state, and execution/review linkage.
- `src/app/state/types.ts` already defines changed-file review payloads, presets, and workflow capability contracts.

### Established Patterns
- The desktop shell keeps detailed workflow artifacts in supporting panels while the center workspace remains the primary interaction surface.
- Review state is derived from the active execution/session rather than from a separate repository-wide review subsystem.
- Settings-like controls live in the right panel and remain compact/tool-oriented.

### Integration Points
- Review polish should integrate with `executionRecord`, `selectedReviewFileId`, and tray mode in `appShellStore.ts`.
- Preset and capability polish should integrate with the existing right-panel settings workflow.
- Any Phase 5 UI changes should reinforce cohesion across center workspace, bottom panel, and right panel rather than relocating ownership.

</code_context>

<specifics>
## Specific Ideas

- Review should feel tied to the coding session, not like a separate git client.
- Presets should help the app feel more reusable and less repetitive than raw terminal workflows.
- Capability toggles should remain lightweight and understandable for a single-user desktop workflow.

</specifics>

<deferred>
## Deferred Ideas

- Team/shared review workflows — out of scope.
- Cloud-synced presets or skills — out of scope.
- Plugin marketplace / third-party extension management — out of scope.

</deferred>

---

*Phase: 05-review-skills-workflow-polish*
*Context gathered: 2026-04-06*