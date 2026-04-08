---
phase: 03-sidebar-navigation-keyboard-interaction
plan: 02
subsystem: keyboard-interaction
tags: [keybindings, shortcuts, macos, settings]
dependency_graph:
  requires: [01-01-design-system, 03-01-sidebar-navigation]
  provides: [global-keybindings, keyboard-shortcuts-config]
  affects: [app-shell, right-panel, project-picker]
tech_stack:
  added: [useGlobalKeybindings-hook]
  patterns: [window-event-listener, macos-option-mapping]
key_files:
  created:
    - src/app/hooks/useGlobalKeybindings.ts
  modified:
    - src/app/state/appShellStore.ts
    - src/app/layout/AppShell.tsx
    - src/app/layout/RightPanel.tsx
decisions:
  - title: Use window keydown listener
    rationale: Global shortcuts need to work anywhere in app, not just focused elements
    alternatives: [Document listener, Per-component listeners]
    chosen: Window listener with cleanup in useEffect
  - title: Support macOS Option key mapping
    rationale: Official Claude Code Desktop supports Option+t/o/e on macOS
    alternatives: [Windows-only, Add separate macOS shortcuts]
    chosen: Detect Option key special characters (†/ø/´)
  - title: Make keybindings configurable
    rationale: Users may have conflicting shortcuts or prefer to disable
    alternatives: [Always enabled, Per-shortcut config]
    chosen: Global enable/disable + macOS mapping toggle
metrics:
  duration_minutes: 12
  tasks_completed: 3
  files_modified: 4
  lines_added: 114
  lines_removed: 1
  commits: 1
  commit_hash: 73df34e
completed_at: 2026-04-08T13:12:00Z
---

# Phase 3 Plan 2: Global Keybindings System Summary

**One-liner:** Global keyboard shortcuts (ctrl+t/o/e) with macOS Option key mapping and settings panel configuration

## What Was Built

Implemented global keybindings system matching official Claude Code Desktop shortcuts:

1. **useGlobalKeybindings hook** - Window keydown listener with preventDefault for ctrl+t/o/e
2. **macOS Option key support** - Detects †/ø/´ characters from Option+t/o/e
3. **Store configuration** - Added `keybindingsEnabled` and `macOSOptionMappingEnabled` state
4. **Settings panel UI** - Added keyboard shortcuts section with enable/disable toggles
5. **AppShell integration** - Hook registered at top level with config from store

## Key Changes

### useGlobalKeybindings.ts (new)
- Window keydown event listener with cleanup
- ctrl+t → `createProjectSession()`
- ctrl+o → `pickProjectDirectory()` + `setActiveProject()`
- ctrl+e → `setRightPanelView('settings')` + `setRightPanelOpen(true)`
- macOS Option key detection: †/ø/´ characters
- Configurable enable/disable via props

### appShellStore.ts
- Added `keybindingsEnabled: boolean` (default true)
- Added `macOSOptionMappingEnabled: boolean` (default true)
- Added `setKeybindingsEnabled` and `setMacOSOptionMappingEnabled` methods

### AppShell.tsx
- Import and call `useGlobalKeybindings` hook
- Pass config from store: `{ enabled: keybindingsEnabled, macOSOptionMapping: macOSOptionMappingEnabled }`

### RightPanel.tsx
- Added "Keyboard shortcuts" settings section
- Toggle for "Enable global keyboard shortcuts"
- Conditional toggle for "Enable macOS Option key mapping" (only when keybindings enabled)
- Helper text showing shortcut mappings

## Deviations from Plan

None - plan executed exactly as written.

## Testing

**Build:** ✓ Passing  
**Manual verification:** ctrl+t creates session, ctrl+o opens project picker, ctrl+e opens settings, toggles work in settings panel

## Known Issues

None

## Next Steps

- Plan 03-03: Implement input history navigation (↑/↓)
- Plan 03-04: Add E2E tests for keyboard navigation

---

*Completed as part of Phase 3 Wave 1*
