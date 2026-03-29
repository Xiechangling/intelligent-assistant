---
plan_id: "03"
phase: "01"
title: "Implement project selection persistence and secure credential foundation"
wave: 2
depends_on:
  - "01"
  - "02"
files_modified:
  - "src-tauri/src/project_service.rs"
  - "src-tauri/src/credential_service.rs"
  - "src-tauri/src/lib.rs"
  - "src/app/services/projectService.ts"
  - "src/app/services/credentialService.ts"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/LeftSidebar.tsx"
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/app/layout/RightPanel.tsx"
  - "src/app/state/appShellStore.ts"
  - "src/app/state/types.ts"
requirements_addressed:
  - "PROJ-01"
  - "PROJ-02"
  - "PROJ-03"
  - "SECR-01"
autonomous: true
---

## Objective
Implement native project-folder selection, recent-project persistence, warning-but-continue handling for non-standard folders, and a secure credential service foundation exposed through the shell UI.

## Must Haves
- User can choose a local folder as a project and reopen recent projects later
- Non-standard project folders produce warning-but-continue behavior
- Credential status is visible and backed by secure storage foundation rather than plaintext config

<tasks>
  <task id="03.1">
    <objective>Create native project-folder selection and recent-project persistence services.</objective>
    <read_first>
- src-tauri/src/lib.rs
- src/app/state/appShellStore.ts
- .planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md
- .planning/phases/01-desktop-shell-project-foundation/01-RESEARCH.md
    </read_first>
    <action>Create src-tauri/src/project_service.rs and expose Tauri commands through src-tauri/src/lib.rs for: selecting a folder, checking whether the folder resembles a standard project, listing saved recent projects, and persisting a selected project as a recent entry. A standard-project check must look for at least one of these markers: .git directory, package.json, pyproject.toml, Cargo.toml, or requirements.txt. Return both the absolute normalized path and a warning flag when none of those markers exist.</action>
    <acceptance_criteria>
- src-tauri/src/project_service.rs exists
- src-tauri/src/project_service.rs contains a folder-selection command
- src-tauri/src/project_service.rs contains standard-project detection for .git, package.json, pyproject.toml, Cargo.toml, or requirements.txt
- src-tauri/src/project_service.rs contains recent-project persistence logic
- src-tauri/src/lib.rs registers the project service commands
    </acceptance_criteria>
  </task>

  <task id="03.2">
    <objective>Wire frontend project controls to native project services.</objective>
    <read_first>
- src/app/services/projectService.ts
- src/app/layout/TopToolbar.tsx
- src/app/layout/LeftSidebar.tsx
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
    </read_first>
    <action>Create src/app/services/projectService.ts to call the native project commands. Update TopToolbar and LeftSidebar so both can trigger project selection and project switching. When a project is selected, store it in recentProjects, set activeProjectPath, and route the shell to 'project-sessions'. If the selected folder lacks standard-project markers, surface a warning state in the UI and still allow continuing with the selected path.</action>
    <acceptance_criteria>
- src/app/services/projectService.ts exists
- src/app/services/projectService.ts calls native project commands
- src/app/layout/TopToolbar.tsx triggers project selection or switching
- src/app/layout/LeftSidebar.tsx triggers project selection or switching
- src/app/state/appShellStore.ts stores recentProjects and activeProjectPath after selection
- src/app/layout/CenterWorkspace.tsx shows project-sessions view after project selection
- at least one UI component contains warning text or warning state for non-standard project folders
    </acceptance_criteria>
  </task>

  <task id="03.3">
    <objective>Create secure credential storage foundation and visible credential-status surfaces.</objective>
    <read_first>
- src-tauri/src/lib.rs
- src/app/layout/TopToolbar.tsx
- src/app/layout/RightPanel.tsx
- src/app/state/types.ts
- .planning/phases/01-desktop-shell-project-foundation/01-UI-SPEC.md
    </read_first>
    <action>Create src-tauri/src/credential_service.rs and expose native commands for storing, reading status for, replacing, and clearing an API credential using an OS-backed secure storage approach rather than plain JSON/localStorage/app config. Create src/app/services/credentialService.ts to call those commands. Update appShellStore.ts, TopToolbar.tsx, and RightPanel.tsx so the UI can display credential status values 'missing', 'configured', or 'error' and expose a visible entry point for adding or changing credentials from the shell.</action>
    <acceptance_criteria>
- src-tauri/src/credential_service.rs exists
- src-tauri/src/credential_service.rs contains store, status, replace, or clear credential operations
- src-tauri/src/lib.rs registers credential service commands
- src/app/services/credentialService.ts exists
- src/app/state/appShellStore.ts contains credentialStatus values missing, configured, or error
- src/app/layout/TopToolbar.tsx or src/app/layout/RightPanel.tsx displays credential status
- no frontend file stores raw API key values in localStorage or plain JSON config logic
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read native project service and confirm warning-but-continue detection markers are implemented
- Read credential service and confirm secure-storage path is used instead of plaintext persistence
- Read toolbar/sidebar/right-panel code and confirm project/credential flows are reachable from the shell
