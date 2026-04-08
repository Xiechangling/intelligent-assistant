---
phase: 03-sidebar-navigation-keyboard-interaction
plan: 01
subsystem: ui-shell
tags: [sidebar, navigation, project-picker, ui-simplification]
dependency_graph:
  requires: [01-02-topbar-simplification, 02-02-session-header]
  provides: [pure-navigation-sidebar, sidebar-project-picker]
  affects: [left-sidebar, top-toolbar]
tech_stack:
  added: []
  patterns: [always-visible-lists, no-collapse-state]
key_files:
  created: []
  modified:
    - src/app/layout/LeftSidebar.tsx
    - src/app/layout/TopToolbar.tsx
    - src/styles/app-shell.css
decisions:
  - title: Remove brand area from sidebar
    rationale: Align with official Claude Code Desktop's minimal sidebar design
    alternatives: [Keep brand area but smaller, Move brand to topbar]
    chosen: Remove completely
  - title: Remove expand/collapse logic
    rationale: Simplify UX - lists always visible, no hidden state to manage
    alternatives: [Keep collapse but default expanded, Add collapse animation]
    chosen: Remove all collapse logic
  - title: Move project picker to sidebar top
    rationale: Project selection is navigation, belongs in sidebar not topbar
    alternatives: [Keep in topbar, Add to both locations]
    chosen: Move to sidebar with ctrl+o hint
metrics:
  duration_minutes: 15
  tasks_completed: 3
  files_modified: 3
  lines_added: 105
  lines_removed: 138
  commits: 1
  commit_hash: cda7b72
completed_at: 2026-04-08T13:10:00Z
---

# Phase 3 Plan 1: Left Sidebar Navigation Summary

**One-liner:** Pure navigation sidebar with project picker at top, no brand area or collapse logic

## What Was Built

Simplified left sidebar to pure navigation list matching official Claude Code Desktop pattern:

1. **Removed brand area** - Eliminated `.sidebar__section--brand` with Claude Desktop logo/text
2. **Removed expand/collapse logic** - Deleted toggle buttons, chevron icons, and expanded state management
3. **Moved project picker to sidebar top** - Added `.sidebar__project-picker` section with "Open workspace" button and ctrl+o hint
4. **Simplified topbar** - Removed project breadcrumb, now only model selector + settings button
5. **Always-visible lists** - Project and session lists always shown, no hidden state

## Key Changes

### LeftSidebar.tsx
- Removed `sidebarProjectsExpanded` and `sidebarSessionsExpanded` state
- Removed `ChevronDown`/`ChevronRight` icons and toggle buttons
- Added project picker section at top with `KeyboardShortcutHint`
- Simplified section headers to static titles (no click handlers)
- Lists always render (no conditional based on expanded state)

### TopToolbar.tsx
- Removed `activeProjectPath` state read
- Removed project breadcrumb rendering (`.toolbar__breadcrumb`)
- Simplified to 2-element layout: center (model selector) + right (settings)

### app-shell.css
- Removed `.sidebar__section--brand`, `.sidebar__brand-mark`, `.sidebar__brand-copy` styles
- Removed `.sidebar__section-toggle` styles
- Added `.sidebar__project-picker`, `.sidebar__project-name`, `.sidebar__project-button` styles

## Deviations from Plan

None - plan executed exactly as written.

## Testing

**Build:** ✓ Passing  
**Manual verification:** Sidebar shows project picker at top, no brand area, no collapse buttons

## Known Issues

None

## Next Steps

- Plan 03-02: Implement global keybindings (ctrl+t/o/e)
- Plan 03-03: Implement input history navigation
- Plan 03-04: Add E2E tests for keyboard navigation

---

*Completed as part of Phase 3 Wave 1*
