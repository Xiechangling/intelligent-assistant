# Phase 4: Safe Execution & Visibility - Research

**Researched:** 2026-04-06
**Domain:** Desktop approval workflow, execution visibility, and working-directory safety in a Tauri + React + Zustand app
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Approval Visibility
- **D-01:** Impactful project commands must stop for explicit approval before execution.
- **D-02:** Approval UI must show the command summary, exact command string, workspace path, and working directory together.
- **D-03:** Approval controls should remain close to the main coding workflow, with a compact inline summary in the center workspace and detailed structured context in the bottom panel.
- **D-04:** Approval must support both approve and reject outcomes without losing the active session context.

### Execution Output Surface
- **D-05:** Execution output belongs in the collapsible bottom panel rather than replacing the conversation surface.
- **D-06:** Output should stream as labeled `system`, `stdout`, and `stderr` lines so the user can understand what happened without reading raw terminal state elsewhere.
- **D-07:** The bottom panel should auto-expand when approval or execution starts so the workflow remains visible without manual hunting.

### Working-Context Safeguards
- **D-08:** The selected project and working directory must stay explicit before and during execution.
- **D-09:** Approved execution must remain constrained to the selected project boundary; do not allow commands to escape the project root.
- **D-10:** Command execution state should remain synchronized with the active session timeline via transcript events and recent-activity summaries.

### Presentation Model
- **D-11:** Project-mode workflow remains conversation-first, but approval requests and execution updates are visible event types in the session transcript.
- **D-12:** The right panel may summarize pending approval or execution state, but it is a supporting surface rather than the primary approval interface.
- **D-13:** Exact status wording may evolve, but the user must always understand whether the session is waiting for approval, running work, or failed.

### Claude's Discretion
- Exact wording for approval/execution helper copy and status labels.
- Exact iconography and compact layout treatment of the bottom panel tabs and approval cards.
- Exact ordering of transcript execution events as long as request → approval → execution → result remains understandable.

### Deferred Ideas (OUT OF SCOPE)
- Richer diff review ergonomics and file-inspection polish — Phase 5.
- Skills/config workflow controls — Phase 5.
- Any remote/cloud execution or shared approval model — out of scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXEC-01 | User can review and approve or reject proposed commands before execution when actions are impactful. | Approval state should be driven from `pendingProposal`/`executionRecord` in `src/app/state/appShellStore.ts`, surfaced inline in `src/app/layout/CenterWorkspace.tsx`, and detailed in `src/app/layout/BottomPanel.tsx`. |
| EXEC-02 | User can see command execution output and task progress in the desktop UI. | Execution output should continue to flow through `runApprovedCommand()` in `src/app/services/assistantService.ts`, be stored in `executionRecord.output`, and render in `src/app/layout/BottomPanel.tsx` with transcript synchronization in `src/app/state/appShellStore.ts`. |
| EXEC-03 | User can see which project and working context a command will run against before approving it. | Approval UI must bind directly to `CommandProposal.projectPath` and `CommandProposal.workingDirectory` from `src/app/state/types.ts`, while Rust containment enforcement remains in `src-tauri/src/execution_service.rs`. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Use GSD artifacts in `.planning/` as the source of truth for project context. [VERIFIED: E:/work/ai/agent/CLAUDE.md]
- Follow roadmap order unless the user explicitly reprioritizes work. [VERIFIED: E:/work/ai/agent/CLAUDE.md]
- Prefer `/gsd:discuss-phase N` before `/gsd:plan-phase N` for non-trivial phases. [VERIFIED: E:/work/ai/agent/CLAUDE.md]
- Validate implementation decisions against `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`. [VERIFIED: E:/work/ai/agent/CLAUDE.md]
- Preserve MVP boundaries: single-user, local-first, Windows-first. [VERIFIED: E:/work/ai/agent/CLAUDE.md]
- Keep the app Windows-first, treat polished UI as product value, preserve the hybrid local CLI + Claude API architecture, keep credential handling secure, and require explicit approval for impactful actions. [VERIFIED: E:/work/ai/agent/CLAUDE.md]

## Summary

Phase 4 should be planned as a state-contract-first workflow pass, not as three independent UI tasks. The current codebase already contains the essential domain model for approval and execution, including typed transcript events, `pendingProposal`, `executionRecord`, bottom-tray routing, and a Rust-side working-directory containment check. That means the planner should not treat approval, output, and working-directory safety as greenfield features; the real implementation order is to harden the shared store contract first, then align the primary surfaces, then add verification around the boundary conditions. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

The biggest planning insight is that most required capabilities already exist as integrated behavior, but they are unevenly distributed across surfaces. Approval is already represented in transcript events, inline center-workspace summary, and bottom-panel details. Execution output is already captured as labeled `system`/`stdout`/`stderr` lines and written into `executionRecord.output`. Working-directory safety is already enforced in Rust by canonicalizing both paths and rejecting any working directory outside the selected project root. The planner therefore should focus on consistency, sequencing, failure handling, and validation coverage rather than inventing new state models. [VERIFIED: E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

**Primary recommendation:** Plan Phase 4 in this order: (1) state + transcript contract hardening in `appShellStore.ts` and `types.ts`, (2) approval/output surface alignment in `CenterWorkspace.tsx`, `BottomPanel.tsx`, and `RightPanel.tsx`, (3) backend safety/visibility hardening in `execution_service.rs`, then (4) validation coverage with build, Playwright approval/review/status checks, and a manual `tauri dev` workflow pass. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] [VERIFIED: E:/work/ai/agent/tests/e2e/approval-flow.spec.ts] [VERIFIED: E:/work/ai/agent/tests/e2e/review-flow.spec.ts] [VERIFIED: E:/work/ai/agent/tests/e2e/status-system.spec.ts]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Desktop shell UI rendering | Existing shell and workflow surfaces are already built in React, so Phase 4 changes should stay inside the current component model rather than introduce a second UI state pattern. [VERIFIED: npm registry 2026-04-03] [VERIFIED: E:/work/ai/agent/package.json] |
| Zustand | 5.0.12 | Central workflow orchestration and derived UI state | Approval, transcript mutation, execution state, and recovery are already centralized here; Phase 4 should keep using one store as the source of truth. [VERIFIED: npm registry 2026-03-16] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| Tauri API | 2.10.1 | Frontend-to-native invocation boundary | Approval execution and assistant turns already cross the boundary through Tauri `invoke`, so execution hardening belongs on the Rust command boundary, not in frontend-only code. [VERIFIED: npm registry 2026-02-03] [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts] |
| Tauri Rust command modules | local crate module set | Native command execution, path validation, and local OS integration | The app already exposes native commands via `src-tauri/src/lib.rs`; Phase 4 backend work should remain in this module pattern. [VERIFIED: E:/work/ai/agent/src-tauri/src/lib.rs] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tauri-apps/plugin-dialog` | 2.7.0 | Native project-picker UX | Keep using it for project selection; it is relevant because project-root selection defines the trust boundary for execution. [VERIFIED: npm registry 2026-04-04] [VERIFIED: E:/work/ai/agent/package.json] |
| Playwright | 1.59.1 | UI workflow verification | Use for approval copy, status labels, review tray behavior, and mock-driven execution flows that are hard to validate by unit tests in the current repo. [VERIFIED: npm registry 2026-04-06] [VERIFIED: E:/work/ai/agent/playwright.config.ts] |
| Rust `std::process::Command` | stdlib | Native command execution and git review capture | Continue using it for local command execution and follow-up git inspection because the current execution service is already structured around it. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand-centered workflow orchestration | Component-local state split across shell regions | This would make approval/output synchronization harder because current behavior already depends on cross-surface shared state. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| Bottom-panel execution visibility | Modal or transcript-only execution UI | This would contradict locked decisions D-05 and D-07 and break the current shell pattern where execution detail lives in the tray. [VERIFIED: E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] |
| Frontend-only path checks | Rust command-boundary enforcement only in UI | UI-only checks are insufficient because execution happens natively; the trust boundary must stay in `execute_approved_command`. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |

**Installation:**
```bash
npm install react zustand @tauri-apps/api @tauri-apps/plugin-dialog
npm install -D playwright
```

**Version verification:**
- `react` → 19.2.4, modified 2026-04-03. [VERIFIED: npm registry]
- `zustand` → 5.0.12, modified 2026-03-16. [VERIFIED: npm registry]
- `@tauri-apps/api` → 2.10.1, modified 2026-02-03. [VERIFIED: npm registry]
- `@tauri-apps/plugin-dialog` → 2.7.0, modified 2026-04-04. [VERIFIED: npm registry]
- `playwright` → 1.59.1, modified 2026-04-06. [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/state/                 # Canonical workflow contracts and derived desktop status
├── app/services/              # Tauri invoke wrappers for assistant and execution boundaries
└── app/layout/                # Conversation-first shell surfaces: center workspace, tray, inspector

src-tauri/src/
├── assistant_service.rs       # Assistant turn response and command proposal generation
├── execution_service.rs       # Approved execution, path validation, output capture, git review
└── lib.rs                     # Tauri command registration
```
[VERIFIED: E:/work/ai/agent/.planning/codebase/STRUCTURE.md]

### Pattern 1: State contract first, surfaces second
**What:** `CommandProposal`, `ExecutionRecord`, transcript event kinds, tray mode, and desktop workflow status form one shared contract that all shell surfaces consume. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]

**When to use:** Any Phase 4 change that affects approval visibility, output rendering, status wording, or session synchronization should start in `types.ts` and `appShellStore.ts` before touching React components. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]

**Example:**
```typescript
export type SessionTranscriptEventKind =
  | 'user-message'
  | 'assistant-message'
  | 'stage-status'
  | 'tool-summary'
  | 'approval-request'
  | 'approval-resolution'
  | 'execution-update'
  | 'review-available'
```
Source: `E:/work/ai/agent/src/app/state/types.ts` [VERIFIED: codebase]

### Pattern 2: Center workspace gives compact inline state; bottom panel owns detail
**What:** The center workspace already provides a compact inline approval summary and review summary, while the bottom panel owns structured approval fields, execution logs, and diff review. [VERIFIED: E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx]

**When to use:** Any plan item involving approval UX or execution visibility should preserve this split. Add summary cues in `CenterWorkspace.tsx`; add detailed inspection in `BottomPanel.tsx`; keep `RightPanel.tsx` supportive only. [VERIFIED: E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md] [VERIFIED: E:/work/ai/agent/src/app/layout/RightPanel.tsx]

**Example:**
```typescript
{mode === 'project' ? <InlineApprovalSummary onApprove={approvePendingCommand} onReject={rejectPendingCommand} /> : null}
{mode === 'project' ? <InlineReviewSummary /> : null}
```
Source: `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` [VERIFIED: codebase]

### Pattern 3: Backend enforces the trust boundary
**What:** The Rust execution service canonicalizes both project and working-directory paths, rejects escapes, executes the command, captures stdout/stderr, and attaches git-based review artifacts. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

**When to use:** Any work-directory safety or command execution hardening belongs first in `src-tauri/src/execution_service.rs`, with frontend updates only for visibility and error presentation. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

**Example:**
```rust
if !working.starts_with(&project) {
    return Err("Working directory must stay inside the selected project.".to_string());
}
```
Source: `E:/work/ai/agent/src-tauri/src/execution_service.rs` [VERIFIED: codebase]

### Recommended implementation split order
1. **State and transcript alignment** in `src/app/state/types.ts` and `src/app/state/appShellStore.ts`. This is the dependency root because all three Phase 4 concerns are already represented here. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
2. **Approval surfaces** in `src/app/layout/CenterWorkspace.tsx` and `src/app/layout/BottomPanel.tsx`, with optional supporting summary alignment in `src/app/layout/RightPanel.tsx`. These depend on the state contract being correct. [VERIFIED: E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] [VERIFIED: E:/work/ai/agent/src/app/layout/RightPanel.tsx]
3. **Execution streaming and safety boundary** in `src/app/services/assistantService.ts` and `src-tauri/src/execution_service.rs`. These depend on approved contract fields and required event timing. [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]
4. **Verification coverage** in existing Playwright specs plus build/manual workflow passes. [VERIFIED: E:/work/ai/agent/package.json] [VERIFIED: E:/work/ai/agent/tests/e2e/approval-flow.spec.ts]

### File-first change map for planner
#### Approval
- **Change first:** `src/app/state/types.ts` and `src/app/state/appShellStore.ts` for authoritative proposal/execution/transcript behavior. [VERIFIED: codebase]
- **Then:** `src/app/layout/CenterWorkspace.tsx` for inline summary and composer disable/continue behavior. [VERIFIED: codebase]
- **Then:** `src/app/layout/BottomPanel.tsx` for exact approval fields and actions. [VERIFIED: codebase]
- **Optional/supporting:** `src/app/layout/RightPanel.tsx` for summary only. [VERIFIED: codebase]

#### Execution output visibility
- **Change first:** `src/app/services/assistantService.ts` and `src/app/state/appShellStore.ts` because the service and store define how output is delivered and persisted. [VERIFIED: codebase]
- **Then:** `src/app/layout/BottomPanel.tsx` for output log rendering and tray state. [VERIFIED: codebase]
- **Then:** `src/app/layout/CenterWorkspace.tsx` for transcript wording and inline review handoff. [VERIFIED: codebase]

#### Working-directory safety
- **Change first:** `src-tauri/src/execution_service.rs` because enforcement lives there. [VERIFIED: codebase]
- **Then:** `src/app/state/types.ts` / `src/app/state/appShellStore.ts` only if error payloads or visible state need to change. [VERIFIED: codebase]
- **Then:** `src/app/layout/BottomPanel.tsx` and `src/app/layout/RightPanel.tsx` for clearer boundary presentation if needed. [VERIFIED: codebase]

### Anti-Patterns to Avoid
- **Do not add separate approval state in components:** it would drift from transcript/session persistence already managed by the store. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
- **Do not rely on the right panel as the primary approval UI:** this conflicts with D-03 and D-12 and the current component split. [VERIFIED: E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md] [VERIFIED: E:/work/ai/agent/src/app/layout/RightPanel.tsx]
- **Do not trust assistant-provided paths without backend validation:** command proposals come from the assistant response and must be revalidated at execution time. [VERIFIED: E:/work/ai/agent/src-tauri/src/assistant_service.rs] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]
- **Do not treat transcript updates as optional decoration:** D-10 and D-11 require execution state to stay synchronized with the session timeline. [VERIFIED: E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-surface workflow synchronization | Per-component approval/output state | Existing Zustand store + derived desktop workflow helpers | The store already derives tray mode, desktop status, chooser rows, session attention, and execution state. Replacing that with local state would fragment the workflow. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| Project boundary enforcement | Regex/string-prefix path checks in TS | Rust `canonicalize()` + `starts_with()` containment check in `execution_service.rs` | Canonical paths handle normalization before boundary checks and keep enforcement at the native execution boundary. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |
| Execution log viewer model | Ad hoc untyped console blobs | Existing `ExecutionOutputEntry` stream model | The app already models output lines with `stream`, `text`, and `createdAt`, matching D-06. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] |
| Transcript lifecycle events | Hidden side effects with only panel updates | Existing `approval-request`, `approval-resolution`, `execution-update`, `review-available` event kinds | These event kinds already exist and let the planner keep approval/output visible in the session timeline. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] |

**Key insight:** Phase 4 should extend and harden the current contracts instead of adding a second workflow system. Most required primitives already exist; hand-rolled alternatives would mainly create consistency bugs. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]

## Current Capability Audit

### Already implemented in the current codebase
- `CommandProposal` already includes `summary`, exact `command`, `projectPath`, `workingDirectory`, and `requiresApproval`. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts]
- Transcript event kinds already include approval request/resolution and execution/review lifecycle events. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts]
- The store already creates `pendingProposal`, `executionRecord`, approval-resolution events, execution-update events, and review-ready events. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
- The center workspace already shows an inline approval summary with approve/reject actions and an inline review summary. [VERIFIED: E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx]
- The bottom panel already shows structured approval fields, output tabs, labeled output lines, changed-file review rail, and auto-expands on approval/execution transitions. [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
- The right panel already shows supportive approval and execution summaries. [VERIFIED: E:/work/ai/agent/src/app/layout/RightPanel.tsx]
- The frontend service already invokes `execute_approved_command` and maps `system`/`stdout`/`stderr` output plus changed files back into handlers. [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts]
- The Rust backend already rejects empty commands, enforces working-directory containment, captures stdout/stderr, and appends final system status messages. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

### Mostly presentation-layer or consistency gaps the planner should still cover
- Output is returned as a complete batch from Rust and replayed through handlers; it is not truly live streamed from the process while running, so planner tasks should be careful to describe current behavior as captured-and-replayed visibility rather than real-time subprocess streaming. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts]
- `assistant_service.rs` instructs the model to keep `projectPath` and `workingDirectory` inside the active project, but that is advisory; only `execution_service.rs` actually enforces the boundary. Plan explicit verification for malicious or incorrect assistant proposals. [VERIFIED: E:/work/ai/agent/src-tauri/src/assistant_service.rs] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]
- The current failure summaries in `appShellStore.ts` often use the proposal summary rather than the actual stderr/system message, so planner tasks should cover user-visible failure clarity. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
- `collect_git_review()` runs `git status --short` and `git diff HEAD -- <path>` from the current working directory. That means review availability depends on the working directory being inside a git repo and may report “review unavailable” as a system line rather than a distinct state; planner should cover this degraded path explicitly. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

## Common Pitfalls

### Pitfall 1: Treating approval, output, and status as separate workflows
**What goes wrong:** UI surfaces drift, producing mismatched transcript, tray, and status-chip states. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]  
**Why it happens:** Multiple surfaces consume the same workflow data, but only the store derives canonical desktop status and tray mode. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]  
**How to avoid:** Make state-contract changes first in `types.ts` and `appShellStore.ts`, then update renderers. [VERIFIED: codebase]  
**Warning signs:** Toolbar says “Working” while tray or transcript still shows approval/review state. Existing Playwright status coverage should catch this. [VERIFIED: E:/work/ai/agent/tests/e2e/status-system.spec.ts]

### Pitfall 2: Assuming assistant-provided working directories are safe
**What goes wrong:** Planner may over-trust frontend display and forget the backend trust boundary. [VERIFIED: E:/work/ai/agent/src-tauri/src/assistant_service.rs]  
**Why it happens:** The assistant response includes `projectPath` and `workingDirectory`, but those fields originate from model output. [VERIFIED: E:/work/ai/agent/src-tauri/src/assistant_service.rs]  
**How to avoid:** Keep containment validation in `execute_approved_command` and add manual/automated checks for escape attempts. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]  
**Warning signs:** Planner tasks only touch UI copy and never mention Rust validation or failure-path verification. [VERIFIED: codebase]

### Pitfall 3: Calling current output “streaming” when it is batch replay
**What goes wrong:** Plan tasks and acceptance criteria become inaccurate, and later bug reports appear when long-running commands do not show incremental output. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] [VERIFIED: E:/work/ai/agent/src/app/services/assistantService.ts]  
**Why it happens:** The UI API is shaped like handlers (`onOutput`), but Rust currently waits for `.output()` to complete before returning all lines. [VERIFIED: codebase]  
**How to avoid:** Phrase plan items as output visibility/capture unless the phase explicitly adds true subprocess streaming. [VERIFIED: codebase]  
**Warning signs:** Requirements mention “stream” loosely, but implementation still uses `Command::output()`. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]

### Pitfall 4: Losing session continuity on reject/fail paths
**What goes wrong:** Approval rejection or execution failure can feel like a dead-end if transcript and recent activity are not updated coherently. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]  
**Why it happens:** Reject/fail branches need session persistence, recovery snapshot updates, and visible recent-activity summaries just like successful runs. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]  
**How to avoid:** Keep reject/fail as first-class plan items with persistence and UI verification, not just happy-path approval. [VERIFIED: codebase]  
**Warning signs:** Manual flow leaves the session attached but ambiguous about whether the user can continue. [VERIFIED: E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx]

### Pitfall 5: Hiding degraded review behavior inside generic output
**What goes wrong:** User sees “completed” but misses that git review artifacts were unavailable. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]  
**Why it happens:** `collect_git_review()` failure is appended as a `system` output line, not a dedicated error state. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]  
**How to avoid:** Plan explicit copy/status treatment for “execution succeeded but review unavailable.” [VERIFIED: codebase]  
**Warning signs:** Completed execution with zero changed files and a system line mentioning git/review unavailability. [VERIFIED: codebase]

## Code Examples

Verified patterns from the current codebase:

### Approval request enters transcript and opens tray
```typescript
set({
  activeSession: nextSession,
  pendingProposal: proposal,
  executionRecord: buildExecutionRecord(proposal),
  selectedExecutionId: proposal.id,
  currentStageLabel: 'Awaiting approval',
  bottomPanelExpanded: true,
  bottomPanelTab: 'output',
})
```
Source: `E:/work/ai/agent/src/app/state/appShellStore.ts` [VERIFIED: codebase]

### Bottom panel shows the exact approval context fields
```tsx
<div className="bottom-panel__approval-field">
  <span>Workspace path</span>
  <strong>{pendingProposal.projectPath}</strong>
</div>
<div className="bottom-panel__approval-field">
  <span>Working directory</span>
  <strong>{pendingProposal.workingDirectory}</strong>
</div>
```
Source: `E:/work/ai/agent/src/app/layout/BottomPanel.tsx` [VERIFIED: codebase]

### Backend containment check
```rust
let project = Path::new(project_path)
    .canonicalize()
    .map_err(|err| format!("Invalid project path: {err}"))?;
let working = Path::new(working_directory)
    .canonicalize()
    .map_err(|err| format!("Invalid working directory: {err}"))?;

if !working.starts_with(&project) {
    return Err("Working directory must stay inside the selected project.".to_string());
}
```
Source: `E:/work/ai/agent/src-tauri/src/execution_service.rs` [VERIFIED: codebase]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Approval/output treated as generic assistant text | Dedicated transcript event kinds plus structured proposal/execution state | Present in current Phase 6-era codebase snapshot | Planner can structure work around explicit lifecycle contracts instead of parsing freeform messages. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| Hidden terminal execution outside the UI | Desktop tray renders execution output and review artifacts | Present in current `BottomPanel.tsx` implementation | Phase 4 planning should refine existing visibility, not invent it. [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] |
| Project context implied by session only | Proposal carries both workspace path and working directory, and backend validates containment | Present in current proposal + execution service code | Safety depends on keeping display and backend enforcement aligned. [VERIFIED: E:/work/ai/agent/src/app/state/types.ts] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |

**Deprecated/outdated:**
- Describing current execution as true live streaming is outdated for this codebase because the backend still uses blocking `Command::output()`. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs]
- Planning review as a separate later concern is outdated for this phase boundary because execution already returns `changedFiles` and the bottom tray already renders review artifacts. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx]

## Resolved Decisions

1. **Incremental subprocess streaming vs captured output**
   - **Decision:** Phase 4 should plan around the current captured-output model rather than introducing true incremental subprocess streaming.
   - **Why:** The existing Rust path uses blocking `Command::output()` and the current requirement is visibility and trust, not transport-level streaming parity.
   - **Planning impact:** Plans and verification must describe output as labeled visibility in the desktop UI, not as true live process streaming.

2. **Degraded review state when git review is unavailable**
   - **Decision:** Phase 4 should include explicit degraded-review messaging as part of execution visibility, rather than leaving review unavailability buried in generic system output.
   - **Why:** This is a trust and consistency issue tied directly to `EXEC-02`, not optional polish.
   - **Planning impact:** Plans and verification should include both automated and manual checks for review-unavailable behavior.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend build, Vite dev server, Playwright | ✓ | v24.14.1 | — [VERIFIED: local command] |
| npm | Package scripts, registry verification | ✓ | 11.12.1 | — [VERIFIED: local command] |
| cargo | Native Tauri/Rust build path | ✓ | 1.94.1 | — [VERIFIED: local command] |
| git | Review artifact collection in `execution_service.rs` | ✓ | 2.53.0.windows.2 | Without git, execution can still run but review artifacts degrade to system output messaging. [VERIFIED: local command] [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |
| Playwright | Automated workflow verification | Declared | 1.59.1 | Manual UI checks if browser automation is unavailable. [VERIFIED: E:/work/ai/agent/package.json] [VERIFIED: npm registry] |
| Tauri CLI (`tauri dev`) | Desktop runtime launch validation | Indeterminate from direct CLI probe | — | Use `npm run tauri:dev` from the repo, since `@tauri-apps/cli` is declared locally even though direct `npx tauri --version` failed in this session. [VERIFIED: E:/work/ai/agent/package.json] [VERIFIED: local command failure] |

**Missing dependencies with no fallback:**
- None confirmed. [VERIFIED: local command audit]

**Missing dependencies with fallback:**
- Direct standalone Tauri CLI probe was not successful, but repo-local script usage remains the intended path. [VERIFIED: local command failure] [VERIFIED: E:/work/ai/agent/package.json]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.59.1 [VERIFIED: npm registry] |
| Config file | `E:/work/ai/agent/playwright.config.ts` [VERIFIED: codebase] |
| Quick run command | `npm run test:e2e:approval` or `npm run test:e2e:status` [VERIFIED: E:/work/ai/agent/package.json] |
| Full suite command | `npm run test:e2e` [VERIFIED: E:/work/ai/agent/package.json] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXEC-01 | Approval request appears with exact approve/reject actions and visible command context | e2e | `npm run test:e2e:approval` | ✅ `tests/e2e/approval-flow.spec.ts` [VERIFIED: codebase] |
| EXEC-02 | Workflow statuses stay canonical and review tray becomes visible after execution | e2e | `npm run test:e2e:status` and `npm run test:e2e:review` | ✅ `tests/e2e/status-system.spec.ts`, ✅ `tests/e2e/review-flow.spec.ts` [VERIFIED: codebase] |
| EXEC-03 | Workspace path and working directory are shown before approval | e2e + manual backend check | `npm run test:e2e:approval` | ✅ for UI, ❌ for backend escape-path automation in current repo [VERIFIED: codebase] |

### Sampling Rate
- **Per task commit:** `npm run build` for compile safety, plus the narrowest affected Playwright spec (`test:e2e:approval`, `test:e2e:review`, or `test:e2e:status`). [VERIFIED: E:/work/ai/agent/package.json]
- **Per wave merge:** `npm run test:e2e` plus a desktop launch pass through `npm run tauri:dev`. [VERIFIED: E:/work/ai/agent/package.json]
- **Phase gate:** `npm run build`, `npm run test:e2e`, and one manual desktop workflow pass covering approve, reject, success, failure, and non-git review-degraded flows. [VERIFIED: codebase] [VERIFIED: requirements/phase context]

### Wave 0 Gaps
- [ ] Add an automated backend-oriented verification for a working-directory escape attempt against `execute_approved_command`; current Playwright coverage only checks the visible UI path fields, not the native rejection path. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] [VERIFIED: E:/work/ai/agent/tests/e2e/approval-flow.spec.ts]
- [ ] Add explicit automated coverage for reject-path persistence and continued session usability; current named specs emphasize approval/review/status happy paths. [VERIFIED: E:/work/ai/agent/tests/e2e/approval-flow.spec.ts] [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts]
- [ ] Add manual verification for actual Tauri desktop launch because current Playwright config targets the web shell at `http://127.0.0.1:4173`, not the native desktop runtime. [VERIFIED: E:/work/ai/agent/playwright.config.ts]

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Local single-user desktop app; not the Phase 4 focus. [VERIFIED: E:/work/ai/agent/.planning/PROJECT.md] |
| V3 Session Management | yes | Persist session continuity through `session_service.rs` and synchronized transcript/recent-activity updates in `appShellStore.ts`. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| V4 Access Control | yes | Enforce project-boundary containment in `execute_approved_command` before native command execution. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |
| V5 Input Validation | yes | Reject empty commands, validate project-mode inputs, canonicalize paths, and display exact execution context before approval. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] [VERIFIED: E:/work/ai/agent/src-tauri/src/assistant_service.rs] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] |
| V6 Cryptography | no direct Phase 4 impact | Credential handling exists separately in `credential_service.rs`; Phase 4 should not bypass that boundary. [VERIFIED: E:/work/ai/agent/src-tauri/src/lib.rs] |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Assistant proposes a path outside the selected project | Elevation of privilege / Tampering | Canonicalize both paths in Rust and reject non-contained working directories. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |
| User cannot tell where a command will run | Spoofing / Repudiation | Show summary, exact command, workspace path, and working directory together in approval UI. [VERIFIED: E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md] [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] |
| Execution failure loses session continuity | Repudiation / Availability | Persist transcript, recent activity, and recovery snapshot on fail/reject branches. [VERIFIED: E:/work/ai/agent/src/app/state/appShellStore.ts] |
| Review artifacts silently disappear outside git repos | Repudiation | Surface review-unavailable messaging explicitly in output and manual verification. [VERIFIED: E:/work/ai/agent/src-tauri/src/execution_service.rs] |
| Destructive command appears with ambiguous severity | Tampering | Keep impact labeling and approval checkpoint visible before execution. [VERIFIED: E:/work/ai/agent/src/app/layout/BottomPanel.tsx] |

## Sources

### Primary (HIGH confidence)
- `E:/work/ai/agent/.planning/phases/04-safe-execution-visibility/04-CONTEXT.md` - locked decisions and phase boundary
- `E:/work/ai/agent/CLAUDE.md` - project-level constraints
- `E:/work/ai/agent/.planning/PROJECT.md` - product constraints and MVP boundaries
- `E:/work/ai/agent/.planning/REQUIREMENTS.md` - EXEC-01/02/03 definitions and traceability
- `E:/work/ai/agent/.planning/ROADMAP.md` - Phase 4 goal and success criteria
- `E:/work/ai/agent/.planning/config.json` - nyquist validation enabled
- `E:/work/ai/agent/src/app/state/types.ts` - approval/execution contracts
- `E:/work/ai/agent/src/app/state/appShellStore.ts` - approval/execution/session orchestration
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` - inline approval/review surfaces and transcript rendering
- `E:/work/ai/agent/src/app/layout/BottomPanel.tsx` - approval detail, output log, review tray
- `E:/work/ai/agent/src/app/layout/RightPanel.tsx` - supportive execution/context summaries
- `E:/work/ai/agent/src/app/services/assistantService.ts` - invoke boundary for assistant and execution
- `E:/work/ai/agent/src-tauri/src/execution_service.rs` - native execution guardrails and output/review capture
- `E:/work/ai/agent/src-tauri/src/assistant_service.rs` - command proposal origin and model prompt constraints
- `E:/work/ai/agent/tests/e2e/approval-flow.spec.ts` - approval visibility verification
- `E:/work/ai/agent/tests/e2e/review-flow.spec.ts` - review-ready tray verification
- `E:/work/ai/agent/tests/e2e/status-system.spec.ts` - canonical status verification
- npm registry checks run on 2026-04-06 for `react`, `zustand`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`, and `playwright`
- Local environment command audit run on 2026-04-06 for `node`, `npm`, `cargo`, and `git`

### Secondary (MEDIUM confidence)
- None. All important planning claims in this document were verified directly from code, project artifacts, npm registry metadata, or local environment commands. [VERIFIED: research session]

### Tertiary (LOW confidence)
- None. [VERIFIED: research session]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - stack and versions were verified from `package.json`, npm registry, and actual code usage.
- Architecture: HIGH - workflow responsibilities and dependency order were verified directly from `types.ts`, `appShellStore.ts`, UI components, and Rust services.
- Pitfalls: HIGH - risks were derived from concrete implementation details and existing tests rather than assumptions.

**Research date:** 2026-04-06
**Valid until:** 2026-05-06
