---
phase: 01-topbar-visual-foundation
plan: 02
subsystem: toolbar
tags: [ui-simplification, lightweight-chrome, desktop-shell]
dependency_graph:
  requires: [01-01]
  provides: [simplified-toolbar, 48px-chrome]
  affects: [TopToolbar, app-shell-layout]
tech_stack:
  added: []
  patterns: [3-element-layout, breadcrumb-badge, centered-model-selector]
key_files:
  created: []
  modified:
    - src/app/layout/TopToolbar.tsx
    - src/styles/app-shell.css
decisions:
  - Toolbar height reduced to 48px (from 56px) for lightweight chrome feel
  - Project picker moved to sidebar (Phase 3), session info moved to session header (Phase 2)
  - Context and Settings merged into single settings button
  - Breadcrumb shows only last path segment with 200px max-width
metrics:
  duration: 8min
  tasks_completed: 3
  files_modified: 2
  completed_at: 2026-04-08T12:38:00Z
---

# Phase 1 Plan 2: 简化顶栏为轻量 chrome Summary

**One-liner:** Reduced toolbar to 48px height with 3-element layout (breadcrumb + model selector + settings), removing project picker, session context stack, status chip, and context button.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Adjust toolbar height to 48px | f993a0e |
| 2 | Simplify TopToolbar to 3-element layout | f201bf8 |
| 3 | Add simplified toolbar CSS styles | f201bf8 |

## Deviations from Plan

None - plan executed exactly as written.

## Key Changes

### Toolbar Height Reduction
- Changed from 56px to 48px in grid-template-rows
- Aligns with official lightweight chrome standards (32-48px range)
- Provides more vertical space for content area

### Component Simplification
**Removed elements:**
- Project picker button (FolderOpen icon + path) → moving to sidebar in Phase 3
- Session context stack (3 lines: session title, workspace, metadata) → moving to session header in Phase 2
- Status chip (desktop workflow status) → moving to session header in Phase 2
- Context button (Shield icon) → merged into Settings

**Retained elements:**
1. **Breadcrumb (left):** Project name badge with 200px max-width, ellipsis overflow
2. **Model selector (center):** Dropdown for claude-opus/sonnet/haiku
3. **Settings button (right):** Single icon button to open settings panel

### Code Cleanup
- Removed unused imports: FolderOpen, Shield, useEffect
- Removed unused services: projectService, credentialService
- Removed unused state: mode, activeSession, credentialStatus, activeSessionModelOverride, getDesktopWorkflow
- Removed helper functions: formatRelativeTime, truncateWorkspacePath, statusTone
- Simplified from 165 lines to 63 lines (62% reduction)

### CSS Additions
- `.toolbar__breadcrumb` - flex container for left section
- `.toolbar__project-badge` - pill-shaped badge with subtle background
- `.toolbar__center` - centered flex container for model selector
- `.toolbar__actions` - right-aligned flex container for settings button

## Verification Results

- ✓ Toolbar height is 48px
- ✓ TopToolbar has 3 className elements (breadcrumb, center, actions)
- ✓ CSS contains 4 new style definitions
- ✓ All E2E tests passing (startup 5/5)
- ✓ No regressions in model selector functionality

## Requirements Satisfied

- REQ-01: Lightweight chrome established (48px height, minimal elements)
- REQ-07: Desktop GUI advantages preserved (rounded badge, hover states, smooth transitions)

## Self-Check: PASSED

**Files modified:**
- ✓ src/styles/app-shell.css contains grid-template-rows: 48px
- ✓ src/styles/app-shell.css contains 4 new toolbar style classes
- ✓ src/app/layout/TopToolbar.tsx simplified to 3-element layout
- ✓ src/app/layout/TopToolbar.tsx removed unused imports and state

**Commits verified:**
- ✓ f993a0e: feat(01-02): adjust toolbar height to 48px
- ✓ f201bf8: feat(01-02): simplify toolbar to 3-element lightweight chrome
