# Phase 3 — UI Review

**Audited:** 2026-04-08
**Baseline:** UI-SPEC.md
**Screenshots:** not captured (no dev server)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Core Phase 3 project/conversation copy mostly matches the spec, but a few supporting strings drift from the contract. |
| 2. Visuals | 3/4 | The transcript-first shell is strong, but project mode is visually diluted by later-phase approval/review/execution cards inline above the transcript. |
| 3. Color | 3/4 | The main dark-field palette and accent family align well with the spec, though there is substantial hardcoded color usage and some accent expansion outside the narrow contract. |
| 4. Typography | 1/4 | The implementation uses many off-contract font sizes like 10px, 11px, 13px, 16px, 18px, 21px, and 22px instead of the declared 12/14/20/28 scale. |
| 5. Spacing | 2/4 | The final token scale is corrected to 4/8/16/24/32/48, but the stylesheet still contains many hardcoded 6px/10px/14px/18px values and duplicated earlier spacing rules. |
| 6. Experience Design | 2/4 | Loading, empty, error, and streaming states exist, but Phase 3 mode boundaries are weakened by in-scope conversation surfaces rendering later-phase approval and review workflows inline. |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Normalize typography to the UI-SPEC scale** — inconsistent text sizing weakens hierarchy and makes the shell feel less polished — replace off-contract sizes (10/11/13/16/18/21/22px) with the declared 12/14/20/28 roles and keep weights to 400/600.
2. **Remove Phase 4/5 inline workflow cards from the Phase 3 center transcript surface** — approval, execution, and review summaries compete with the conversation-first reading flow and violate the retrospective scope contract — gate `InlineApprovalSummary`, `InlineWorkflowStatusSummary`, `InlineReviewSummary`, and later transcript event treatments behind later-phase views instead of always showing them in project sessions.
3. **Consolidate spacing onto the declared token scale** — mixed hardcoded values create rhythm drift and make maintenance harder — replace raw 6/10/14/18px gaps and paddings with `--space-1` through `--space-6` only, and remove duplicated pre-token rule blocks from `app-shell.css`.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- The core project-mode copy matches the contract well:
  - `Start a coding session` at `src/app/layout/CenterWorkspace.tsx:180`
  - `Describe the task for this workspace to begin an attached coding session.` at `src/app/layout/CenterWorkspace.tsx:183`
  - `Send instruction` at `src/app/layout/CenterWorkspace.tsx:664`
  - `Describe the next task for this workspace.` at `src/app/layout/CenterWorkspace.tsx:690`
  - `Type / to use slash commands` at `src/app/layout/CenterWorkspace.tsx:678`
- The conversation-mode contract also mostly matches:
  - `Start a conversation` at `src/app/layout/CenterWorkspace.tsx:180`
  - `Send a message without opening a workspace.` at `src/app/layout/CenterWorkspace.tsx:184`
  - `Send message` at `src/app/layout/CenterWorkspace.tsx:664`
  - `Streaming conversation updates.` at `src/app/layout/CenterWorkspace.tsx:198`
- The error title is close but not exact to the UI-SPEC error state contract. The spec calls for `Assistant request failed. Review the message, then retry the instruction or continue from the same session.` while the UI currently shows the title `Assistant request failed` and then raw error text at `src/app/layout/CenterWorkspace.tsx:867-872`.
- Supporting copy drifts from the contract in a few places:
  - `Send message without switching the coding workspace` at `src/app/layout/CenterWorkspace.tsx:943` adds a new phrase not defined by the UI-SPEC.
  - `Session chooser` as a fallback session label at `src/app/layout/TopToolbar.tsx:113` is serviceable but more operational than user-facing.
- Generic action labels exist in supporting surfaces outside the central Phase 3 conversation contract, including `Save settings`, `Clear settings`, and `Save current` in `src/app/layout/RightPanel.tsx:252-274`.

### Pillar 2: Visuals (3/4)
- The central structure is good and matches the intended hierarchy: session header, transcript, and pinned composer are clearly separated in `src/app/layout/CenterWorkspace.tsx:747-805` and styled by `src/styles/app-shell.css:1730-1786`.
- Transcript event types are visually distinct:
  - user/assistant messages at `src/app/layout/CenterWorkspace.tsx:153-163`
  - stage cards at `src/app/layout/CenterWorkspace.tsx:85-92`
  - tool summary cards at `src/app/layout/CenterWorkspace.tsx:94-103`
- The toolbar keeps mode, workspace, and session context visible, which supports the shell contract well at `src/app/layout/TopToolbar.tsx:153-179`.
- Main visual issue: project mode is no longer purely a Phase 3 conversation surface. Inline cards for approval, execution status, and review are rendered before the transcript in `src/app/layout/CenterWorkspace.tsx:784-786`, which pulls attention away from the conversation-first reading flow required by the spec.
- Additional out-of-scope event styling for `approval-request`, `approval-resolution`, `execution-update`, and `review-available` appears directly in the transcript renderer at `src/app/layout/CenterWorkspace.tsx:106-151`, further weakening the clean Phase 3 event model.

### Pillar 3: Color (3/4)
- The implemented token palette aligns closely with the UI-SPEC:
  - dominant `#0f1116` / shell family in `src/styles/app-shell.css:6-13`
  - accent `#7d98ff` in `src/styles/app-shell.css:23`
  - destructive `#e06c75` in `src/styles/app-shell.css:26`
- User messages appropriately use an accent-filled treatment, while assistant messages use neutral dark surfaces:
  - user bubble at `src/styles/app-shell.css:806-811`
  - assistant bubble at `src/styles/app-shell.css:813-817`
- Status pills and active segmented controls use accent sparingly enough to preserve hierarchy in the main shell.
- The main weakness is maintainability and contract discipline: `src/styles/app-shell.css` includes a large number of hardcoded hex and rgba values instead of consistently flowing through the declared tokens, visible throughout the stylesheet including `:root` token declarations and many direct color assignments such as `src/styles/app-shell.css:52-53`, `228-231`, `808-809`, and `1119-1121`.
- Accent and semantic color usage are also expanded into later-phase approval/review/execution surfaces, which is visually coherent but beyond the narrow Phase 3 contract.

### Pillar 4: Typography (1/4)
- The UI-SPEC declares only four sizes for Phase 3 surfaces: 12px, 14px, 20px, and 28px, with weights limited to 400 and 600.
- The stylesheet uses many off-contract sizes, including:
  - `10px` at `src/styles/app-shell.css:823`
  - `11px` at `src/styles/app-shell.css:312`, `335`, `384`, `415`, `481`, `500`, `1084`
  - `13px` at `src/styles/app-shell.css:303`, `531`, `537`, `589`, `665`, `720`, `867`, `1113`
  - `16px` at `src/styles/app-shell.css:659`, `2264`
  - `18px` at `src/styles/app-shell.css:1360`
  - `21px` at `src/styles/app-shell.css:606`
  - `22px` at `src/styles/app-shell.css:580`
- The good news is that weights are largely kept to `400` and `600`, which does align with the contract in places like `src/styles/app-shell.css:1900-1914` and `2005-2080`.
- Overall, the type system feels visually polished in places but does not meet the explicit Phase 3 typography contract.

### Pillar 5: Spacing (2/4)
- The final token declarations do align to the spec scale at the bottom of the file:
  - `--space-1: 4px` through `--space-6: 48px` at `src/styles/app-shell.css:1848-1853`
- Large layout regions also land on spec-friendly values such as 24px, 32px, and 48px in places like `src/styles/app-shell.css:1460-1483` and `1485-1491`.
- However, the same stylesheet still contains many earlier hardcoded values that are off-scale or duplicated, including:
  - `6px` at `src/styles/app-shell.css:529`, `1053`
  - `10px` at `src/styles/app-shell.css:184`, `258`, `352`, `758`, `884`, `909`, `1074`
  - `14px` at `src/styles/app-shell.css:491`, `494`, `632`, `692`, `803`, `1004`
  - `18px` at `src/styles/app-shell.css:33`, `1011`, `1159`
- The stylesheet appears to include an older rule set followed by a later normalized rule set, which increases the chance of accidental regressions and makes spacing harder to reason about.
- This means the implementation partially meets the contract visually but not systemically.

### Pillar 6: Experience Design (2/4)
- Positive coverage:
  - Empty states are present for project and conversation modes in `src/app/layout/CenterWorkspace.tsx:177-187`.
  - Workspace-required state is present at `src/app/layout/CenterWorkspace.tsx:397-420`.
  - Recovery/loading/failure states are present at `src/app/layout/CenterWorkspace.tsx:423-461`, `875-898`, and `988-998`.
  - Streaming state is visible through the transcript indicator at `src/app/layout/CenterWorkspace.tsx:195-200`.
  - Error state is visible inline at the top of the workspace via `src/app/layout/CenterWorkspace.tsx:866-873`.
- Project and conversation mode composers are correctly differentiated in one shared component at `src/app/layout/CenterWorkspace.tsx:631-711`.
- The main gap is scope discipline and reading flow. The Phase 3 spec explicitly excludes approval gating, execution output review, and review-ready surfaces, yet project sessions render inline approval, workflow, and review summaries at `src/app/layout/CenterWorkspace.tsx:464-589` and inject later-phase event types into the transcript renderer at `src/app/layout/CenterWorkspace.tsx:106-151`.
- That makes the user experience more cluttered than the approved Phase 3 contract and reduces the clarity of the two-mode split described in `03-UI-SPEC.md`.

---

## Files Audited
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/01-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/02-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/03-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/04-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/01-PLAN.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/02-PLAN.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/03-PLAN.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/04-PLAN.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/03-UI-SPEC.md`
- `E:/work/ai/agent/.planning/phases/03-conversational-coding-workflow/03-CONTEXT.md`
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`
- `E:/work/ai/agent/src/app/layout/TopToolbar.tsx`
- `E:/work/ai/agent/src/app/layout/RightPanel.tsx`
- `E:/work/ai/agent/src/styles/app-shell.css`
