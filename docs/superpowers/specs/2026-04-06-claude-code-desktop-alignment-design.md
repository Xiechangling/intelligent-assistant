# Claude Code Desktop Alignment Design

**Date:** 2026-04-06
**Status:** Approved
**Scope:** Phase 6 — align the current Tauri desktop app with the official Claude Code desktop experience, prioritizing UI/workflow parity first and runtime capability parity second.

## 1. Goal

Upgrade the current Tauri desktop app into a more official-feeling Claude Code desktop workbench.

The priority is to align:
- desktop UI information architecture
- workspace / session chooser behavior
- active coding session lifecycle
- approval / output / review workflow integration

The design must preserve the current product constraints:
- Windows-first
- local-first
- single-user
- existing Tauri + React + Rust architecture

It must not expand scope into:
- multi-user collaboration
- cloud sync
- marketplace / plugin ecosystem
- direct transplantation of upstream official runtime/UI code

## 2. Design Principles

1. **UI/workflow parity before runtime parity**
   The first implementation goal is to make the desktop product feel like the official Claude Code desktop experience, even if some underlying capabilities remain locally implemented.

2. **Adapt, don’t transplant**
   The vendored `claude-code-source-code-v2.1.88/` snapshot is the behavioral reference. We adapt its concepts into the existing app rather than embedding its runtime or copying its UI wholesale.

3. **Keep the shell, upgrade the product**
   The existing five-region shell remains the outer frame. The redesign focuses on the inner workflow, hierarchy, status semantics, and workspace/session experience.

4. **Session-first desktop experience**
   The product should feel centered around workspaces and coding sessions, not around a generic chat box.

5. **Unified workflow language**
   States and workflow labels must become explicit, consistent, and product-level. Approval, execution, and review should feel like one lifecycle.

## 3. Architecture

### 3.1 Desktop Shell Layer
Retain the existing shell regions:
- TopToolbar
- LeftSidebar
- CenterWorkspace
- RightPanel
- BottomPanel

But upgrade them from MVP surfaces into a cohesive desktop workbench.

Responsibilities:
- present current workspace and session context
- provide navigation into workspaces and sessions
- make the center workspace the clear primary surface
- keep context and action surfaces visually subordinate to the main work area

### 3.2 Workflow State Layer
Promote the current `appShellStore.ts` from a page-state store into the primary workflow state machine.

It should govern:
- workspace selection state
- session chooser / attach / resume state
- active coding session state
- assistant lifecycle state
- approval state
- execution state
- review readiness state
- connection / status state

This layer is the canonical source of truth for what the desktop is doing.

### 3.3 Capability Adapter Layer
Retain the current `services/*.ts + Tauri invoke` model, but reorganize it around official-style capability boundaries:
- session capability
- assistant capability
- execution capability
- credential / connection capability
- future bridge-compatible capability

This preserves the current architecture while preparing for later parity work with official bridge/session semantics.

### 3.4 Native Runtime Layer
Continue using the existing Rust/Tauri runtime for:
- session persistence
- credential storage
- assistant request execution
- approved command execution
- diff / review extraction

Future official runtime alignment should be added here incrementally instead of coupling UI directly to remote-protocol assumptions.

## 4. Information Architecture

### 4.1 TopToolbar
Purpose: global context and high-frequency controls.

Should show:
- current mode
- current workspace
- current session title
- current top-level status
- quick entry to inspector/settings

Should not become a dense control dump.

### 4.2 LeftSidebar
Purpose: navigation.

Should own:
- workspace grouping
- session navigation
- recent work entry points
- quick switching

It should not compete with the center workspace for primary attention.

### 4.3 CenterWorkspace
Purpose: the primary product surface.

This becomes the main stage for:
- workspace/session chooser
- active coding session
- transcript and task flow
- inline approval checkpoints
- review-ready summaries

This is the most important region in the product.

### 4.4 RightPanel
Purpose: auxiliary context.

This should contain:
- context metadata
- connection and credential detail
- settings
- active session metadata

It is a support surface, not the primary work surface.

### 4.5 BottomPanel
Purpose: action/result surface.

This should unify:
- approval details
- execution output
- review / diff inspection

It should feel like a single workflow tray rather than unrelated utilities.

## 5. Core User Flows

### 5.1 Startup and Entry
On startup, the app should open into an official-feeling desktop workbench entry state.

Behavior:
- if a restorable session exists, show a strong resume / attach path
- otherwise show a workspace + session chooser
- pure conversation remains available, but is not the Phase 6 priority path

The initial experience should answer three questions immediately:
- where am I working?
- what session can I resume?
- is the system ready / connected / attached?

### 5.2 Workspace / Session Chooser
The current `project-sessions` list evolves into a richer chooser surface.

It should combine:
- recent workspaces
- recent sessions
- active / last-used markers
- explicit actions: resume, attach, start new
- stronger hierarchy and state visibility

This surface becomes the real desktop landing area.

### 5.3 Active Coding Session
Once inside a session, the center workspace should present a more official-feeling coding experience.

It should include:
- session header with clear status
- conversation/task transcript as primary reading surface
- visible workflow state
- inline approval and review summaries
- composer integrated into the coding lifecycle

The transcript remains conversation-first, but the session state around it becomes more structured and legible.

### 5.4 Approval / Output / Review Lifecycle
Approval, output, and review should read as one lifecycle rather than separate MVP features.

Flow:
1. assistant proposes an impactful action
2. user reviews structured approval details
3. execution output streams in workflow context
4. changed files become review-ready
5. review surface supports inspection and follow-up

## 6. State System

The desktop should standardize around these top-level workflow states:
- `ready`
- `connecting`
- `connected`
- `attached`
- `working`
- `awaitingApproval`
- `reviewReady`
- `failed`

These are not internal-only enums. They must directly drive:
- toolbar status chips
- chooser row states
- session header states
- bottom tray mode and emphasis
- empty/loading/error states
- copywriting consistency

Workspace/session state must also support:
- selected workspace vs no workspace
- attachable/resumable session
- active session
- historical session
- needs-attention session
- session with pending approval
- session with review artifacts

## 7. Component Contracts

### 7.1 WorkspaceChooser
Responsibilities:
- show recent workspaces
- show recent sessions
- expose resume / attach / new actions
- show active or last-used context

Contract:
- it is the main landing experience for project-mode desktop work
- it is not just a list of rows

### 7.2 SessionSurface
Responsibilities:
- present active coding session shell
- wrap transcript, session header, workflow state, inline approval/review summaries, and composer

Contract:
- transcript remains primary
- session lifecycle context is always visible

### 7.3 Status System
Responsibilities:
- standardize visual semantics for ready / connected / attached / working / awaiting approval / review ready / failed

Contract:
- same state vocabulary across all surfaces
- no ad hoc status wording per panel

### 7.4 ApprovalSurface
Responsibilities:
- present command intent
- present workspace and working directory
- present impact level and command preview
- support approve/reject

Contract:
- approval is structured and scannable
- not just a freeform warning card

### 7.5 ReviewSurface
Responsibilities:
- show changed files
- show selected diff
- show review summary and navigation

Contract:
- review should feel like a first-class follow-up workflow
- not just an output appendage

## 8. Copywriting and Tone

The product tone should be:
- concise
- tool-like
- official-feeling
- low-emotion
- workflow-oriented

Preferred state language:
- Ready
- Connected
- Attached
- Working
- Awaiting approval
- Review ready
- Failed
- Needs attention

Avoid chatty consumer-product language such as:
- “Everything looks great!”
- “Let’s get started!”
- “Your assistant is thinking hard…”

## 9. Visual System Constraints

### 9.1 Density
The product should be denser than a mainstream chat app, but lighter than a terminal.

Target feel:
- developer-tool density
- fast scanning
- strong hierarchy
- minimal wasted space

### 9.2 Color Semantics
Use color sparingly and semantically:
- neutral base for most surfaces
- accent color for active / connected state
- yellow for approval / warning
- red for failed / needs-attention
- green only for success/completion states

### 9.3 Panel Behavior
- center workspace is primary by default
- right panel is supportive
- bottom panel expands when action/output/review is relevant
- avoid simultaneous high-intensity emphasis across all regions

## 10. Tooling and Software Needed During Execution

The implementation may search for, download, install, and configure missing tools as needed.

### 10.1 Required
- Node.js LTS
- npm or pnpm
- Rust toolchain
- cargo
- Tauri dependencies / CLI requirements
- project frontend dependencies

### 10.2 Strongly Recommended
- Playwright

Playwright should be used for:
- desktop UI flow validation
- screenshot regression checks
- chooser / session / approval / review workflow verification

### 10.3 Possibly Needed Later
- icon / asset processing helpers
- network/protocol debugging tools
- minimal OAuth / bridge-adjacent validation tools if later phases move closer to official runtime capabilities

### 10.4 Installation Strategy
Default strategy during execution:
1. inspect existing environment first
2. install only what is missing
3. prioritize project-critical dependencies first
4. avoid heavy external platform dependencies unless they materially unblock official-parity work

## 11. Implementation Sequence

Recommended order:

1. define and enforce the new UI-SPEC and desktop state vocabulary
2. redesign workspace/session chooser and center-workspace hierarchy
3. refactor state model to support official-feeling workspace/session lifecycle
4. integrate approval / output / review into one coherent workflow surface
5. validate with Playwright and local desktop verification
6. only then evaluate deeper parity with official bridge/session/runtime capabilities

## 12. Locked Decisions

The following decisions are locked for planning and implementation:
- UI/workflow parity comes before runtime parity
- existing Tauri + React + Rust architecture stays in place
- five-region shell stays in place
- center workspace is the primary surface
- desktop becomes session-first, not chat-first
- approval / output / review become one lifecycle
- Playwright is part of the recommended validation toolkit
- local-first, Windows-first, single-user constraints remain unchanged

## 13. Claude’s Discretion

Implementation may choose:
- exact naming of the new chooser/workspace/session surfaces
- exact component split across files
- exact spacing and visual token values
- exact distribution of supporting details between inspector and bottom tray
- exact sequence for gradually introducing bridge-compatible abstractions

These choices must remain consistent with the design above.
