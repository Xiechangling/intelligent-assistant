# Phase 2: Session Persistence & Recovery - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Make sessions durable, resumable, and clearly tied to project and model context. This phase delivers new session creation, resume of prior sessions, session history browsing, and recovery of key session state across app restarts. It does not yet deliver the full conversational coding workflow, execution approval, or diff review.

</domain>

<decisions>
## Implementation Decisions

### Session History Structure
- **D-01:** Session history uses a global unified list rather than a per-project-only session surface.
- **D-02:** The global session list must support filtering by project.
- **D-03:** The default session-history view shows all sessions sorted by most recent activity first.

### Session Resume Behavior
- **D-04:** Opening a historical session should directly resume that session and continue the conversation by default.
- **D-05:** Resume should feel lightweight and immediate rather than requiring an intermediate read-only detail screen.

### Restored Session Context
- **D-06:** Resuming a session must restore the associated project context.
- **D-07:** Resuming a session must restore the effective model context.
- **D-08:** Resuming a session must restore recent activity state so the user can tell what was happening last.

### Product Baseline
- **D-09:** Where session UX details are still unspecified, planning should follow mainstream agent/chat product patterns instead of inventing custom behavior.
- **D-10:** Phase 2 does not need bespoke or highly opinionated session mechanics unless later discussion or implementation pressure justifies them.

### Claude's Discretion
- Exact wording for session status labels and recovery copy.
- Exact interaction design for project filter controls and empty states.
- Exact presentation of recent activity status as long as it remains lightweight and understandable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core project context
- `.planning/PROJECT.md` — product vision, MVP boundaries, Windows-first/local-first constraints, and hybrid architecture direction
- `.planning/REQUIREMENTS.md` — Phase 2 requirement IDs (SESS-01, SESS-02, SESS-03, SESS-04, SECR-02) and traceability
- `.planning/ROADMAP.md` — Phase 2 goal, scope boundary, and success criteria
- `.planning/STATE.md` — current project status and roadmap progress
- `.planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md` — Phase 1 decisions that Phase 2 must carry forward
- `.planning/phases/01-desktop-shell-project-foundation/02-PLAN.md` — existing shell-state design and boundaries relevant to session integration
- `.planning/phases/01-desktop-shell-project-foundation/02-SUMMARY.md` — implemented shell-state/navigation outcomes that Phase 2 plugs into

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/state/appShellStore.ts` — already stores active project path, global default model, active session model override, shell view, and panel state; likely anchor for wiring restored session state into the shell.
- `src/app/state/types.ts` — already defines project and model-related shell types that Phase 2 can extend with session types.
- `src/app/layout/CenterWorkspace.tsx` — already has a `project-sessions` branch and placeholder copy for recent/resumable sessions.
- `src/app/layout/LeftSidebar.tsx` — already renders a recent sessions section, currently with placeholders, which can become a real session entry surface.
- `src/app/layout/TopToolbar.tsx` — already exposes active project and model state that resumed sessions need to rehydrate.
- `src/app/layout/RightPanel.tsx` — already shows current context and can likely surface active session metadata later.

### Established Patterns
- Shell state is currently centralized in a single Zustand store rather than split across multiple feature stores.
- Selecting a project updates `activeProjectPath` and routes the shell to `project-sessions`.
- Global default model and per-session override are already separated in state, which matches Phase 2’s recovery requirements.
- Current UI uses placeholder-first scaffolding for future flows, so Phase 2 can replace placeholders without changing the top-level shell structure.

### Integration Points
- Session creation and resume should integrate with the existing `project-sessions` shell view.
- Session restoration must synchronize with `activeProjectPath`, `globalDefaultModel`, and `activeSessionModelOverride` in the shell store.
- Session history likely needs to appear in the left sidebar and/or center workspace without breaking the Phase 1 shell layout.
- Persisted session metadata must support app-restart recovery to satisfy SECR-02 and SESS-04.

</code_context>

<specifics>
## Specific Ideas

- The user is comfortable using mainstream agent session patterns as the baseline and does not currently need highly customized session behavior.
- The desired recovery flow should optimize for low friction: open history, pick a session, continue immediately.

</specifics>

<deferred>
## Deferred Ideas

- Exact fields shown in each session-list row were not discussed yet.
- The detailed definition of “recent activity state” was not discussed yet.
- New-session entry behavior and defaults were not discussed yet.
- Any advanced session mechanics beyond mainstream patterns should wait until a later need appears.

</deferred>

---

*Phase: 02-session-persistence-recovery*
*Context gathered: 2026-03-30*
