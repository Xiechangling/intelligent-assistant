---
plan_id: "03"
phase: "02"
title: "Implement session history, filtering, and direct resume UI"
wave: 3
depends_on:
  - "01"
  - "02"
files_modified:
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/app/layout/LeftSidebar.tsx"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/RightPanel.tsx"
  - "src/app/state/appShellStore.ts"
  - "src/styles/app-shell.css"
requirements_addressed:
  - "SESS-01"
  - "SESS-02"
  - "SESS-03"
  - "SESS-04"
autonomous: true
---

## Objective
Replace placeholder session surfaces with a real session history and resume experience that follows the approved mainstream UX: one canonical list, project filtering, direct resume, and lightweight recovery messaging.

## Must Haves
- Center workspace becomes the primary history-management surface for project sessions
- Left sidebar shows the five most recently active sessions globally for quick return
- Users can create a new session for the active project and resume any listed session directly

<tasks>
  <task id="03.1">
    <objective>Implement the center-workspace session history states and project filter.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/styles/app-shell.css
- .planning/phases/02-session-persistence-recovery/02-UI-SPEC.md
    </read_first>
    <action>Replace the project-sessions placeholder in src/app/layout/CenterWorkspace.tsx with the real session-management surface. Render the canonical session list sorted by most recent activity first, keep header and filters visible, and support default, filtered, loading, empty, error, and resume-in-progress states defined in the UI contract. Expose a visible primary "New Session" action near the history header, and when no active project exists in project mode, disable the action with inline explanation.</action>
    <acceptance_criteria>
- src/app/layout/CenterWorkspace.tsx renders a session list when activeShellView is project-sessions
- center workspace renders one canonical history list with optional project filter control
- center workspace renders loading, empty, error, and resume-in-progress states in the list area
- center workspace renders a visible New Session action near the session-history header
- New Session is disabled with inline explanation when no active project is selected
    </acceptance_criteria>
  </task>

  <task id="03.2">
    <objective>Implement sidebar recent-session quick resume behavior.</objective>
    <read_first>
- src/app/layout/LeftSidebar.tsx
- src/app/state/appShellStore.ts
- .planning/phases/02-session-persistence-recovery/02-UI-SPEC.md
    </read_first>
    <action>Update LeftSidebar so the Recent Sessions section uses real session data instead of placeholders. Show the five most recently active sessions globally, with each row exposing session title, project name, relative last-activity time, and compact status indicator. Clicking a row must resume that session directly and apply active-row styling for the currently open session.</action>
    <acceptance_criteria>
- src/app/layout/LeftSidebar.tsx no longer relies on hard-coded placeholder sessions
- sidebar recent sessions are sourced from persisted session history state
- sidebar shows at most five globally recent sessions
- clicking a sidebar session row triggers direct resume behavior
- active session row receives visible active treatment distinct from inactive rows
    </acceptance_criteria>
  </task>

  <task id="03.3">
    <objective>Create session-row presentation and recovery messaging that matches the Phase 2 UI contract.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/layout/LeftSidebar.tsx
- src/styles/app-shell.css
- .planning/phases/02-session-persistence-recovery/02-UI-SPEC.md
    </read_first>
    <action>Update the session row and supporting CSS so each row shows session title, recent activity summary, project name, effective model, relative last-activity time, and status label. Provide keyboard-reachable row focus states, accent treatment for active selection, a lightweight "Restoring session" banner during resume, and a subtle "Session restored" startup banner when boot-time recovery succeeds. Preserve the existing five-region shell layout and keep the right panel optional rather than required for resume.</action>
    <acceptance_criteria>
- session rows show title, summary, project, model, relative time, and status label
- session rows are fully clickable and keyboard reachable with visible focus state
- active session is highlighted in the sidebar and/or center history surface
- resume flow shows lightweight restoring feedback instead of a blocking modal
- successful startup recovery can display a subtle restored-session banner without interrupting the shell
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read CenterWorkspace.tsx and confirm project-sessions renders the canonical list, project filter, New Session action, and all required UI states
- Read LeftSidebar.tsx and confirm it uses real recent-session data with direct click-to-resume behavior
- Read styles and component markup and confirm active, focus, loading, error, and recovery states are represented without redesigning the shell
- Confirm session rows and recovery messages expose status with text labels and do not rely on color alone
