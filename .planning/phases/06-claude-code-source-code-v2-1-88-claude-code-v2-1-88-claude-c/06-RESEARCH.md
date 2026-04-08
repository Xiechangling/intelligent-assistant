# Phase 6: Claude Code Desktop Alignment - Research

**Researched:** 2026-04-06 [VERIFIED: system date]
**Domain:** Tauri desktop workflow alignment, session-first workbench UX, state-driven shell refactor [VERIFIED: codebase + phase context]
**Confidence:** HIGH [VERIFIED: codebase + phase docs + npm registry + official-doc URLs surfaced in WebSearch]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Reference Alignment Strategy
- **D-01:** Phase 6 should treat `claude-code-source-code-v2.1.88/` as the canonical behavioral reference for desktop-like workflow patterns, session flow, and bridge-oriented UX concepts, but not as code to transplant directly into the Tauri app.
- **D-02:** Planning should prefer adapting official workflow concepts into the existing Tauri + React + Rust architecture instead of trying to embed or run the upstream CLI UI directly.
- **D-03:** Where the official source is incomplete or stripped in npm-distributed files, planning should still preserve the visible product direction inferred from the available session, bridge, and history modules rather than falling back to unrelated custom UX.

### Desktop Shell Direction
- **D-04:** Keep the existing five-region IDE-style shell from earlier phases as the outer structure, but redesign the experience inside that shell so it feels closer to an official desktop companion rather than a generic internal admin panel.
- **D-05:** The center workspace should become the primary product surface for session selection, session attachment/resume, and rich conversation/task flow, because that is where the current app already anchors coding work.
- **D-06:** Left sidebar, toolbar, inspector, and bottom panel should support the primary workspace flow rather than compete with it; they are supporting control surfaces, not the main product story.

### Session and Workspace Experience
- **D-07:** The desktop product should emphasize attached/resumable coding sessions and active workspace context as first-class concepts, inspired by the official `AssistantSessionChooser`, session discovery, session history, and bridge/session APIs.
- **D-08:** Project-mode UX should evolve from a simple “new session vs history list” view toward a more official-feeling workspace/session chooser experience with clearer current-state visibility.
- **D-09:** Conversation-mode support should remain available, but Phase 6 priority is the official-style coding workspace experience rather than expanding generic chat features.

### Interaction Model
- **D-10:** The transcript should continue to be conversation-first, but with stronger task/session state framing so users can understand attachment state, session progress, approvals, and review readiness at a glance.
- **D-11:** Approval, execution, and review surfaces already built in Phases 4-5 should be visually integrated into a cohesive desktop workflow instead of feeling like separate MVP add-ons.
- **D-12:** Planning should prefer official-feeling status language and lifecycle cues such as ready, connected, attached, working, awaiting approval, and review-ready over generic placeholder copy.

### Scope Controls
- **D-13:** Phase 6 should stay within single-user local desktop workflow refinement; do not introduce cloud sync, multi-user workspaces, or marketplace/plugin distribution.
- **D-14:** Phase 6 may refine shell information architecture, session routing, state modeling, and native service boundaries if needed to support the official-style desktop workflow, because this is a multi-file product-alignment phase rather than a small polish pass.

### Claude's Discretion
- Exact naming of the new desktop surfaces and whether “workspace”, “session”, “attach”, or similar official-style labels appear in the UI.
- Exact distribution of details between center workspace, right inspector, and bottom panel, as long as center workspace remains primary.
- Exact visual treatment of session rows, status chips, and bridge-inspired connection state, as long as the result clearly reads as a desktop coding tool rather than a generic chat app.

### Deferred Ideas (OUT OF SCOPE)
- Multi-user collaboration or shared approvals — out of scope, still belongs to v2 requirements.
- Cloud sync, hosted session sharing, or plugin marketplace — out of scope for this phase and the current MVP boundaries.
- Literal embedding of the upstream official runtime/UI implementation into Tauri — not the goal of this phase.
</user_constraints>

## Project Constraints (from CLAUDE.md)

- Use `.planning/` artifacts as the source of truth for project context. [VERIFIED: E:\work\ai\agent\CLAUDE.md]
- Follow roadmap order unless the user explicitly reprioritizes work. [VERIFIED: E:\work\ai\agent\CLAUDE.md]
- Validate implementation decisions against `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`. [VERIFIED: E:\work\ai\agent\CLAUDE.md]
- Preserve MVP boundaries: single-user, local-first, Windows-first. [VERIFIED: E:\work\ai\agent\CLAUDE.md]
- Preserve key product constraints: Windows-first desktop app, polished UI, hybrid local CLI + Claude API architecture, secure local credential handling, explicit approval for impactful actions. [VERIFIED: E:\work\ai\agent\CLAUDE.md]
- No project skill directories were detected at `E:/work/ai/agent/.claude/skills` or `E:/work/ai/agent/.agents/skills`, so there are no additional skill-level constraints to load for this phase. [VERIFIED: ls on skill directories]

## Summary

Phase 6 is best treated as a shell-alignment refactor on top of an already-working workflow engine, not as a runtime rewrite. The strongest implementation base is the existing `src/app/state/appShellStore.ts` orchestration layer plus the five existing shell regions; the weakest parts are the current UI vocabulary, chooser information architecture, and the absence of a canonical desktop lifecycle model that all regions share. [VERIFIED: 06-CONTEXT.md + ARCHITECTURE.md + CenterWorkspace.tsx + TopToolbar.tsx + LeftSidebar.tsx + RightPanel.tsx + BottomPanel.tsx + appShellStore.ts]

The official snapshot available in this repo does not provide transplant-ready chooser code, but it does provide a stable product direction: session choosing is a dedicated surface, session discovery and history are first-class, and bridge status language centers on Ready/Connected/Attached-style operational states rather than generic chat wording. [VERIFIED: AssistantSessionChooser.tsx + sessionDiscovery.ts + sessionHistory.ts + bridge/types.ts + bridgeUI.ts]

The planner should therefore split Phase 6 into waves that first normalize state vocabulary and chooser/session contracts, then progressively re-skin and recompose the existing surfaces around those contracts, and only after that touch native payloads where the current UI cannot represent required desktop states cleanly. [VERIFIED: 06-UI-SPEC.md + 2026-04-06-claude-code-desktop-alignment-design.md + current codebase]

**Primary recommendation:** Do an inside-the-shell alignment pass in four waves: state/types first, center workspace chooser/session surface second, toolbar/sidebar/bottom tray/right panel third, and native/service boundary cleanup last. [VERIFIED: current codebase dependency graph]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4, modified 2026-04-03 [VERIFIED: npm registry] | Render the desktop shell UI. [VERIFIED: package.json] | Already used in the app and current package line is React 19-compatible. [VERIFIED: package.json] |
| react-dom | 19.2.4, modified 2026-04-03 [VERIFIED: npm registry] | Mount the shell app. [VERIFIED: package.json] | Must stay aligned with React major/minor. [VERIFIED: npm registry + package.json] |
| Zustand | 5.0.12, modified 2026-03-16 [VERIFIED: npm registry] | Keep one workflow orchestration store for shell, session, approval, execution, and review state. [VERIFIED: appShellStore.ts] | The existing architecture already centralizes workflow in one store, so Phase 6 should extend that instead of adding a second state system. [VERIFIED: ARCHITECTURE.md + appShellStore.ts] |
| @tauri-apps/api | 2.10.1, modified 2026-02-03 [VERIFIED: npm registry] | Frontend invoke boundary into native commands. [VERIFIED: package.json + service files] | This is the existing UI/native boundary and should remain the contract edge. [VERIFIED: ARCHITECTURE.md + services] |
| @tauri-apps/plugin-dialog | 2.7.0, modified 2026-04-04 [VERIFIED: npm registry] | Native project/file/image picking. [VERIFIED: package.json + projectService/attachmentService references] | Reuse existing desktop-native picker behavior instead of rebuilding chooser acquisition UX. [VERIFIED: current architecture docs + codebase] |
| Tauri CLI | 2.10.1, modified 2026-03-04 [VERIFIED: npm registry] | Run and package the desktop app. [VERIFIED: package.json] | Validation and final build remain Tauri-driven. [VERIFIED: tauri.conf.json + package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.7.0, modified 2026-03-25 [VERIFIED: npm registry] | Existing iconography for chooser/status/panel affordances. [VERIFIED: layout files + package.json] | Keep for Phase 6 to avoid a gratuitous icon-system migration. [VERIFIED: current UI files] |
| Playwright | 1.59.1, modified 2026-04-06 [VERIFIED: npm registry] | Browser-driven validation of workbench flows and screenshots. [VERIFIED: npm registry] | Use after Wave 1 UI contracts exist; it is not currently installed in the repo. [VERIFIED: package.json + TESTING.md] |
| tauri-driver / WebDriver flow | Official Tauri 2 testing path for desktop E2E. [CITED: https://v2.tauri.app/develop/tests/webdriver/] | Native desktop automation path for Windows/Linux. [CITED: https://v2.tauri.app/develop/tests/webdriver/] | Use if planner wants true desktop-window automation rather than browser-only shell validation. [CITED: https://v2.tauri.app/develop/tests/webdriver/] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending `appShellStore.ts` | A new XState/multi-store UI state layer | Adds migration cost across every region before Phase 6 delivers user-visible parity. [VERIFIED: current single-store architecture] |
| Reworking CSS tokens in place | Tailwind/shadcn re-platform | Conflicts with the locked “adapt inside existing shell” direction and adds non-essential stack churn. [VERIFIED: 06-UI-SPEC.md + current CSS-only shell] |
| Browser-only Playwright validation | Tauri WebDriver-only validation | Browser-only is faster to introduce, but misses native-window integration; Tauri WebDriver is more official for desktop E2E. [CITED: https://v2.tauri.app/develop/tests/][CITED: https://v2.tauri.app/develop/tests/webdriver/] |

**Installation:**
```bash
npm install -D playwright
```
[VERIFIED: package.json lacks Playwright]

**Optional desktop E2E add-on:**
```bash
cargo install tauri-driver
```
[CITED: https://v2.tauri.app/develop/tests/webdriver/]

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/
│   ├── layout/
│   │   ├── CenterWorkspace.tsx      # Keep as composition root for chooser + session surface
│   │   ├── TopToolbar.tsx           # Global context + one canonical status chip
│   │   ├── LeftSidebar.tsx          # Navigation + attention markers only
│   │   ├── RightPanel.tsx           # Support metadata/settings only
│   │   └── BottomPanel.tsx          # Approval/output/review lifecycle tray
│   ├── state/
│   │   ├── appShellStore.ts         # Canonical workflow state machine/orchestrator
│   │   └── types.ts                 # UI-facing session/workflow contracts
│   └── services/
│       ├── sessionService.ts        # Session/recovery payload boundary
│       └── assistantService.ts      # Assistant + execution invoke boundary
└── styles/
    └── app-shell.css                # Token normalization + shell-level visual semantics
```
[VERIFIED: STRUCTURE.md + current files]

### Pattern 1: Extend the existing orchestration store before rewriting surfaces
**What:** Add a UI-facing desktop workflow state model in `src/app/state/types.ts`, then derive all chips/markers/surface modes from it in `src/app/state/appShellStore.ts`. [VERIFIED: 06-UI-SPEC.md + appShellStore.ts + types.ts]

**When to use:** First wave, before component layout work. [VERIFIED: dependency analysis of current components]

**Why:** Every major surface currently calculates status ad hoc (`Ready`, `Execution running`, `Needs review`, `Idle`, `Active`) from different signals. That blocks consistent official-style language and causes avoidable rework if UI changes start first. [VERIFIED: TopToolbar.tsx + CenterWorkspace.tsx + LeftSidebar.tsx + RightPanel.tsx + BottomPanel.tsx]

**File-first change set:**
- `src/app/state/types.ts` — add canonical display state, chooser-row metadata, attention flags, recovery/spotlight types. [VERIFIED: current type gaps]
- `src/app/state/appShellStore.ts` — derive one canonical workflow status and one bottom-tray mode from runtime state. [VERIFIED: current store shape]
- Only after that, update region components to consume selectors instead of local status formatting. [VERIFIED: current repeated `formatStatusLabel` patterns]

### Pattern 2: Keep `CenterWorkspace.tsx` as the composition root, but split it internally
**What:** Turn `CenterWorkspace.tsx` from a monolith into a composition root that renders `RecoveryCallout`, `WorkspaceChooser`, `SessionSurface`, `InlineApprovalSummary`, and `InlineReviewSummary`, while preserving the file as the center-region owner. [VERIFIED: 06-UI-SPEC.md + current CenterWorkspace.tsx]

**When to use:** Second wave, after store/type contracts exist. [VERIFIED: dependency order from current code]

**Why:** `CenterWorkspace.tsx` already owns project session history, active transcript, inline approval card, review summary, and composer; it is the safest refactor anchor because it already controls the whole primary user flow. [VERIFIED: 06-CONTEXT.md + CenterWorkspace.tsx]

**Planner implication:** Do not replace `AppShell` or move the primary workflow into sidebar/right panel files. [VERIFIED: 06-CONTEXT.md D-05/D-06 + UI-SPEC region priority]

### Pattern 3: Toolbar/sidebar/right panel/bottom tray should consume derived state, not invent local state
**What:** Make these files presentation-only over selectors such as `desktopStatus`, `chooserAttentionCounts`, `activeSessionHeader`, and `bottomTrayMode`. [VERIFIED: current shell ownership + UI-SPEC]

**When to use:** Third wave. [VERIFIED: dependency analysis]

**Why:** Current region files each re-interpret state independently, which will drift again if left decentralized. [VERIFIED: TopToolbar.tsx + LeftSidebar.tsx + RightPanel.tsx + BottomPanel.tsx]

### Pattern 4: Delay native boundary changes until a concrete UI contract needs extra data
**What:** Preserve `services/*.ts` and `src-tauri/src/*.rs` contracts until UI work proves a missing field or state transition. [VERIFIED: current invoke boundary + 2026-04-06 design doc section 3.3]

**When to use:** Fourth wave only. [VERIFIED: current frontend can already express most lifecycle events with local derivation]

**Needed native changes likely limited to:**
- richer recovery spotlight metadata, if planner wants direct startup CTA data without recomputing from history [ASSUMED]
- explicit session attention flags persisted in metadata if “review-ready until visited” must survive app restart [ASSUMED]
- explicit connection/attachment semantics if local resume must be distinguished from fresh open across restarts [ASSUMED]

### Recommended wave/package split

#### Wave 0 — Validation scaffolding and baseline audit
- Add test scaffolding commands and decide whether to start with Playwright browser validation, Tauri WebDriver, or both. [VERIFIED: no tests currently exist]
- Capture baseline screenshots/manual checkpoints for startup, chooser, active session, pending approval, execution output, and review-ready states. [VERIFIED: Phase 6 goals + lack of automation]

#### Wave 1 — State and contract alignment
- Update `src/app/state/types.ts`. [VERIFIED: current type gaps]
- Refactor `src/app/state/appShellStore.ts` into explicit startup/recovery/chooser/attached/working/approval/review/failed display states. [VERIFIED: UI-SPEC state contract + current store]
- Normalize bottom-tray mode derivation and session attention metadata. [VERIFIED: BottomPanel.tsx + UI-SPEC]

#### Wave 2 — Center workspace alignment
- Refactor `src/app/layout/CenterWorkspace.tsx` into chooser + session surface composition without replacing the region. [VERIFIED: current ownership]
- Implement recovery card, workspace summary, resumable spotlight, richer session rows, and official copy. [VERIFIED: UI-SPEC startup/chooser contracts]
- Update composer labels and transcript/system-event hierarchy. [VERIFIED: UI-SPEC copy contract + current composer labels]

#### Wave 3 — Supporting region alignment
- `src/app/layout/TopToolbar.tsx`: one canonical status chip, workspace/session context summary, remove ad hoc wording. [VERIFIED: current toolbar behavior]
- `src/app/layout/LeftSidebar.tsx`: workspace/session grouping plus attention markers, no duplicate chooser semantics. [VERIFIED: current sidebar limitations]
- `src/app/layout/BottomPanel.tsx`: explicit approval/output/review tabs with auto-expand/auto-switch from lifecycle state. [VERIFIED: current tray already close to needed role]
- `src/app/layout/RightPanel.tsx`: support-only context/settings wording cleanup. [VERIFIED: design contract]
- `src/styles/app-shell.css`: spacing/typography/color normalization. [VERIFIED: UI-SPEC token debt + current CSS]

#### Wave 4 — Boundary cleanup and persistence upgrades
- Update `src/app/services/sessionService.ts` and `src-tauri/src/session_service.rs` only if persisted chooser/recovery metadata is still missing after Waves 1-3. [VERIFIED: current session payload shape]
- Update `src/app/services/assistantService.ts`, `src-tauri/src/assistant_service.rs`, and `src-tauri/src/execution_service.rs` only if UI requires explicit lifecycle payloads not derivable from current events. [VERIFIED: current service/native contracts]

### Anti-Patterns to Avoid
- **Big-bang shell rewrite:** Replacing all five region files and CSS simultaneously would erase the existing working flow and multiply regression risk. [VERIFIED: current system already implements sessions, approval, execution, and review]
- **Runtime-first parity:** Rebuilding upstream bridge/runtime behavior before UI contract alignment violates the approved design priority. [VERIFIED: alignment design section 1/2/11/12]
- **Ad hoc status strings per panel:** The current code already shows drift; continuing that pattern will block official-feeling parity. [VERIFIED: TopToolbar.tsx + LeftSidebar.tsx + RightPanel.tsx + CenterWorkspace.tsx]
- **Moving primary flow into the right panel or bottom panel:** The UI-SPEC explicitly makes center workspace primary and those regions supportive/subordinate. [VERIFIED: 06-UI-SPEC.md]

## File-by-File Guidance

### Best files to modify first
- `E:/work/ai/agent/src/app/state/types.ts` — best first file because it is the narrowest place to establish canonical workflow vocabulary and chooser/session contracts. [VERIFIED: types.ts]
- `E:/work/ai/agent/src/app/state/appShellStore.ts` — best second file because every region already depends on it. [VERIFIED: ARCHITECTURE.md + appShellStore.ts]
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` — best first UI file because it already owns the center workflow and contains the chooser/session/composer/transcript logic. [VERIFIED: CenterWorkspace.tsx]
- `E:/work/ai/agent/src/styles/app-shell.css` — best parallel UI-system file once the component contracts are fixed. [VERIFIED: current token debt in UI-SPEC + CSS file]

### Best files to modify later
- `E:/work/ai/agent/src/app/layout/TopToolbar.tsx` — after canonical status and header selectors exist. [VERIFIED: current toolbar depends on many derived status branches]
- `E:/work/ai/agent/src/app/layout/LeftSidebar.tsx` — after chooser attention metadata exists. [VERIFIED: current sidebar only knows recent sessions/projects]
- `E:/work/ai/agent/src/app/layout/BottomPanel.tsx` — after bottom-tray mode is derived centrally. [VERIFIED: current tray logic]
- `E:/work/ai/agent/src/app/layout/RightPanel.tsx` — after session/context summary selectors are stabilized. [VERIFIED: current right panel is mostly read-only over store data]

### Files to avoid large-scale rewrite in Phase 6
- `E:/work/ai/agent/src-tauri/src/lib.rs` — command registration is already thin and not the right place for alignment complexity. [VERIFIED: lib.rs]
- `E:/work/ai/agent/src/app/services/sessionService.ts` — keep as thin invoke wrappers unless payload shape must change. [VERIFIED: sessionService.ts]
- `E:/work/ai/agent/src/app/services/assistantService.ts` — keep thin; do not stuff UI-state logic into service wrappers. [VERIFIED: assistantService.ts]
- `E:/work/ai/agent/src-tauri/src/assistant_service.rs` and `execution_service.rs` — avoid a parity-driven rewrite because Phase 6 is UI/workflow parity first, not backend protocol parity. [VERIFIED: approved design + current responsibilities]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Desktop E2E driver protocol | Custom Win32 input automation harness | Tauri WebDriver path with `tauri-driver` when true desktop automation is needed. [CITED: https://v2.tauri.app/develop/tests/webdriver/] | Tauri already documents WebDriver as its desktop E2E approach. [CITED: https://v2.tauri.app/develop/tests/][CITED: https://v2.tauri.app/develop/tests/webdriver/] |
| New global state system | Parallel state machine/store stack beside Zustand | Extend the existing Zustand store. [VERIFIED: ARCHITECTURE.md + appShellStore.ts] | The current store already owns all workflow-critical state; a second store would create duplicate truth. [VERIFIED: appShellStore.ts] |
| New component styling stack | Tailwind/shadcn migration for this phase | Refine `app-shell.css` tokens and structure in place. [VERIFIED: UI-SPEC existing design-system state + current CSS] | Phase 6 is shell alignment, not UI stack replacement. [VERIFIED: UI-SPEC + phase context] |
| Upstream runtime embedding | Running the upstream desktop/CLI UI inside Tauri | Adapt behavior and vocabulary only. [VERIFIED: D-01/D-02/D-03] | The vendored upstream files here are reference evidence, not transplant-ready app modules. [VERIFIED: AssistantSessionChooser.tsx is a stub + stripped modules] |

**Key insight:** The app already has the hard parts of MVP workflow persistence and approval plumbing; the expensive mistake would be rebuilding infrastructure that Phase 6 can instead reframe with better contracts, copy, and region composition. [VERIFIED: Requirements + current store/native services]

## Dependency Order for Major Surfaces

| Surface | Must wait for | Can proceed with | Notes |
|--------|---------------|------------------|-------|
| Chooser | `types.ts` canonical chooser row + recovery spotlight data [VERIFIED: current type gap] | Existing session history list backing data [VERIFIED: CenterWorkspace.tsx + sessionService.ts] | Chooser is the first visible Wave 2 deliverable. [VERIFIED: UI-SPEC] |
| Session surface | canonical session header model + workflow status mapping [VERIFIED: UI-SPEC + current status drift] | existing transcript event stream and composer [VERIFIED: CenterWorkspace.tsx + types.ts] | No native changes required for first pass. [VERIFIED: current transcript events] |
| Status system | `types.ts` + `appShellStore.ts` first [VERIFIED: state dependency] | none | Every other surface should consume this, not redefine it. [VERIFIED: current drift] |
| Bottom tray | canonical tray mode + attention state [VERIFIED: BottomPanel.tsx + UI-SPEC] | current executionRecord/pendingProposal data [VERIFIED: appShellStore.ts] | Safe to refactor before native changes. [VERIFIED: current state shape] |
| Right panel | canonical context summary selectors [VERIFIED: dependency on store] | existing settings forms [VERIFIED: RightPanel.tsx] | Lowest-priority alignment surface. [VERIFIED: UI-SPEC region hierarchy] |

**Practical sequencing:** status system first, then chooser/session surface, then bottom tray + toolbar/sidebar, then right panel cleanup, then optional persistence/service/native additions. [VERIFIED: dependency graph above]

## Common Pitfalls

### Pitfall 1: Starting from copy and CSS before unifying state vocabulary
**What goes wrong:** The app looks more “official” visually but still emits conflicting states like `Ready`, `Responding`, `Execution running`, `Needs review`, `Idle`, and `Active`. [VERIFIED: current region files]

**Why it happens:** Status is currently computed locally in multiple files. [VERIFIED: TopToolbar.tsx + LeftSidebar.tsx + RightPanel.tsx + CenterWorkspace.tsx]

**How to avoid:** Land `types.ts` + `appShellStore.ts` canonical status work before any major UI pass. [VERIFIED: UI-SPEC state contract]

**Warning signs:** Designers or implementers need to ask “what should this panel call the current state?” more than once. [ASSUMED]

### Pitfall 2: Treating resume and attach as a backend feature gap instead of a UI contract
**What goes wrong:** Planner blocks chooser work waiting for true bridge attach semantics. [VERIFIED: phase goal + UI-SPEC]

**Why it happens:** The official reference uses bridge/session vocabulary, but this product is still local-first Tauri. [VERIFIED: D-01/D-02 + bridge types + project constraints]

**How to avoid:** Model `Attach` as UI vocabulary over local resume where appropriate in Phase 6, then add deeper runtime distinctions later if needed. [VERIFIED: UI-SPEC session chooser contract]

**Warning signs:** Native refactor tasks appear before chooser/session-surface tasks. [VERIFIED: recommended sequence]

### Pitfall 3: Big-bang rewrite of `CenterWorkspace.tsx`
**What goes wrong:** Existing transcript, approval, review, and composer flows regress during the redesign. [VERIFIED: CenterWorkspace.tsx currently owns all of them]

**Why it happens:** `CenterWorkspace.tsx` is large, so it is tempting to replace it wholesale. [VERIFIED: file contents]

**How to avoid:** Keep the file as composition root and extract subcomponents incrementally around existing behavior. [VERIFIED: recommended pattern]

**Warning signs:** A plan proposes deleting and recreating the center workspace file in one task. [ASSUMED]

### Pitfall 4: Overloading the right panel with primary flow work
**What goes wrong:** The primary task path requires opening the inspector, which conflicts with the approved region hierarchy. [VERIFIED: UI-SPEC]

**Why it happens:** `RightPanel.tsx` already displays context and settings, so it is easy to stuff more workflow controls there. [VERIFIED: RightPanel.tsx]

**How to avoid:** Keep approve/reject, output, review, chooser, and session progression in center/bottom surfaces. [VERIFIED: UI-SPEC contracts]

**Warning signs:** Approval buttons or session resume CTAs migrate into the right drawer. [ASSUMED]

### Pitfall 5: Ignoring token debt in `app-shell.css`
**What goes wrong:** The phase ships with copy improvements but still fails the dense/official visual feel because spacing and type scale remain inconsistent. [VERIFIED: UI-SPEC token debt notes + current CSS tokens]

**Why it happens:** Current CSS uses `6/10/14/18/24/32` spacing and mixed 11/12/13/14/20/22 typography. [VERIFIED: app-shell.css + UI-SPEC]

**How to avoid:** Plan an explicit token-normalization pass, not just component-local tweaks. [VERIFIED: UI-SPEC required package E]

**Warning signs:** New styles keep introducing 10px, 14px, 18px, 22px values. [VERIFIED: current CSS patterns]

## Code Examples

Verified patterns from current code and official references:

### Canonical current orchestration anchor
```typescript
export const useAppShellStore = create<AppShellState>((set, get) => ({
  mode: 'conversation',
  activeProjectPath: null,
  activeSession: null,
  sessionHistory: [],
  pendingProposal: null,
  executionRecord: null,
  // ...workflow orchestration omitted
}))
```
Source: `E:/work/ai/agent/src/app/state/appShellStore.ts` [VERIFIED: codebase]

### Official bridge/status vocabulary evidence
```typescript
let currentState: StatusState = 'idle'
let currentStateText = 'Ready'

setAttached(sessionId: string): void {
  currentState = 'attached'
  currentStateText = 'Connected'
}
```
Source: `E:/work/ai/agent/claude-code-source-code-v2.1.88/src/bridge/bridgeUI.ts` [VERIFIED: codebase]

### Current transcript event surface already supports Phase 6 framing
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

### Planner-facing implementation pattern
```typescript
// Recommended selector shape, to implement in store layer
interface DesktopWorkflowViewModel {
  desktopStatus: 'Ready' | 'Connecting' | 'Connected' | 'Attached' | 'Working' | 'Awaiting approval' | 'Review ready' | 'Failed' | 'Needs attention'
  trayMode: 'approval' | 'output' | 'review' | 'collapsed'
  chooserSpotlightSessionId: string | null
  activeSessionAttention: 'approval' | 'review' | 'failure' | null
}
```
Source: derived from `06-UI-SPEC.md` and current store gaps. [VERIFIED: 06-UI-SPEC.md + appShellStore.ts + types.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic chat shell with attached utilities | Session-first coding desktop workbench vocabulary and dedicated chooser surface [VERIFIED: Phase 6 design docs] | Locked for Phase 6 on 2026-04-06 [VERIFIED: 06-CONTEXT.md + UI-SPEC + alignment design] | Planner should optimize around resumable coding sessions, not generic conversation-first landing pages. [VERIFIED: phase docs] |
| Ad hoc E2E strategy | Tauri 2 officially documents WebDriver-based E2E testing. [CITED: https://v2.tauri.app/develop/tests/][CITED: https://v2.tauri.app/develop/tests/webdriver/] | Current official docs found in 2025 updates surfaced via 2026 search. [CITED: https://v2.tauri.app/develop/tests/][CITED: https://v2.tauri.app/develop/tests/webdriver/] | Desktop-native validation should not depend on homegrown automation. [CITED: https://v2.tauri.app/develop/tests/webdriver/] |
| MVP shell token drift | UI-SPEC now locks a 4-point spacing scale and reduced type scale. [VERIFIED: 06-UI-SPEC.md] | 2026-04-06 [VERIFIED: 06-UI-SPEC.md] | CSS normalization is a first-class part of execution, not optional polish. [VERIFIED: UI-SPEC required package E] |

**Deprecated/outdated:**
- Using `Responding`, `Needs review`, and other panel-specific labels as primary top-level workflow chips is outdated for this phase. [VERIFIED: 06-UI-SPEC.md]
- Treating the current `project-sessions` view as “good enough” session history is outdated for this phase; it must become a chooser surface. [VERIFIED: UI-SPEC + design doc]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | frontend build, Vite, Playwright [VERIFIED: package.json + proposed validation] | ✓ [VERIFIED: local command check] | v24.14.1 [VERIFIED: local command check] | — |
| npm | package install/build/test scripts [VERIFIED: package.json] | ✓ [VERIFIED: local command check] | 11.12.1 [VERIFIED: local command check] | — |
| cargo | Tauri build and optional `tauri-driver` install [VERIFIED: tauri.conf.json + Tauri docs URL] | ✓ [VERIFIED: local command check] | 1.94.1 [VERIFIED: local command check] | — |
| rustc | native Tauri compile [VERIFIED: tauri.conf.json] | ✓ [VERIFIED: local command check] | 1.94.1 [VERIFIED: local command check] | — |
| git | review extraction in execution flow [VERIFIED: execution_service.rs] | ✓ [VERIFIED: local command check] | 2.53.0.windows.2 [VERIFIED: local command check] | No fallback for git-based review within current implementation. [VERIFIED: execution_service.rs] |
| Tauri CLI in PATH | direct `tauri` shell commands [VERIFIED: package.json script intent] | ✗ on PATH in this shell [VERIFIED: local command check] | — | Use `npm run tauri:dev` / local npm script first. [VERIFIED: package.json] |
| Playwright | automated UI flow validation [VERIFIED: recommended toolkit + package.json absence] | ✗ not installed in repo and `npx playwright --version` failed via combined check [VERIFIED: package.json + local command check] | — | Manual validation now; install as Wave 0 requirement. [VERIFIED: package.json + TESTING.md] |

**Missing dependencies with no fallback:**
- None blocking research. [VERIFIED: environment audit]

**Missing dependencies with fallback:**
- Playwright missing; fall back to build + manual validation until installed. [VERIFIED: package.json + TESTING.md]
- Tauri CLI not available as bare `tauri` command in this shell; use npm scripts or local binary resolution. [VERIFIED: local command check + package.json]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed in repo; add Playwright for UI validation. [VERIFIED: package.json + TESTING.md + npm registry] |
| Config file | none — see Wave 0. [VERIFIED: TESTING.md] |
| Quick run command | `npm run build` [VERIFIED: package.json] |
| Full suite command | `npm run build` plus manual desktop verification until Playwright is added. [VERIFIED: package.json + no tests detected] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PH6-01 | Startup shows recovery card / chooser / no-workspace state correctly | Playwright UI flow [ASSUMED] | `npx playwright test tests/e2e/startup.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: no test files] |
| PH6-02 | Chooser shows workspace summary, resumable spotlight, recent sessions, and actions | Playwright UI flow [ASSUMED] | `npx playwright test tests/e2e/chooser.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: no test files] |
| PH6-03 | Canonical status language stays consistent across toolbar/session/tray/sidebar | Playwright + screenshot assertion [ASSUMED] | `npx playwright test tests/e2e/status-system.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: no test files] |
| PH6-04 | Approval request auto-expands tray and updates status markers | Playwright UI flow or manual if backend mocking not ready [ASSUMED] | `npx playwright test tests/e2e/approval-flow.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: no test files] |
| PH6-05 | Review-ready state auto-switches tray and highlights changed files | Playwright UI flow or manual if backend mocking not ready [ASSUMED] | `npx playwright test tests/e2e/review-flow.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: no test files] |
| PH6-06 | Build/typecheck remain green after refactor | build/typecheck | `npm run build` [VERIFIED: package.json] | ✅ command exists [VERIFIED: package.json] |
| PH6-07 | Desktop shell still launches in Tauri window | manual desktop smoke, optionally WebDriver later [CITED: https://v2.tauri.app/develop/tests/webdriver/] | `npm run tauri:dev` [VERIFIED: package.json] | ✅ command exists [VERIFIED: package.json] |

### Sampling Rate
- **Per task commit:** `npm run build` [VERIFIED: package.json]
- **Per wave merge:** `npm run build` plus manual workflow walkthrough for startup, chooser, active session, approval, and review. [VERIFIED: no automated tests yet]
- **Phase gate:** `npm run build` green, desktop app launched via Tauri, and manual verification against UI-SPEC for all major flows; add Playwright checks if Wave 0 lands. [VERIFIED: package.json + UI-SPEC + testing gap]

### Wave 0 Gaps
- [ ] `tests/e2e/startup.spec.ts` — startup/recovery/chooser path coverage. [ASSUMED]
- [ ] `tests/e2e/chooser.spec.ts` — chooser interaction and status markers. [ASSUMED]
- [ ] `tests/e2e/approval-flow.spec.ts` — approval → output tray behavior. [ASSUMED]
- [ ] `tests/e2e/review-flow.spec.ts` — review-ready file rail and diff selection. [ASSUMED]
- [ ] `playwright.config.ts` — baseline config. [ASSUMED]
- [ ] Framework install: `npm install -D playwright` [VERIFIED: package.json lacks it]

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no for end-user auth in this phase [VERIFIED: single-user local-first MVP scope] | Local API key storage only. [VERIFIED: PROJECT.md + REQUIREMENTS.md + credential handling docs] |
| V3 Session Management | yes [VERIFIED: session persistence/recovery is core product behavior] | Persist session metadata/transcripts locally through `session_service.rs`. [VERIFIED: session_service.rs + REQUIREMENTS.md] |
| V4 Access Control | yes, limited local execution scope [VERIFIED: execution flow] | Keep command execution constrained to selected project via working-directory validation. [VERIFIED: execution_service.rs] |
| V5 Input Validation | yes [VERIFIED: current code] | Validate mode/project path and normalize inputs at service/native boundaries. [VERIFIED: assistant_service.rs + execution_service.rs + credential_service conventions] |
| V6 Cryptography | yes for secret storage [VERIFIED: project constraints + architecture docs] | Keep credential handling in native secure storage path; never move secrets into frontend state. [VERIFIED: PROJECT.md + ARCHITECTURE.md] |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Command execution outside project root | Tampering | Preserve `validate_working_directory` guard in `execution_service.rs`. [VERIFIED: execution_service.rs] |
| Credential leakage into UI/store | Information Disclosure | Keep API key storage in native credential service and expose only status/settings flows to UI. [VERIFIED: ARCHITECTURE.md + RightPanel.tsx + credential service docs] |
| Misleading approval context | Elevation of Privilege / Tampering | Approval surface must keep exact command, workspace path, and working directory visible before execution. [VERIFIED: REQUIREMENTS.md EXEC-01/02/03 + UI-SPEC] |
| Review mismatch to current session | Repudiation / Tampering | Keep review artifacts tied to `executionRecord` and active session, not to a global detached diff browser. [VERIFIED: BottomPanel.tsx + appShellStore.ts + UI-SPEC] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Persisted attention flags may need backend changes if “review-ready until visited” must survive restart. | Architecture Patterns | Planner may under-scope Wave 4 persistence work. |
| A2 | Recovery spotlight metadata may benefit from explicit persisted payloads rather than recomputation. | Architecture Patterns | Chooser startup work may be clumsier than planned. |
| A3 | Suggested Playwright spec filenames and command layout are a good Wave 0 starting point. | Validation Architecture | Test bootstrap file structure may differ from final setup. |
| A4 | Warning signs phrased in pitfalls are diagnostic heuristics rather than verified repository behavior. | Common Pitfalls | Low; affects guidance wording, not implementation architecture. |

## Resolved Decisions

1. **Attach vs Resume visibility**
   - **Decision:** `Resume session` is the default chooser action for persisted local sessions. `Attach` is shown only when the UI is representing a restored or still-active workflow context that conceptually maps to re-attaching to work already in progress.
   - **Why:** This preserves the official mental model without forcing a premature native bridge/runtime rewrite.
   - **Planning impact:** Chooser and session surfaces should use one deterministic rule everywhere rather than making per-panel wording decisions.

2. **Persistence of approval/review attention markers**
   - **Decision:** Phase 6 should persist enough session metadata to restore meaningful review/attention state after restart when that state is already derivable from existing session/execution artifacts, but it does not need a separate unread-notification subsystem.
   - **Why:** This keeps the product aligned with durable desktop workflows while avoiding unnecessary scope expansion.
   - **Planning impact:** Prefer lightweight metadata extensions only if the existing persisted session record cannot restore the required attention state.

3. **Playwright vs desktop-window E2E depth**
   - **Decision:** Start with Playwright-based shell/workflow validation as the required automated path for Phase 6, with repo-local build + manual Tauri desktop verification as the release gate. Tauri WebDriver remains optional future hardening, not a blocker for this phase.
   - **Why:** This is the smallest viable validation stack that still gives repeatable Phase 6 coverage.
   - **Planning impact:** Validation plans should install Playwright, add workflow specs, keep `npm run build` as the universal gate, and reserve native-window automation for later if needed.

## Sources

### Primary (HIGH confidence)
- Local codebase files listed by the user, including `CenterWorkspace.tsx`, `TopToolbar.tsx`, `LeftSidebar.tsx`, `RightPanel.tsx`, `BottomPanel.tsx`, `appShellStore.ts`, `types.ts`, `app-shell.css`, and Tauri service/native files. [VERIFIED: codebase]
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-CONTEXT.md` [VERIFIED: codebase]
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-UI-SPEC.md` [VERIFIED: codebase]
- `E:/work/ai/agent/docs/superpowers/specs/2026-04-06-claude-code-desktop-alignment-design.md` [VERIFIED: codebase]
- `E:/work/ai/agent/.planning/PROJECT.md`, `REQUIREMENTS.md`, `STATE.md`, `codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md` [VERIFIED: codebase]
- npm registry checks for `react`, `react-dom`, `zustand`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`, `@tauri-apps/cli`, `lucide-react`, `playwright`. [VERIFIED: npm registry]
- Local environment availability checks for `node`, `npm`, `cargo`, `rustc`, `git`. [VERIFIED: local command check]

### Secondary (MEDIUM confidence)
- Tauri 2 testing docs landing page surfaced by official WebSearch result: https://v2.tauri.app/develop/tests/ [CITED: https://v2.tauri.app/develop/tests/]
- Tauri 2 WebDriver testing page surfaced by official WebSearch result: https://v2.tauri.app/develop/tests/webdriver/ [CITED: https://v2.tauri.app/develop/tests/webdriver/]
- Tauri webdriver example repo surfaced by official WebSearch result: https://github.com/tauri-apps/webdriver-example [CITED: https://github.com/tauri-apps/webdriver-example]

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - current repo stack and package currency were verified directly in `package.json` and npm registry. [VERIFIED: package.json + npm registry]
- Architecture: HIGH - current dependency order and safe refactor anchors are directly visible in the shell/store/service/native files. [VERIFIED: codebase]
- Pitfalls: MEDIUM - root causes are strongly supported by current code and UI-SPEC, but some warning-sign phrasing is heuristic. [VERIFIED: codebase + UI-SPEC][ASSUMED]

**Research date:** 2026-04-06 [VERIFIED: system date]
**Valid until:** 2026-05-06 for codebase-specific planning; re-check npm versions and Tauri testing docs before implementation if planning slips beyond 30 days. [VERIFIED: registry/docs can move over time]