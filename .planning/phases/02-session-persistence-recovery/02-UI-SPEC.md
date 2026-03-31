---
phase: 2
slug: session-persistence-recovery
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-30
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for Session Persistence & Recovery.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | custom React primitives on existing shell |
| Icon library | none yet — text-first controls in this phase |
| Font | Inter, "Segoe UI", sans-serif |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Status dot gaps, inline metadata separation |
| sm | 8px | Compact row spacing, chip gaps, inline actions |
| md | 16px | Default card padding, row padding, form spacing |
| lg | 24px | Section padding, list/header separation |
| xl | 32px | Main workspace gutters, filter-and-list separation |
| 2xl | 48px | Empty-state vertical spacing |
| 3xl | 64px | Major top-level workspace breathing room |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 12px | 600 | 1.2 |
| Heading | 20px | 600 | 1.3 |
| Display | 32px | 600 | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #131722 | App background and main workspace surfaces |
| Secondary (30%) | #111620 | Sidebar, right panel, list cards, filter bar, inactive chips |
| Accent (10%) | #4F7CFF | Active session row highlight, selected filter chip, focused input ring, primary "New Session" action |
| Destructive | #D96A6A | Clear/remove session action and destructive confirmation emphasis only |

Accent reserved for: primary "New Session" button, active session row border/background, selected project filter chip, keyboard focus ring, active recovery banner action link

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | New Session |
| Empty state heading | No sessions for this view yet |
| Empty state body | Start a new session for the selected project, or clear the filter to reopen earlier work. |
| Error state | We couldn’t load session history. Try again, and if the problem persists restart the app to reload local session data. |
| Destructive confirmation | Remove session from history: Remove this session from local history? This does not delete project files. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable |

---

## Layout Extension Contract

Phase 2 extends the Phase 1 shell. Do not redesign the five-region layout.

### Top toolbar
Must continue showing active mode, active project, and active model. Add one lightweight session-status cluster:
- active session title or fallback label
- session status pill
- last activity timestamp in compact secondary text

The toolbar remains the always-visible context anchor. Session metadata is supplementary and must not displace project/model visibility.

### Left sidebar
Replace placeholder recent sessions with real data.

Sidebar contract:
- Keep **Recent Sessions** above **Projects**
- Show the 5 most recently active sessions globally
- Each row is one-click resume
- Rows include: session title, project name, relative last-activity time, and compact status indicator
- Active session row uses accent treatment
- If there are no sessions, show a compact helper line: "No recent sessions yet"

The sidebar is a quick-return surface, not the full management surface.

### Center workspace
The `project-sessions` workspace becomes the primary session-management surface for this phase.

It must support these screen states:
1. default history list
2. filtered-by-project history list
3. loading state
4. empty state
5. error state
6. resume-in-progress overlay/banner

Primary focal point: the session history list in the center workspace.

### Right panel
Keep the existing context/details role. For Phase 2 it may show lightweight session detail only:
- project
- model
- created time
- last activity
- recent activity summary

Do not turn the right panel into a required intermediate resume screen.

### Bottom panel
No new Phase 2 requirements beyond preserving shell consistency. It may optionally show recovery/log messages, but is not the primary session UX.

---

## Session List Contract

### Canonical list model
Use one global session list as the canonical source.
- Default sort: most recent activity first
- Project filtering narrows the same list; it does not switch to a different data model
- Selecting a row resumes that session directly

### Row content
Each session row must show exactly these visible fields:
- session title
- project name
- effective model
- relative last activity time
- status label
- one-line recent activity summary

Optional secondary detail:
- absolute timestamp on hover/secondary text

Do not show more than two lines of metadata below the title.

### Row hierarchy
Visual priority inside each row:
1. session title
2. recent activity summary
3. project + model + time metadata line
4. status pill

The row should read as resumable work, not as a file browser item.

### Row interaction
- Entire row is clickable
- Primary action on click: resume session immediately
- Hover/focus state must clearly indicate resumable action
- Keyboard focus and selection are required
- Destructive/remove action, if present, must be visually secondary and require confirmation

No intermediate read-only detail page.

---

## Filter & Navigation Contract

### Project filter
The center workspace must expose a lightweight project filter above the session list.

Filter behavior:
- Default filter: All projects
- Project-specific filter label uses project name
- Clearing the filter returns to the global list immediately
- Filter changes do not reset sort order

Recommended control style: compact chips or a compact dropdown, depending on available width. Use the simpler control that fits the existing shell patterns.

### New session entry
A visible primary action must exist near the history list header:
- label: **New Session**
- behavior: create a new session tied to the selected/active project
- if no active project is selected in project mode, disable the button and explain why inline

### Resume navigation
When a user resumes a session, the app must:
1. restore project context
2. restore effective model context
3. restore recent activity state
4. route the shell into the active session workspace

This transition should feel immediate and intentional, with visible progress if loading takes noticeable time.

---

## State Contract

### Loading state
Use skeleton or subdued placeholder rows inside the same list layout.
- keep header and filters visible
- show 5–7 placeholder rows
- copy: no loading paragraph needed if skeletons are clear

### Empty state
Use when the list is valid but contains no sessions for the current filter.

Contract:
- heading: **No sessions for this view yet**
- body: **Start a new session for the selected project, or clear the filter to reopen earlier work.**
- primary action: **New Session**
- secondary action: **Clear Filter** only when a project filter is active

### Error state
Use an inline error card in the center workspace list area.

Contract:
- explain the failure plainly
- include a retry action labeled **Reload History**
- preserve current filter context when retrying

### Resume-in-progress state
When a historical session is selected, show a lightweight non-blocking recovery banner or inline loading state.

Copy baseline:
- heading: **Restoring session**
- body: **Reloading project, model, and recent activity…**

This state should not look like a modal wizard.

### Restored session state
Once resume completes, the visible shell must reflect:
- active project in toolbar
- active/effective model in toolbar
- active session highlight in sidebar/history list
- recent activity summary somewhere in the active session area or right panel

---

## Session Status Contract

Allowed status labels for Phase 2:
- Active
- Idle
- Needs attention
- Complete

Rules:
- status labels must be short and scannable
- do not invent many nuanced sub-states
- status color alone is insufficient; always show label text
- recent activity summary carries most of the nuance, status remains lightweight

---

## Recovery UX Contract

Boot-time recovery may restore the last active/resumable session.

If recovery is attempted on app start:
- show a subtle banner in the center workspace, not a blocking modal
- heading: **Session restored**
- body: **Reopened your last active session for {project name}.**
- optional secondary text may name the model if useful

If recovery fails:
- keep the app usable
- fall back to the session history list
- show inline error copy with **Reload History** action

Phase 2 restores only lightweight operational context:
- associated project
- effective model
- recent activity state
- transcript/session continuity data needed to continue

Do not restore fine-grained panel toggles or visual chrome preferences in this phase.

---

## Accessibility & Usability Constraints

- All resume actions must be keyboard reachable
- Session rows must have visible focus state using the accent ring
- Status, warning, and error states must not rely on color alone
- Relative timestamps must remain readable at common desktop widths
- Project filter control must remain usable without hover-only interaction
- Empty/error states must offer a clear next step

---

## Phase Boundary

This contract intentionally includes:
- session history browsing
- project filtering
- session creation entry point
- direct session resume
- lightweight recovery messaging
- restored project/model/activity visibility

This contract intentionally excludes:
- full conversation composer/message design system
- streaming assistant response UI
- command approval cards
- execution output viewer
- diff review UI
- advanced preset/skills management
- highly customized multi-step session workflows

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-30
