# Phase 1: Desktop Shell & Project Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-desktop-shell-project-foundation
**Areas discussed:** App shell layout, Model controls, Project switching, Mode structure

---

## App shell layout

| Option | Description | Selected |
|--------|-------------|----------|
| Three-column workbench | Left navigation, center workspace, right details/settings | |
| Two-column + top toolbar | Cleaner MVP shell with left nav and central workspace | |
| IDE style | IDE-like shell with central workspace, supporting panes, and heavier tool feel | ✓ |
| Other | Custom layout described by user | |

**User's choice:** IDE style
**Notes:** User wants the product to feel like a serious developer tool rather than a generic chat app.

### Center organization

| Option | Description | Selected |
|--------|-------------|----------|
| Chat-first | Chat remains the main workspace; settings/details enter through supporting panels | ✓ |
| Tabbed center | Main workspace switches between tabs such as chat/settings/diff | |
| Split workspace | Chat remains permanently side-by-side with other panels | |
| Other | Custom center organization | |

**User's choice:** Chat-first
**Notes:** Chat should keep the main visual priority even inside an IDE-style shell.

### Left navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Project-first | Projects first, sessions underneath | |
| Session-first | Recent sessions first with project labels | |
| Grouped mixed | Top recent sessions + lower project list | ✓ |
| Other | Custom navigation grouping | |

**User's choice:** Grouped mixed
**Notes:** User wants both fast session return and multi-project visibility.

### Terminal/log placement

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom panel | IDE-style collapsible bottom panel | ✓ |
| Right panel | Logs/terminal shown on the right | |
| On demand | Hidden until needed | |
| Other | Custom placement | |

**User's choice:** Bottom panel
**Notes:** Aligns with established developer-tool expectations.

### Right-side role

| Option | Description | Selected |
|--------|-------------|----------|
| Context details | Focus on active project/model/session context | |
| Settings/config | Focus on configuration tasks | |
| Dynamic panel | Context by default, switches to settings/details as needed | ✓ |
| No right sidebar | Defer right-side surface in MVP | |

**User's choice:** Dynamic panel
**Notes:** User wants flexibility without losing context visibility.

### Top bar style

| Option | Description | Selected |
|--------|-------------|----------|
| Light status bar | Mostly status and settings entry | |
| Action toolbar | Frequent controls for project/model/session/settings | ✓ |
| Minimal | Only title/window controls | |
| Other | Custom top bar design | |

**User's choice:** Action toolbar
**Notes:** High-frequency controls belong in the toolbar.

---

## Model controls

| Option | Description | Selected |
|--------|-------------|----------|
| Global default + session override | App-level default with per-session model override | ✓ |
| Pure global | One model for the whole app | |
| Pure session-level | Each session picks independently without strong global default | |
| Other | Custom behavior | |

**User's choice:** Global default + session override
**Notes:** User explicitly added that model changes should be allowed during an active session.

### Change effect

| Option | Description | Selected |
|--------|-------------|----------|
| Affect next turns | Keep the session, apply the new model only to future turns/tasks | ✓ |
| Fork session | Create a new branched session on model switch | |
| Ask each time | Prompt every time whether to fork or stay | |
| Other | Custom switch effect | |

**User's choice:** Affect next turns
**Notes:** Keeps the interaction lightweight for MVP.

### Main switch entry

| Option | Description | Selected |
|--------|-------------|----------|
| Toolbar dropdown | Persistent model dropdown in top toolbar | ✓ |
| Modal picker | Dedicated chooser panel/modal | |
| In settings panel | Model change lives only in config/settings panel | |

**User's choice:** Toolbar dropdown
**Notes:** Matches the chosen action-toolbar shell.

### Post-switch visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit prompt-level notice | Insert a timeline/system notice inside the session | |
| Update top state only | Reflect the new model only in visible app chrome | ✓ |
| Both | Update chrome and insert a light timeline notice | |
| Other | Custom feedback | |

**User's choice:** Update top state only
**Notes:** User prefers a cleaner session transcript.

---

## Project switching

| Option | Description | Selected |
|--------|-------------|----------|
| Open local folder | Select a local folder as the project entry | ✓ |
| Recent + manual add | Folder opening plus explicit managed project list flow | |
| Workspace collection | Heavier multi-project workspace management | |
| Other | Custom project-entry flow | |

**User's choice:** Open local folder
**Notes:** Closest to current Claude Code behavior.

### Remember opened projects

| Option | Description | Selected |
|--------|-------------|----------|
| Remember recents | Store opened projects and show them again | ✓ |
| Current only | Only keep the current project | |
| Pinned + recents | Support two project groups | |
| Other | Custom project memory | |

**User's choice:** Remember recents
**Notes:** Supports the mixed navigation concept.

### Switch entry

| Option | Description | Selected |
|--------|-------------|----------|
| Toolbar | Top toolbar switch only | |
| Sidebar header | Left navigation only | |
| Both | Toolbar and left navigation both switch the active project | ✓ |
| Other | Custom entry points | |

**User's choice:** Both
**Notes:** User wants project switching to stay highly accessible.

### After switching project

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-open session | Jump straight into a new session | |
| Show project sessions | Show that project's session list first | ✓ |
| Project overview | Show project home/overview | |
| Other | Custom post-switch destination | |

**User's choice:** Show project sessions
**Notes:** User wants explicit control over resume vs new session.

### Non-standard folder handling

| Option | Description | Selected |
|--------|-------------|----------|
| Allow silently | Treat any folder as acceptable | |
| Warn but continue | Show that it may not be a standard project, but allow opening | ✓ |
| Strict validation | Only accept folders that look like supported project types | |
| Other | Custom validation behavior | |

**User's choice:** Warn but continue
**Notes:** Keeps the app practical without over-restricting entry.

---

## Mode structure

| Option | Description | Selected |
|--------|-------------|----------|
| Startup mode choice | Ask at launch which mode to enter | |
| In-app mode switch | Switch between pure conversation and project mode from app chrome | ✓ |
| Default pure conversation | Start as a general chat app and escalate to project mode | |
| Default project mode | Start project-first and only later drop to pure conversation | |

**User's choice:** In-app mode switch
**Notes:** User added that the current mode should be visibly displayed.

### Mode switch location

| Option | Description | Selected |
|--------|-------------|----------|
| Toolbar switch | Persistent toolbar control showing current mode | ✓ |
| Sidebar switch | Mode change in left navigation | |
| Display top, switch side | Visible top status with switch in side panel | |
| Other | Custom mode switch location | |

**User's choice:** Toolbar switch
**Notes:** Consistent with other high-frequency controls.

### After switching mode

| Option | Description | Selected |
|--------|-------------|----------|
| Mode-specific home | Project mode goes to project flow; pure conversation goes to ordinary conversation/session home | ✓ |
| Unified home | Always return to one central home page | |
| Stay in place | Change mode state without redirecting UI | |
| Other | Custom switch routing | |

**User's choice:** Mode-specific home
**Notes:** This keeps each mode coherent.

## Claude's Discretion

- Exact shell styling and component implementation
- Exact phrasing for warnings and mode labels
- Exact visual treatment of mixed left navigation and dynamic right panel

## Deferred Ideas

- Full pure-conversation-mode interaction details beyond Phase 1 shell/routing support
- Credential setup flow details were deferred and not discussed in this session
