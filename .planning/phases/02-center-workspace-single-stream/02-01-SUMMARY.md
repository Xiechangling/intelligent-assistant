---
phase: 02
plan: 01
subsystem: center-workspace
tags: [ui, interaction, inline-cards, bottom-tray]
dependency_graph:
  requires: []
  provides: [inline-card-tray-linkage]
  affects: [center-workspace, bottom-panel]
tech_stack:
  added: []
  patterns: [click-handlers, zustand-store-integration, hover-states]
key_files:
  created: []
  modified:
    - src/app/layout/CenterWorkspace.tsx
    - src/styles/app-shell.css
decisions:
  - Use zustand store methods (setBottomPanelExpanded, setBottomPanelTab) for state management
  - Add visual expand hints (ChevronDown icon + text) to guide user interaction
  - Different click behaviors per card type (approval auto-shows, status/review switch tabs)
metrics:
  duration_minutes: 15
  tasks_completed: 3
  files_modified: 2
  commits: 3
  completed_at: 2025-01-20
---

# Phase 2 Plan 01: Inline Card and Bottom Tray Linkage Summary

**One-liner:** Inline cards now expand bottom tray on click with visual hints and hover states

## Objective

Make inline cards (approval, status, review) clickable to expand the bottom tray panel, providing seamless navigation from summary to detailed view.

## Tasks Completed

### Task 1: Add Click Handlers to Inline Cards
- Added `handleExpand` to InlineApprovalSummary - expands tray (approval mode auto-activates)
- Added `handleCardClick` to InlineWorkflowStatusSummary - expands tray and switches to 'output' tab
- Added `handleReviewClick` to InlineReviewSummary - expands tray, switches to 'review' tab, selects file
- Integrated with useAppShellStore for state management
- **Commit:** 60a9969

### Task 2: Add Interactive State Styles
- Added `.workspace__inline-surface--clickable` class with cursor pointer
- Implemented hover state with border highlight, subtle background gradient, and translateY lift
- Added active state with pressed effect (translateY 0, reduced opacity)
- Used 160ms ease transitions for smooth interactions
- **Commit:** ec931c3

### Task 3: Add Visual Expand Hints
- Added `.workspace__inline-expand-hint` component with ChevronDown icon
- Positioned at bottom of each clickable card with "Click to expand details" text
- Styled with tertiary text color and 12px font size
- Icon and text aligned with 6px gap
- **Commit:** c2b1460

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- ✅ Inline approval card expands bottom tray on click
- ✅ Inline status card expands tray and shows output tab
- ✅ Inline review card expands tray, shows review tab, and selects file
- ✅ Hover states provide visual feedback
- ✅ ChevronDown hints guide user interaction
- ✅ TypeScript compilation passes
- ✅ Production build succeeds

## Key Files Modified

**src/app/layout/CenterWorkspace.tsx**
- Added click handlers to all three inline card components
- Integrated zustand store methods for tray control
- Added ChevronDown icon imports and expand hint markup

**src/styles/app-shell.css**
- Added `.workspace__inline-surface--clickable` with hover/active states
- Added `.workspace__inline-expand-hint` styling
- Used CSS custom properties for consistent spacing and colors

## Technical Notes

- Approval mode doesn't need explicit tab switching - pendingProposal presence auto-activates approval UI
- Status and review cards use `setBottomPanelTab()` to switch to appropriate tab
- Review card also calls `setSelectedReviewFile()` to pre-select the first file
- Hover effect uses subtle gradient and 1px lift for premium feel
- All transitions use 160ms ease for consistent timing

## Self-Check: PASSED

✅ All modified files exist
✅ All commits verified in git history
