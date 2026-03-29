# Phase 1 Research: Desktop Shell & Project Foundation

## Objective

Research how to implement the Phase 1 shell for Intelligent Assistant so planning can break work into executable tasks with the right boundaries, early decisions, and risk controls.

## Phase Scope

Phase 1 establishes:
- Windows-first desktop shell
- project folder selection and recent-project switching
- visible mode / model / project controls
- secure local credential foundation

Phase 1 does **not** need to complete later conversational, execution, or diff workflows — it only needs to shape the shell so later phases can plug in cleanly.

## Recommended Technical Direction

### Desktop shell
Use **Tauri v2 + React + TypeScript** with a shell structure built around:
- top action toolbar
- left mixed navigation
- center chat-first workspace
- right dynamic context/settings panel
- bottom collapsible terminal/log panel

This matches the locked phase decisions and avoids redesigning the workspace in later phases.

### Routing model
Use application-level routing/state that distinguishes:
- **project mode**
- **pure conversation mode**

Even if pure conversation behavior is incomplete in Phase 1, routing/state should already encode mode as a first-class concept so later phases do not need to rework the shell.

### Persistence foundation
Phase 1 should create persistence for:
- recent projects
- active mode
- global default model
- per-session model-override capability scaffolding
- secure API credential presence/status

Avoid over-designing session persistence here; only build what later phases depend on.

## Planning-Relevant Architecture Guidance

### 1. Shell should be composed from stable layout regions
A clean greenfield structure would likely separate:
- `app shell / window chrome`
- `toolbar controls`
- `left navigation`
- `workspace outlet`
- `right panel`
- `bottom panel`

This makes later phases additive instead of forcing shell rewrites.

### 2. Mode must be top-level app state, not a local page detail
Because the user wants both project mode and pure conversation mode visible and switchable, mode should live in top-level state and drive:
- what the center pane shows
- what the left nav emphasizes
- whether a project is required
- how new sessions are created later

### 3. Project selection should be decoupled from session creation
The user decided that switching projects should land on that project's session list, not auto-create a session. That means project state and session state must be separate stores/entities.

### 4. Model controls need two layers of state
Research supports a split between:
- **global default model**
- **session-specific override**

Even if session persistence is Phase 2, the state model should already reflect both so Phase 1 doesn’t hardcode a purely global assumption.

### 5. Credential handling must use OS-secure storage, not plain config
For Windows-first MVP, the credential strategy should use secure OS-backed storage rather than plaintext files or normal localStorage-style persistence. Phase 1 should focus on:
- key presence / missing state
- save / replace / clear operations
- a safe status surface in the UI

The actual provider-specific request flows can mature later.

## Windows-First Considerations

### Folder selection
Plan for a native folder picker path that:
- supports choosing any local folder
- returns normalized absolute paths
- allows non-standard project folders with warning state

Important because user explicitly wants warning-but-continue behavior for directories that do not look like standard projects.

### Path handling
The plan should assume Windows path normalization and explicit display formatting. Project switching and active-project display should not depend on POSIX-only assumptions.

### Secure storage
Prefer Windows Credential Manager via Tauri/native integration or an equivalent secure-storage plugin path. Avoid:
- plaintext `.env`-style credential persistence for user secrets
- storing API keys directly in general app config files
- leaking key values into logs or UI debug state

## Suggested File / Module Boundaries

A strong Phase 1 plan should probably create boundaries similar to:
- shell layout components
- toolbar controls (mode/project/model)
- project directory services + recent-project persistence
- mode/model/project app-state store
- secure credential service abstraction
- app settings/repository layer
- initial route/workspace views for project mode vs pure conversation mode

The exact filenames are discretionary, but the plan should keep UI layout, persistence, and native integrations separated.

## Likely Risks / Gotchas

### 1. Mixing shell decisions with later session logic
Risk: Phase 1 starts implementing full session behavior because the UI is chat-first.

Planning implication: keep tasks scoped to shell state, placeholders, and routing foundations unless a requirement explicitly demands more.

### 2. Treating pure conversation mode as an afterthought
Risk: shell gets built around project-required assumptions, making later pure chat mode awkward.

Planning implication: add explicit tasks for mode switching visibility and mode-specific home routing now.

### 3. Coupling recent projects to project validity checks too tightly
Risk: non-standard folders become second-class or impossible to reopen.

Planning implication: store recents independently from validation results; validation should produce warnings, not gate access.

### 4. Hardcoding model controls as purely global
Risk: later session-level override work requires undoing Phase 1 assumptions.

Planning implication: build state shape now for global default + active-session override, even if override UI depth remains light in this phase.

### 5. Credential UX can sprawl
Risk: Phase 1 gets pulled into provider settings, multiple credential types, advanced validation, or sync.

Planning implication: keep scope tight: secure save/load/replace/clear plus visible credential status.

## Recommended Task Breakdown Shape

The eventual plan will probably need 3-4 plans, roughly around:
1. app shell + layout foundation
2. top-level app state for mode/project/model
3. project folder selection + recent-project persistence + warning flow
4. secure credential foundation and settings/status surfaces

These can likely run in partial parallel once shared shell/state decisions are in place.

## Research Conclusions For Planner

The planner should preserve these truths:
- layout foundation must come first and remain IDE-style
- mode is a top-level shell concern now, not later
- project and session concepts must remain separate
- credential handling must be secure from day one
- Phase 1 should prepare later phases without accidentally implementing them early

## Validation Architecture

### What must be true after Phase 1
- shell layout regions exist and match the chosen structure
- current mode is always visible
- top toolbar exposes model/mode/project controls
- user can choose a folder, reopen recent folders, and switch active project
- non-standard project folders warn but remain openable
- secure credential storage path exists without plaintext secret persistence in regular config

### Phase-specific planning checks
- No task should require full chat workflow implementation beyond shell placeholders/foundations
- No task should require command execution, diff review, or session-recovery completion from later phases
- Plans should create seams that later phases extend rather than replace

## RESEARCH COMPLETE

Phase 1 should be planned as a shell-and-foundation phase with explicit seams for later session, execution, and review work. The most important planning guardrails are: keep mode as top-level state, separate project selection from session lifecycle, make the toolbar the primary control surface, and use secure OS-backed credential storage from the start.
