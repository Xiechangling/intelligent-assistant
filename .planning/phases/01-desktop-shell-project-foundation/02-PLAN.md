---
plan_id: "02"
phase: "01"
title: "Build shell state and navigation domain"
wave: 1
depends_on: []
files_modified:
  - "src/app/state/appShellStore.ts"
  - "src/app/state/types.ts"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/LeftSidebar.tsx"
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/app/layout/RightPanel.tsx"
requirements_addressed:
  - "PROJ-03"
  - "CONF-01"
  - "CONF-02"
autonomous: true
---

## Objective
Establish the top-level app state model for mode, active project, project recents, current model, and session-override-ready model state so the shell can route correctly without baking in later-phase assumptions.

## Must Haves
- Top-level state distinguishes project mode vs pure conversation mode
- Global default model and active session override shape both exist
- Project, session-list view, and context-panel state are separate concepts

<tasks>
  <task id="02.1">
    <objective>Create explicit shell state types and store boundaries.</objective>
    <read_first>
- .planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md
- .planning/phases/01-desktop-shell-project-foundation/01-RESEARCH.md
- src/app/layout/TopToolbar.tsx
- src/app/layout/CenterWorkspace.tsx
    </read_first>
    <action>Create src/app/state/types.ts and define concrete types for AppMode, ProjectRecord, ProjectWarningState, ShellView, ModelId, ModelSelectionState, and CredentialStatusSummary. Create src/app/state/appShellStore.ts with a single app-shell store that includes: mode ('project' | 'conversation'), activeProjectPath, recentProjects array, activeShellView ('project-home' | 'project-sessions' | 'conversation-home'), globalDefaultModel, activeSessionModelOverride, rightPanelView, bottomPanelExpanded, and credentialStatus ('missing' | 'configured' | 'error').</action>
    <acceptance_criteria>
- src/app/state/types.ts exists
- src/app/state/types.ts contains AppMode type with project and conversation values
- src/app/state/types.ts contains ShellView type with project-home, project-sessions, and conversation-home values
- src/app/state/appShellStore.ts exists
- src/app/state/appShellStore.ts contains globalDefaultModel
- src/app/state/appShellStore.ts contains activeSessionModelOverride
- src/app/state/appShellStore.ts contains recentProjects
- src/app/state/appShellStore.ts contains credentialStatus
    </acceptance_criteria>
  </task>

  <task id="02.2">
    <objective>Wire toolbar and center workspace to the shell state model.</objective>
    <read_first>
- src/app/state/appShellStore.ts
- src/app/layout/TopToolbar.tsx
- src/app/layout/CenterWorkspace.tsx
- src/app/layout/RightPanel.tsx
    </read_first>
    <action>Update TopToolbar, CenterWorkspace, and RightPanel to read from appShellStore.ts. Mode switching in TopToolbar must set the store mode and update activeShellView to 'project-home' or 'conversation-home'. Model switching must update globalDefaultModel and expose current effective model state without writing timeline messages. RightPanel must switch between at least 'context' and 'settings' views using store state.</action>
    <acceptance_criteria>
- src/app/layout/TopToolbar.tsx imports the shell store
- src/app/layout/CenterWorkspace.tsx imports the shell store
- src/app/layout/RightPanel.tsx imports the shell store
- src/app/layout/TopToolbar.tsx sets mode to project or conversation
- src/app/layout/TopToolbar.tsx updates globalDefaultModel through store actions
- src/app/layout/RightPanel.tsx contains context and settings view handling
    </acceptance_criteria>
  </task>

  <task id="02.3">
    <objective>Wire left navigation to mixed session/project structure without implementing full session history logic.</objective>
    <read_first>
- src/app/layout/LeftSidebar.tsx
- src/app/state/appShellStore.ts
- .planning/phases/01-desktop-shell-project-foundation/01-UI-SPEC.md
    </read_first>
    <action>Update LeftSidebar so it renders two explicit sections: recent sessions and projects. Use placeholder session entries if real session persistence is not yet implemented, but keep the UI structure and state boundaries intact. Render recentProjects from the shell store in the project section. Selecting a project from the sidebar must set activeProjectPath and update activeShellView to 'project-sessions'.</action>
    <acceptance_criteria>
- src/app/layout/LeftSidebar.tsx contains a recent sessions section
- src/app/layout/LeftSidebar.tsx contains a projects section
- src/app/layout/LeftSidebar.tsx reads recentProjects from the shell store
- src/app/layout/LeftSidebar.tsx sets activeProjectPath when a project is selected
- src/app/layout/LeftSidebar.tsx updates the shell view to project-sessions when a project is selected
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read appShellStore.ts and verify mode, project, model, and credential state are all present
- Read toolbar/sidebar/workspace components and confirm they are driven by shared shell state
- Confirm store shape includes session-override-ready model fields even though Phase 2 owns full session persistence
