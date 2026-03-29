# UI Design Contract — Phase 1: Desktop Shell & Project Foundation

**Phase:** 1
**Phase name:** Desktop Shell & Project Foundation
**Date:** 2026-03-30
**Status:** Drafted for approval

## 1. Purpose

Define the visual and interaction contract for the Windows-first desktop shell of Intelligent Assistant. This phase locks the app’s primary workspace layout, navigation zones, high-frequency control surfaces, and the first-pass UX for project selection, mode switching, model controls, and credential status.

This contract covers shell structure and foundational interaction behavior only. It does not specify later deep conversation, execution, or diff workflows beyond the placeholders and surfaces needed now.

## 2. Experience Principles

1. **IDE-grade, not chatbot-grade**
   - The product should feel like a serious developer workbench.
   - Chat is central, but the surrounding shell should communicate tooling power.

2. **Chat-first inside a tool-rich frame**
   - The conversation remains the main workspace.
   - Navigation, settings, and status should support the conversation, not compete with it.

3. **Always-visible operational context**
   - Current mode, active project, and active model should be easy to identify at a glance.
   - Users should never wonder “where am I operating?”

4. **Windows-first pragmatism**
   - Layout, spacing, controls, and folder flows should feel native enough for a Windows desktop utility.
   - Avoid overly web-app-like consumer-chat styling.

5. **Safe, explicit transitions**
   - Switching mode, project, or credential state must be legible and predictable.
   - Hidden state changes are not acceptable.

## 3. Shell Layout Contract

## 3.1 Global layout
Use a five-region IDE-style shell:

1. **Top toolbar** — persistent action bar
2. **Left navigation** — mixed navigation for sessions and projects
3. **Center workspace** — chat-first main content
4. **Right dynamic panel** — context/details/settings panel
5. **Bottom collapsible panel** — terminal/log/status area

## 3.2 Region behavior

### Top toolbar
Must always remain visible.
Contains high-frequency controls:
- mode switcher
- project switcher / active project display
- model switcher
- settings / credential entry point
- global status indicators where needed

Toolbar should read as operational, not decorative.

### Left navigation
Mixed structure:
- **Top section:** recent sessions
- **Lower section:** recent/opened projects

The left rail should support quick re-entry into past work while maintaining clear project access.

### Center workspace
Chat-first main panel.
The shell should treat this as the primary focal surface.

Phase 1 should support:
- empty state / welcome state
- project-mode home state
- pure-conversation-mode home state
- project-session-list state after project switch

### Right dynamic panel
Default purpose: contextual information.
Secondary purpose: settings/details when requested.

It should be able to switch between:
- current context summary
- settings/config details
- model/project/session detail views when needed

Do not hard-assign it to only settings or only metadata.

### Bottom panel
Collapsible terminal/log area.
Default state may be collapsed, but the panel must exist in the shell structure from Phase 1.

## 4. Navigation & Information Architecture

## 4.1 Mode model
The app must support two top-level modes:
- **Project mode**
- **Pure conversation mode**

### Mode visibility
- Current mode must always be visible in the top toolbar.
- Mode is not hidden in a submenu.

### Mode switch interaction
- Primary switch location: top toolbar
- Switching mode changes the app’s destination/home view rather than silently changing background state

### Mode destinations
- **Project mode:** route to project-oriented flow (project selection or project session list)
- **Pure conversation mode:** route to non-project conversation/session flow

## 4.2 Project navigation
Project behavior contract:
- Project entry begins with opening a local folder
- Opened projects become remembered recents
- Active project can be switched from both top toolbar and left navigation
- Switching project routes to that project’s session list
- Non-standard project folders trigger warning, but opening remains allowed

## 4.3 Session navigation
Even though full session behavior is later-phase work, Phase 1 shell must reserve the pattern:
- sessions are visible in left navigation
- project session list is a distinct workspace state
- session and project are visually related but not collapsed into one concept

## 5. Control Surface Contract

## 5.1 Mode switcher
Style:
- compact segmented control or compact dropdown-like switcher in toolbar
- must show current mode clearly

Behavior:
- visible at all times
- fast to switch
- no hidden modal required for primary switching

## 5.2 Model switcher
Style:
- persistent toolbar dropdown
- label includes current model name

Behavior:
- supports global default model concept
- supports session-level override model concept
- model can be changed during an active session
- change affects future turns/tasks only
- switching model updates top-level state display only; no transcript/system message required

## 5.3 Project switcher
Style:
- toolbar current-project control
- duplicate access from left navigation

Behavior:
- selection is explicit
- active project is always displayed
- switching should feel comparable in friction to changing project in a developer tool, not buried like account settings

## 5.4 Credential entry point
Phase 1 must expose a clear entry point for credential status/configuration from the shell.
Even though detailed credential flow is not yet locked, the UI must already support:
- credential missing state
- credential configured state
- access point for add/replace/remove flow

## 6. Visual Design Contract

## 6.1 Visual tone
The app should feel:
- focused
- calm
- professional
- high-density enough for serious work
- not playful, toy-like, or consumer-chat flashy

Reference direction:
- closer to IDE/productivity tooling than to casual messaging apps
- clean hierarchy, restrained accents, disciplined spacing

## 6.2 Density
Use **medium information density**:
- denser than consumer AI chat products
- lighter than a fully packed IDE by default

This is important because the product blends chat and tooling.

## 6.3 Spacing
Use a consistent spatial scale:
- tight spacing inside toolbar and navigation rows
- moderate spacing between major shell regions
- generous enough chat spacing to preserve readability in center panel

Avoid large marketing-style whitespace.

## 6.4 Shape language
- subtle rounding
- restrained shadows/dividers
- clear panel boundaries
- no exaggerated glassmorphism or ornamental effects

## 6.5 Typography
Typography should prioritize legibility and hierarchy:
- clear distinction between app chrome, metadata, and main conversation content
- toolbar and sidebar text slightly compact
- center conversation content more breathable
- active context labels (mode/project/model) must be visually scannable

## 6.6 Color behavior
Use a restrained system:
- neutral base surfaces
- one primary accent for active state / focus / selected controls
- warning color for non-standard project directory notice
- error color for missing/invalid credential state
- success/subtle-ok color for configured credential state if needed

Do not overload the shell with multiple competing accent colors.

## 7. Component & State Contracts

## 7.1 Must-have shell components
Planner should assume Phase 1 includes UI work for:
- app shell frame
- top toolbar
- left mixed navigation panel
- center workspace container
- right dynamic panel container
- bottom panel container
- project picker / project warning state
- mode switch control
- model switch control
- active project display/control
- credential status entry surface

## 7.2 Placeholder tolerance
Phase 1 may use placeholders or incomplete content in:
- pure conversation main content
- project session list content details
- right panel deep settings body
- bottom panel execution content

But the containers, transitions, and visual contract must be established now.

## 8. Interaction Details

## 8.1 Empty / initial states
The shell must handle at least these states:
- no project selected in project mode
- no recent sessions yet
- pure conversation mode with no prior session selected
- credential missing state

Empty states should feel product-ready, not broken.

## 8.2 Warning behavior
For non-standard project folders:
- show a warning-level UI state
- explain that the folder does not look like a standard project
- still allow continue/open action
- warning should not feel like a hard error

## 8.3 Status visibility
The user must always be able to identify:
- current mode
n- active project (or absence of one)
- active model
- credential readiness at a high level

## 8.4 Transition behavior
Switching mode or project should feel like a deliberate workspace transition, not a page refresh.
Use immediate visual updates with clear destination-state loading, not surprising jumps.

## 9. Accessibility & Usability Constraints

- Toolbar controls must remain readable and clickable at common Windows desktop sizes
- Left navigation should work without relying on hover-only interactions
- Core state labels must remain visible in both light and dense activity states
- Warning and credential states should not rely on color alone

## 10. Design System Recommendations

Given current project research, Phase 1 should plan around:
- React + TypeScript desktop UI
- a pragmatic component system approach such as Tailwind + shadcn/ui or equivalent
- reusable shell primitives rather than one-off layout styling

The design system should support later expansion without requiring shell redesign.

## 11. Out-of-Scope for This UI Contract

This UI-SPEC does not fully define:
- detailed conversation message design system for later phases
- approval card UX for command execution
- diff viewer UI
- full session history behavior beyond shell/navigation structure
- advanced credential management workflows

## 12. Acceptance Contract For Planning

A Phase 1 implementation should satisfy this UI contract if:
1. The app renders an IDE-style five-region shell
2. Chat remains the visual center of the workspace
3. Toolbar visibly exposes mode, project, and model controls
4. Left navigation supports both recent sessions and project recents
5. Right panel can switch between context and settings/detail roles
6. Bottom panel exists as a collapsible log/terminal region
7. Switching mode routes to mode-specific homes
8. Switching project routes to that project’s session list
9. Non-standard folders produce warning-but-continue UX
10. Credential status has a visible shell-level entry point
