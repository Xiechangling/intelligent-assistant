---
plan_id: "01"
phase: "01"
title: "Establish desktop shell and layout foundation"
wave: 1
depends_on: []
files_modified:
  - "src-tauri/tauri.conf.json"
  - "package.json"
  - "src/main.tsx"
  - "src/App.tsx"
  - "src/app/layout/AppShell.tsx"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/LeftSidebar.tsx"
  - "src/app/layout/RightPanel.tsx"
  - "src/app/layout/BottomPanel.tsx"
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/styles/app-shell.css"
requirements_addressed:
  - "PROJ-03"
  - "CONF-01"
  - "CONF-02"
autonomous: true
---

## Objective
Create the Windows-first IDE-style app shell that establishes the five-region workspace, keeps chat as the center focus, and surfaces mode/project/model controls in the top-level UI.

## Must Haves
- Five-region IDE-style shell exists: top toolbar, left mixed navigation, center chat-first workspace, right dynamic panel, bottom collapsible panel
- Toolbar visibly shows mode, active project context, and active model control surfaces
- Center workspace supports mode-specific home states and project-session-list state scaffolding

<tasks>
  <task id="01.1">
    <objective>Create the initial desktop app entrypoints and shell composition for a Tauri + React workspace.</objective>
    <read_first>
- src/main.tsx
- src/App.tsx
- .planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md
- .planning/phases/01-desktop-shell-project-foundation/01-RESEARCH.md
- .planning/phases/01-desktop-shell-project-foundation/01-UI-SPEC.md
    </read_first>
    <action>Initialize the frontend app structure so src/App.tsx renders a single AppShell root. Create src/app/layout/AppShell.tsx and wire it from src/App.tsx. The AppShell component must compose five explicit layout regions in this order: TopToolbar, LeftSidebar, CenterWorkspace, RightPanel, and BottomPanel. Create the companion component files under src/app/layout/ and import them through the shell. Ensure the initial center workspace defaults to a chat-first home view rather than a blank placeholder.</action>
    <acceptance_criteria>
- src/App.tsx contains AppShell import and renders &lt;AppShell /&gt;
- src/app/layout/AppShell.tsx exists and imports TopToolbar, LeftSidebar, CenterWorkspace, RightPanel, and BottomPanel
- src/app/layout/TopToolbar.tsx exists
- src/app/layout/LeftSidebar.tsx exists
- src/app/layout/CenterWorkspace.tsx exists
- src/app/layout/RightPanel.tsx exists
- src/app/layout/BottomPanel.tsx exists
    </acceptance_criteria>
  </task>

  <task id="01.2">
    <objective>Implement the visual shell contract and region layout behavior.</objective>
    <read_first>
- src/app/layout/AppShell.tsx
- src/styles/app-shell.css
- .planning/phases/01-desktop-shell-project-foundation/01-UI-SPEC.md
    </read_first>
    <action>Create src/styles/app-shell.css and apply it from the app entry so the shell renders an IDE-style five-region layout. Implement an action-oriented top toolbar, a left mixed-navigation column, a center primary workspace, a right details/settings panel, and a bottom collapsible panel area. The center region must occupy the dominant visual area. The right panel must be structurally distinct from the center workspace. The bottom panel must support a collapsed and expanded visual state through component props or local UI state.</action>
    <acceptance_criteria>
- src/styles/app-shell.css exists
- src/main.tsx or src/App.tsx imports src/styles/app-shell.css
- src/app/layout/AppShell.tsx contains markup/class names for top toolbar, left sidebar, center workspace, right panel, and bottom panel
- src/app/layout/BottomPanel.tsx contains collapsed or expanded state handling
- src/app/layout/CenterWorkspace.tsx contains the primary workspace container
    </acceptance_criteria>
  </task>

  <task id="01.3">
    <objective>Expose toolbar-first mode, project, and model controls with placeholder-ready behavior.</objective>
    <read_first>
- src/app/layout/TopToolbar.tsx
- src/app/layout/CenterWorkspace.tsx
- .planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md
- .planning/phases/01-desktop-shell-project-foundation/01-UI-SPEC.md
    </read_first>
    <action>Implement TopToolbar so it visibly displays current mode, active project label or empty-project state, and current model selector/control. Include a mode switch control in the toolbar, a model dropdown/control in the toolbar, and a project control surface in the toolbar. Implement CenterWorkspace placeholder views for: project mode home, pure conversation mode home, and project session list. Mode switching must update the center workspace view without relying on hidden menus, and model switching must update top-level UI state only.</action>
    <acceptance_criteria>
- src/app/layout/TopToolbar.tsx contains visible mode control markup
- src/app/layout/TopToolbar.tsx contains visible project control markup
- src/app/layout/TopToolbar.tsx contains visible model control markup
- src/app/layout/CenterWorkspace.tsx contains project mode home state
- src/app/layout/CenterWorkspace.tsx contains pure conversation mode home state
- src/app/layout/CenterWorkspace.tsx contains project session list state
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read src/App.tsx and confirm AppShell is the root UI
- Read shell layout components and confirm five-region composition exists
- Run frontend tests or app build once wiring exists to confirm shell renders without import errors
