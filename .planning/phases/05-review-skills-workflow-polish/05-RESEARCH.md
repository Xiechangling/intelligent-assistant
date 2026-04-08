# Phase 5: Review, Skills & Workflow Polish - Research

**Researched:** 2026-04-06
**Domain:** Tauri + React/Zustand desktop workflow polish for review surfaces, presets, and capability toggles
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Review Surfaces
- **D-01:** Changed files should stay tied to the active session and latest approved execution rather than becoming a detached project-wide diff browser.
- **D-02:** Review should use a split layout with a changed-file list and a diff preview, remaining in the bottom panel as a supporting workflow surface.
- **D-03:** Review-ready state should be visible inline in the center workspace and detailed in the bottom panel.
- **D-04:** When review artifacts are unavailable, the app should show explicit degraded-review messaging rather than an ambiguous empty state.

### Presets and Reuse
- **D-05:** The app should support saving and reusing compact runtime presets from the existing shell state rather than introducing a separate heavy configuration system.
- **D-06:** Presets should capture meaningful workflow-facing choices such as mode, model, and review preference state.
- **D-07:** Applying a preset should affect future interactions and shell defaults without rewriting prior session history.

### Workflow Capabilities
- **D-08:** Workflow capabilities should be configurable from the GUI as lightweight enable/disable toggles.
- **D-09:** Capability controls belong in settings/support surfaces, not in the center workspace.
- **D-10:** Capability labels should stay product-facing and understandable rather than exposing internal implementation jargon.

### Product Cohesion
- **D-11:** Review, settings, presets, and capability toggles should feel like polish on the same desktop workflow, not a disconnected admin area.
- **D-12:** Right panel remains the primary location for presets and workflow capability settings, while bottom panel remains the primary review/detail surface.
- **D-13:** The overall result should make the desktop shell feel more cohesive than terminal-only Claude Code workflows.

### Claude's Discretion
- Exact naming of presets and capability labels.
- Exact visual treatment of review rows, diff typography, and empty/degraded review states.
- Exact small-copy wording in the settings panel as long as it stays concise and tool-like.

### Deferred Ideas (OUT OF SCOPE)
- Team/shared review workflows — out of scope.
- Cloud-synced presets or skills — out of scope.
- Plugin marketplace / third-party extension management — out of scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REVW-01 | User can inspect changed files associated with assistant actions. | Keep review state execution-scoped in `ExecutionRecord.changedFiles`; preserve bottom-panel split review surface; validate selected-file behavior and degraded states. [VERIFIED: codebase] |
| REVW-02 | User can preview diffs for project changes generated during a session. | Preserve `ChangedFileReview.diff` as the preview contract; avoid detached repo-wide diffing; verify output/review synchronization and empty/degraded review copy. [VERIFIED: codebase] |
| CONF-03 | User can save and reuse configuration templates or presets. | Extend `ReviewPreset` from shell state only; save/apply from `appShellStore`; verify presets affect future defaults without mutating existing sessions. [VERIFIED: codebase] |
| CONF-04 | User can configure available skills or workflow capabilities from the desktop UI. | Keep capability toggles in right-panel settings; evolve `SkillToggle` labels and enable/disable behavior in store; validate product-facing copy and non-invasive UI placement. [VERIFIED: codebase] |
</phase_requirements>

## Summary

Phase 5 should be planned as shell-state refinement, not as a new subsystem. The existing architecture already places review detail in `BottomPanel.tsx`, settings/presets/capabilities in `RightPanel.tsx`, and orchestration in `appShellStore.ts`. `ChangedFileReview`, `ReviewPreset`, and `SkillToggle` already exist as explicit contracts in `src/app/state/types.ts`, and execution-to-review linkage already flows through `executionRecord` plus `selectedReviewFileId`. [VERIFIED: codebase]

The safest implementation order is: stabilize shared state contracts first, then review surface behavior, then preset behavior, then capability toggle polish. This order matches current coupling: `BottomPanel.tsx` and `RightPanel.tsx` are thin renderers over store state, while `appShellStore.ts` is the source of truth for selection state, preset application, execution linkage, and workflow status. Changing UI first would force repeated rewrites because both panels derive behavior from store shape and status derivation. [VERIFIED: codebase]

The main planning risk is accidental scope expansion into a project-wide diff browser, a heavy settings system, or deep persistence refactors. The existing code and Phase 5 context explicitly reject those directions: review is session/execution-bound, presets are compact shell defaults, and capabilities are lightweight support-surface toggles. The plan should therefore prefer additive edits in `types.ts`, `appShellStore.ts`, `BottomPanel.tsx`, and `RightPanel.tsx`, while leaving `credentialService.ts` and `projectService.ts` largely untouched except where labels or settings-surface wiring truly require it. [VERIFIED: codebase]

**Primary recommendation:** Implement Phase 5 in four passes: `types.ts`/store contracts → bottom-panel review behavior → right-panel presets → right-panel capability toggles, with Playwright review/approval/status regression coverage after each pass. [VERIFIED: codebase]

## Project Constraints (from CLAUDE.md)

- Use GSD artifacts in `.planning/` as the source of truth for project context. [VERIFIED: CLAUDE.md]
- Follow roadmap order unless the user explicitly reprioritizes work. [VERIFIED: CLAUDE.md]
- Prefer `/gsd:discuss-phase N` before `/gsd:plan-phase N` for non-trivial phases. [VERIFIED: CLAUDE.md]
- Validate implementation decisions against `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`. [VERIFIED: CLAUDE.md]
- Preserve MVP boundaries: single-user, local-first, Windows-first. [VERIFIED: CLAUDE.md]
- Keep the app Windows-first. [VERIFIED: CLAUDE.md]
- Treat polished UI as product value, not optional follow-up. [VERIFIED: CLAUDE.md]
- Preserve the hybrid local CLI + Claude API architecture. [VERIFIED: CLAUDE.md]
- Keep credential handling secure and local-first. [VERIFIED: CLAUDE.md]
- Keep explicit command approval for impactful actions. [VERIFIED: CLAUDE.md]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Panel and shell rendering | Existing UI already uses React function components throughout layout surfaces. [VERIFIED: npm registry] [VERIFIED: codebase] |
| Zustand | 5.0.12 | Single shell workflow store | Existing app uses one orchestration store for session, execution, review, presets, and toggles. [VERIFIED: npm registry] [VERIFIED: codebase] |
| @tauri-apps/api | 2.10.1 | Frontend invoke boundary | Existing services use Tauri invoke for native capabilities. [VERIFIED: npm registry] [VERIFIED: codebase] |
| @tauri-apps/plugin-dialog | 2.7.0 | Native folder picker | Existing project selection uses the Tauri dialog plugin. [VERIFIED: npm registry] [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.7.0 | Shell and panel icons | Continue for small workflow/status icons in review and settings surfaces because it is already the app icon set. [VERIFIED: codebase] |
| Playwright | 1.59.1 | UI regression coverage | Use for workflow-state, review-surface, and right-panel behavior verification; test suite already includes startup, chooser, status, approval, and review specs. [VERIFIED: npm registry] [VERIFIED: codebase] |
| TypeScript | 5.6.3 | Shared UI contracts | Use for incremental type-safe contract changes in `types.ts`, store, and panels. [VERIFIED: codebase] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending existing Zustand store | New review/settings sub-stores | Adds coordination overhead and breaks the current single-orchestrator pattern without evidence of scale pressure. [VERIFIED: codebase] |
| Bottom-panel session review | Separate project-wide diff page | Contradicts locked decisions D-01 and D-02 and would detach review from execution/session state. [VERIFIED: CONTEXT.md] |
| Compact presets from shell state | Heavy config schema/editor | Contradicts D-05 and increases scope beyond current `ReviewPreset` contract. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |

**Installation:**
```bash
npm install
```

**Version verification:**
- React 19.2.4, registry modified 2026-04-03. [VERIFIED: npm registry]
- Zustand 5.0.12, registry modified 2026-03-16. [VERIFIED: npm registry]
- `@tauri-apps/api` 2.10.1, registry modified 2026-02-03. [VERIFIED: npm registry]
- `@tauri-apps/plugin-dialog` 2.7.0, registry modified 2026-04-04. [VERIFIED: npm registry]
- Playwright 1.59.1, registry modified 2026-04-06. [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure
```text
src/app/
├── state/
│   ├── types.ts            # canonical contracts for review/preset/capability state
│   └── appShellStore.ts    # orchestration and cross-panel state transitions
├── layout/
│   ├── BottomPanel.tsx     # approval/output/review supporting workflow tray
│   └── RightPanel.tsx      # settings, presets, capability toggles
└── services/
    ├── credentialService.ts # secure connection settings boundary
    └── projectService.ts    # project selection boundary
```

### Pattern 1: Contract-first shell polish
**What:** Add or refine review/preset/toggle fields in `types.ts` before touching panel rendering. `BottomPanel.tsx` and `RightPanel.tsx` both render store-derived state rather than owning durable workflow logic. [VERIFIED: codebase]
**When to use:** Any change that affects selection state, preset payloads, review readiness, labels, or future default behavior. [VERIFIED: codebase]
**Example:**
```typescript
export interface ReviewPreset {
  id: string
  name: string
  mode: AppMode
  modelId: ModelId
  openReviewByDefault: boolean
}

export interface SkillToggle {
  id: string
  label: string
  enabled: boolean
}
```
Source: `E:\work\ai\agent\src\app\state\types.ts` [VERIFIED: codebase]

### Pattern 2: Execution-bound review state
**What:** Review data should remain attached to the current `executionRecord`, with changed files selected by `selectedReviewFileId`. The tray auto-switches to review only when `executionRecord.changedFiles.length > 0`. [VERIFIED: codebase]
**When to use:** Implementing review-ready status, degraded review copy, selected-file retention, or inline review-summary behavior. [VERIFIED: codebase]
**Example:**
```typescript
function deriveTrayMode(state: AppShellState): DesktopTrayMode {
  if (state.pendingProposal) {
    return 'approval'
  }

  if (state.executionRecord?.changedFiles.length) {
    return 'review'
  }

  if (state.executionRecord || state.assistantStatus === 'streaming' || state.assistantError) {
    return 'output'
  }

  return 'collapsed'
}
```
Source: `E:\work\ai\agent\src\app\state\appShellStore.ts` [VERIFIED: codebase]

### Pattern 3: Thin support-surface settings
**What:** Presets and capability toggles belong in the right panel and should call store actions directly (`savePreset`, `applyPreset`, `toggleSkill`) instead of inventing a second settings orchestration layer. [VERIFIED: codebase]
**When to use:** Adding labels, small-copy improvements, default naming, active indicators, or compact toggle/preset affordances. [VERIFIED: codebase]
**Example:**
```typescript
<button className="right-panel__inline-action" onClick={() => savePreset(`Preset ${presets.length + 1}`)}>
  Save current
</button>

{skillToggles.map((skill) => (
  <button key={skill.id} className="right-panel__settings-item" onClick={() => toggleSkill(skill.id)}>
```
Source: `E:\work\ai\agent\src\app\layout\RightPanel.tsx` [VERIFIED: codebase]

### Recommended implementation split order
1. **Shared contracts and status rules first** — `src/app/state/types.ts`, then `src/app/state/appShellStore.ts`. This minimizes churn because both supporting panels and center-workflow status derive from these contracts. [VERIFIED: codebase]
2. **Review surface second** — `src/app/layout/BottomPanel.tsx`, plus any center-workspace inline review-ready summary hook-ups if needed. Review behavior is the most state-coupled and already depends on execution status, degraded output, and selected file state. [VERIFIED: codebase]
3. **Presets third** — extend `ReviewPreset` semantics and `savePreset`/`applyPreset` after state rules are stable. Presets should capture shell defaults, not retroactively rewrite live session history. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
4. **Capability toggles fourth** — polish labels, grouping, and enable/disable semantics after presets are settled, because toggles are visually adjacent in `RightPanel.tsx` but less execution-coupled. [VERIFIED: codebase]

### Files to change first
- `E:\work\ai\agent\src\app\state\types.ts` — first source of truth for any new preset/review/toggle contract. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\state\appShellStore.ts` — second, because all shell-region coordination flows through it. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\layout\BottomPanel.tsx` — third, for review split layout, empty/degraded states, and selected diff behavior. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\layout\RightPanel.tsx` — fourth, for presets and capability controls after state contracts settle. [VERIFIED: codebase]

### Files to avoid big-bang rewrites
- `E:\work\ai\agent\src\app\services\credentialService.ts` — current responsibility is narrow: secure credential/settings invoke wrapper; it is not the right place for preset or capability logic. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\services\projectService.ts` — current responsibility is native project picking and recent-project listing only; Phase 5 scope does not require redesigning it. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\layout\BottomPanel.tsx` and `RightPanel.tsx` should not be fully rewritten together; both are already aligned with the intended region ownership from Phase 5 context. Prefer targeted edits. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]

### Anti-Patterns to Avoid
- **Detached review browser:** Don’t move review to a project-wide git tool; it breaks D-01/D-02 and the current `executionRecord` contract. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
- **Preset persistence mixed into session history:** Don’t mutate existing sessions when applying presets; D-07 explicitly limits presets to future interactions/defaults. [VERIFIED: CONTEXT.md]
- **Capability toggles in center workspace:** D-09 explicitly keeps them in settings/support surfaces. [VERIFIED: CONTEXT.md]
- **Big-bang store/UI rewrite:** The current app already has viable contracts and tests; replacing them wholesale increases regression risk without unlocking required scope. [VERIFIED: codebase]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Review state ownership | Separate review subsystem or repo browser | Existing `ExecutionRecord.changedFiles` + `selectedReviewFileId` store flow | Already captures the session/execution-bound review requirement and avoids duplicate state. [VERIFIED: codebase] |
| Preset framework | Large settings schema/migration system | Existing `ReviewPreset` pattern in store | Locked decisions require compact presets derived from shell state. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |
| Capability admin UI | Full plugin/extension manager | Existing `SkillToggle[]` product-facing toggles in `RightPanel.tsx` | Marketplace-style management is explicitly deferred. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |
| Custom UI test harness | New browser harness | Existing Playwright setup and mocks | Playwright fixtures already model startup, chooser, status, approval, and review flows. [VERIFIED: codebase] |

**Key insight:** Phase 5 is mostly about making the existing shell contracts more cohesive, not inventing new durable subsystems. The codebase already contains the correct seams; the plan should exploit them. [VERIFIED: codebase]

## Common Pitfalls

### Pitfall 1: Review state drifts from execution state
**What goes wrong:** Bottom-panel review UI can show stale file selection or incorrect tray mode if `executionRecord`, `selectedReviewFileId`, and derived status are updated in different passes. [VERIFIED: codebase]
**Why it happens:** Review readiness is derived in multiple places: `deriveTrayMode`, `deriveDesktopStatus`, `approvePendingCommand().onReviewReady`, and `BottomPanel.tsx` selected-file fallback logic. [VERIFIED: codebase]
**How to avoid:** Change review contracts and store transitions before UI text/layout changes; add verification for first-file auto-selection, manual file switching, and degraded review fallback. [VERIFIED: codebase]
**Warning signs:** Toolbar says “Review ready” while review tab is empty, or selected file points to a removed ID. [VERIFIED: codebase]

### Pitfall 2: Presets accidentally change live session semantics
**What goes wrong:** Applying a preset can incorrectly appear to rewrite current session identity rather than future defaults. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
**Why it happens:** `applyPreset` currently sets `mode`, `globalDefaultModel`, and `bottomPanelTab` directly in store; careless expansion could also mutate `activeSessionModelOverride`, history, or transcript state. [VERIFIED: codebase]
**How to avoid:** Keep preset application scoped to shell defaults and future interactions; explicitly test that prior sessions and transcript metadata remain unchanged after applying a preset. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
**Warning signs:** Existing session header/model changes immediately after preset apply without a user starting/resuming a new workflow. [VERIFIED: codebase]

### Pitfall 3: Capability toggles become implementation jargon
**What goes wrong:** Labels stop being user-facing and start mirroring internal flags or module names. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
**Why it happens:** `SkillToggle` uses `id` plus `label`; only `label` is user-visible, so exposing `id`-like copy would violate D-10. [VERIFIED: codebase]
**How to avoid:** Treat `id` as internal and keep concise product-facing copy in the label and secondary state text. [VERIFIED: CONTEXT.md]
**Warning signs:** Settings surface contains terms like internal service/module names rather than workflow language. [VERIFIED: codebase]

### Pitfall 4: Degraded review state collapses into ambiguous empty state
**What goes wrong:** Users cannot tell whether there were no changes or whether diff generation failed/unavailable. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
**Why it happens:** `BottomPanel.tsx` supports both “No changed files are available yet.” and explicit degraded-review messaging parsed from system output. Losing that distinction weakens trust. [VERIFIED: codebase]
**How to avoid:** Preserve distinct copy and separate verification for zero-change, unavailable-review, and review-ready cases. [VERIFIED: codebase]
**Warning signs:** Review tab always shows the same empty text for all non-happy-path cases. [VERIFIED: codebase]

## Code Examples

Verified patterns from the current codebase:

### Keep review artifacts execution-scoped
```typescript
onReviewReady: (files) => {
  const changedFiles: ChangedFileReview[] = files.map((file) => ({
    id: `review-${crypto.randomUUID()}`,
    ...file,
  }))
  nextExecution = {
    ...nextExecution,
    changedFiles,
  }
  set({
    executionRecord: nextExecution,
    selectedReviewFileId: changedFiles[0]?.id ?? null,
    bottomPanelExpanded: true,
    bottomPanelTab: 'review',
  })
}
```
Source: `E:\work\ai\agent\src\app\state\appShellStore.ts` [VERIFIED: codebase]

### Keep review UI split between file list and diff preview
```typescript
<div className="bottom-panel__review-surface">
  <div className="bottom-panel__review-files">...</div>
  <div className="bottom-panel__review-diff">...</div>
</div>
```
Source: `E:\work\ai\agent\src\app\layout\BottomPanel.tsx` [VERIFIED: codebase]

### Keep presets compact and shell-derived
```typescript
const preset: ReviewPreset = {
  id: `preset-${crypto.randomUUID()}`,
  name,
  mode: state.mode,
  modelId: state.globalDefaultModel,
  openReviewByDefault: state.bottomPanelTab === 'review',
}
```
Source: `E:\work\ai\agent\src\app\state\appShellStore.ts` [VERIFIED: codebase]

### Keep capability toggles in the right-panel settings surface
```typescript
<div className="right-panel__section">
  <h2 className="right-panel__heading">Workflow capabilities</h2>
  <div className="right-panel__settings-list">
    {skillToggles.map((skill) => (
      <button key={skill.id} className="right-panel__settings-item" onClick={() => toggleSkill(skill.id)}>
```
Source: `E:\work\ai\agent\src\app\layout\RightPanel.tsx` [VERIFIED: codebase]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Detached or repo-level review thinking | Session/execution-bound changed-file review in supporting tray | Captured by Phase 5 context and current store/panel implementation | Keeps review tied to assistant actions rather than becoming a git client. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |
| Heavy settings/admin area | Compact support-surface presets and capability toggles in right panel | Captured by Phase 5 decisions and current UI | Preserves workflow cohesion and MVP scope. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |
| Manual ad hoc UI checks only | Playwright mock-driven workflow regression specs | Present in current test suite | Enables fast validation of status/review/approval/panel changes without full backend dependency. [VERIFIED: codebase] |

**Deprecated/outdated:**
- Project-wide or marketplace-style “skills management” for Phase 5: out of scope per deferred ideas and inconsistent with compact-toggle decisions. [VERIFIED: CONTEXT.md]

## Resolved Decisions

1. **Capability toggles scope**
   - **Decision:** Phase 5 should treat capability toggles as UI/state-level configurability, not as deep assistant/execution behavioral enforcement.
   - **Why:** The current code only supports lightweight enable/disable state in the shell, and expanding into deeper runtime gating would exceed the polish-focused scope of this phase.
   - **Planning impact:** Plans should polish labels, grouping, state handling, and persistence ergonomics without introducing a new deep capability-management subsystem.

2. **Inline review-ready state in center workspace**
   - **Decision:** Phase 5 should include a focused audit/polish pass for center-workspace inline review-ready and degraded-review messaging, but it should not trigger a broad center-workspace redesign.
   - **Why:** Review cohesion is part of product polish, yet ownership of detailed review remains in the bottom panel.
   - **Planning impact:** Plans should include small targeted center-workspace refinements only where they improve review cohesion with the bottom panel.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build, Playwright, npm scripts | ✓ | v24.14.1 | — |
| npm | Build and test scripts | ✓ | 11.12.1 | — |
| Rust/Cargo | Tauri/native validation if needed | ✓ | cargo 1.94.1 / rustc 1.94.1 | Frontend-only verification still possible for shell polish |
| Playwright | UI workflow regression checks | ✓ | 1.59.1 via `package.json` | Manual verification only if install is broken |

**Missing dependencies with no fallback:**
- None identified. [VERIFIED: environment]

**Missing dependencies with fallback:**
- None identified. [VERIFIED: environment]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.59.1 [VERIFIED: npm registry] [VERIFIED: codebase] |
| Config file | `E:\work\ai\agent\playwright.config.ts` [VERIFIED: codebase] |
| Quick run command | `npm run test:e2e:review` [VERIFIED: codebase] |
| Full suite command | `npm run test:e2e` [VERIFIED: codebase] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REVW-01 | Changed files appear in review tray and can be selected | e2e | `npm run test:e2e:review` | ✅ |
| REVW-02 | Diff preview and degraded review messaging behave correctly | e2e | `npm run test:e2e:review` | ✅ |
| CONF-03 | Preset save/apply changes future shell defaults without breaking current workflow | e2e/manual | `npm run test:e2e` | ❌ Wave 0 |
| CONF-04 | Capability toggles remain in right-panel settings and show correct enabled/disabled state | e2e/manual | `npm run test:e2e` | ❌ Wave 0 |

### Required validation methods
- **Build verification:** run `npm run build` after any contract/store/panel changes. [VERIFIED: codebase]
- **Review regression:** run `npm run test:e2e:review` after any `BottomPanel.tsx`, review contract, or execution status edit. [VERIFIED: codebase]
- **Approval/status regression:** run `npm run test:e2e:approval` and `npm run test:e2e:status` after any store status derivation changes, because review-ready, rejected, and failed states share the same status system. [VERIFIED: codebase]
- **Chooser/startup smoke:** run `npm run test:e2e:startup` and `npm run test:e2e:chooser` if changes touch shared desktop workflow derivation or global panel/state shape. [VERIFIED: codebase]
- **Manual right-panel verification:** verify preset naming, active-state copy, toggle labels, and apply/save affordances because no dedicated Playwright coverage for presets/toggles was found. [VERIFIED: codebase]

### Sampling Rate
- **Per task commit:** `npm run test:e2e:review` for review work, or the narrowest relevant Playwright spec for the touched flow. [VERIFIED: codebase]
- **Per wave merge:** `npm run build && npm run test:e2e` [VERIFIED: codebase]
- **Phase gate:** Full suite green plus targeted manual right-panel checks before `/gsd-verify-work`. [VERIFIED: codebase]

### Wave 0 Gaps
- [ ] `tests/e2e/presets.spec.ts` — covers CONF-03 save/apply/default behavior. [VERIFIED: codebase]
- [ ] `tests/e2e/capabilities.spec.ts` — covers CONF-04 toggle labels/state and right-panel placement. [VERIFIED: codebase]
- [ ] Manual checklist entry for degraded review vs zero-change review copy distinction. [VERIFIED: codebase]

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Local single-user desktop app; no user auth flow in researched scope. [VERIFIED: PROJECT.md] |
| V3 Session Management | yes | Persist session metadata/transcripts through existing session service; do not let presets rewrite historical session state. [VERIFIED: codebase] [VERIFIED: CONTEXT.md] |
| V4 Access Control | yes | Keep explicit command approval for impactful actions and preserve support-surface placement for settings/review controls. [VERIFIED: CLAUDE.md] [VERIFIED: codebase] |
| V5 Input Validation | yes | Preserve current Tauri command boundaries and typed store contracts for UI-to-native values. [VERIFIED: ARCHITECTURE.md] [VERIFIED: codebase] |
| V6 Cryptography | yes | Continue using OS keyring-backed credential handling via credential service; do not move secrets into presets. [VERIFIED: ARCHITECTURE.md] [VERIFIED: codebase] |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Settings surface accidentally exposes or stores secret material in plaintext preset data | Information Disclosure | Keep presets limited to workflow-facing shell choices; credentials remain in `credentialService`/native secure storage. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |
| Approval/review state desynchronization causes misleading execution status | Tampering | Keep one canonical store for execution/review state and verify approval/status/review regression tests together. [VERIFIED: codebase] |
| Unclear degraded-review copy masks git/review-collection failure | Repudiation | Preserve explicit degraded-review messaging parsed from system output. [VERIFIED: CONTEXT.md] [VERIFIED: codebase] |

## Consistency and UX Risks to Cover Explicitly

1. **Status vocabulary drift:** `Ready`, `Connected`, `Attached`, `Working`, `Awaiting approval`, `Rejected`, `Review ready`, and `Failed` are already used as canonical desktop workflow copy and tested in `status-system.spec.ts`; Phase 5 tasks must not introduce alternate wording in panels. [VERIFIED: codebase]
2. **Review-context drift:** Review must always read as “from this session action / latest approved execution,” not as generic workspace history. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
3. **Empty vs degraded confusion:** “No changed files” and “Review unavailable” must remain distinct states with different copy paths. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
4. **Preset surprise:** Applying a preset should feel like changing future defaults, not silently altering prior work or current session history. [VERIFIED: CONTEXT.md]
5. **Settings cohesion:** Right panel should remain concise and tool-like; presets and capabilities should feel adjacent to connection settings, not like a separate admin console. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]
6. **Non-destructive polish:** The plan should favor incremental edits so the desktop shell remains stable across startup, chooser, approval, and review flows already covered by Playwright. [VERIFIED: codebase]

## Sources

### Primary (HIGH confidence)
- `E:\work\ai\agent\.planning\phases\05-review-skills-workflow-polish\05-CONTEXT.md` - locked decisions, scope, and implementation anchors checked. [VERIFIED: codebase]
- `E:\work\ai\agent\.planning\PROJECT.md` - MVP boundaries and product constraints checked. [VERIFIED: codebase]
- `E:\work\ai\agent\.planning\REQUIREMENTS.md` - Phase 5 requirement IDs and descriptions checked. [VERIFIED: codebase]
- `E:\work\ai\agent\.planning\STATE.md` - current milestone and implementation-complete note checked. [VERIFIED: codebase]
- `E:\work\ai\agent\.planning\ROADMAP.md` - Phase 5 success criteria checked. [VERIFIED: codebase]
- `E:\work\ai\agent\.planning\codebase\ARCHITECTURE.md` - architecture and data-flow patterns checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\layout\BottomPanel.tsx` - review/output/approval UI behavior checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\layout\RightPanel.tsx` - presets/settings/capability UI checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\state\appShellStore.ts` - state orchestration, review linkage, preset save/apply, and toggles checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\state\types.ts` - review/preset/toggle contracts checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\services\credentialService.ts` - credential/settings boundary checked. [VERIFIED: codebase]
- `E:\work\ai\agent\src\app\services\projectService.ts` - project picker boundary checked. [VERIFIED: codebase]
- `E:\work\ai\agent\tests\e2e\review-flow.spec.ts` - review-ready and degraded-review coverage checked. [VERIFIED: codebase]
- `E:\work\ai\agent\tests\e2e\approval-flow.spec.ts` - approval/execution/rejection coverage checked. [VERIFIED: codebase]
- `E:\work\ai\agent\tests\e2e\status-system.spec.ts` - canonical status vocabulary coverage checked. [VERIFIED: codebase]
- `E:\work\ai\agent\tests\e2e\chooser.spec.ts` and `startup.spec.ts` - shared workflow-state coverage checked. [VERIFIED: codebase]
- npm registry - current versions for React, Zustand, Tauri packages, and Playwright checked. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- None.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries and versions were verified from `package.json` plus npm registry, and usage was verified in code. [VERIFIED: npm registry] [VERIFIED: codebase]
- Architecture: HIGH - shell region ownership, state orchestration, and review flow were directly verified in architecture docs and source files. [VERIFIED: codebase]
- Pitfalls: HIGH - major risks are directly implied by locked decisions, current store coupling, and existing Playwright coverage gaps. [VERIFIED: CONTEXT.md] [VERIFIED: codebase]

**Research date:** 2026-04-06
**Valid until:** 2026-05-06

## Assumptions Log

All claims in this research were verified or cited — no user confirmation needed.
