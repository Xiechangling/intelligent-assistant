# Phase 6 — UI Review

**Audited:** 2026-04-08
**Baseline:** `06-UI-SPEC.md`
**Screenshots:** not captured (no dev server)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Most critical Phase 6 labels match the spec, but a few secondary strings drift from the contract or weaken action clarity. |
| 2. Visuals | 3/4 | The region hierarchy and session-first structure are strong in code, but several surfaces still show density and emphasis drift that likely blunts the intended focal hierarchy. |
| 3. Color | 2/4 | Semantic color intent is present, but accent usage is over-broad and multiple hardcoded highlight values dilute the spec’s restrained 60/30/10 system. |
| 4. Typography | 2/4 | The later CSS layer moves toward the contract, but the file still contains many legacy font sizes outside the required four-size system. |
| 5. Spacing | 2/4 | The second token pass improves spacing, yet the stylesheet still carries many legacy 6/10/14/18/22 values and duplicate token layers that break the 4-point contract. |
| 6. Experience Design | 4/4 | Startup, chooser, approval, output, review, disabled composer states, and recovery/error handling are all explicitly covered in the Phase 6 workflow. |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **Finish removing the legacy token layer from `app-shell.css`** — mixed spacing/type scales create inconsistent density and make the UI harder to scan — consolidate to one final token source using only the declared 4-point spacing values and four typography sizes.
2. **Tighten copy to fully match the UI contract on secondary paths** — wording drift weakens the official-feeling session workflow and makes some actions less explicit — replace custom secondary copy such as workspace/conversation fallback text with spec-aligned labels and confirmations.
3. **Reduce accent-color spread and hardcoded highlights** — overusing blue and multiple bespoke highlight values weakens status semantics and primary-focus signaling — reserve accent for selected rows, primary actions, connected/attached states, and explicit review affordances only.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

Strong alignment with required contract strings:
- `No workspace selected` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:407`
- `Session recovery failed` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:435`
- `No sessions yet` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:453`
- `Resume session` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:309`
- `Open session chooser` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:312`
- `Approve and run` / `Reject command` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:494-497` and `E:/work/ai/agent/src/app/layout/BottomPanel.tsx:178-185`
- `Open review` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:582`
- `Reload history` in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:921`
- `Waiting for execution output.` in `E:/work/ai/agent/src/app/layout/BottomPanel.tsx:200`
- `No changed files are available yet.` in `E:/work/ai/agent/src/app/layout/BottomPanel.tsx:219,254`

Copy drift and usability issues:
- The destructive confirmation contract from the spec is not surfaced as explicit confirmation copy before rejection; the UI only shows the button label `Reject command` in `BottomPanel.tsx:178-180` and `CenterWorkspace.tsx:493-495`.
- Secondary conversation-path copy diverges from the contract and becomes more conversational than operational: `Send message without opening a workspace` in `CenterWorkspace.tsx:417` and `Send message without switching the coding workspace` in `CenterWorkspace.tsx:943`.
- The toolbar workspace picker title uses `Open workspace folder` in `TopToolbar.tsx:147`, which is understandable but slightly off from the contract’s `Open workspace` phrasing.
- Settings copy is clear but drifts away from the phase’s operational vocabulary, for example `Save current` and `No presets saved yet.` in `RightPanel.tsx:273,278`.

### Pillar 2: Visuals (3/4)

What is working:
- The shell preserves the intended five-region structure in `E:/work/ai/agent/src/app/layout/AppShell.tsx:13-30`.
- The center workspace clearly owns startup, chooser, session, transcript, approval summary, and review summary in `CenterWorkspace.tsx:875-998`, which matches the spec’s hierarchy.
- The bottom panel is lifecycle-driven rather than acting like a generic utility tray in `BottomPanel.tsx:65-91,149-268`.
- Supporting surfaces remain supportive: toolbar status is compact, sidebar is navigational, and right panel is metadata/settings oriented.

Likely visual-hierarchy issues from code evidence:
- The stylesheet still contains multiple overlapping generations of rules, including duplicated `:root`, `.workspace`, `.workspace__surface`, `.workspace__inline-surface`, `.toolbar`, and `.app-shell--drawer-open` definitions in `app-shell.css:1-35`, `1844-1854`, and many repeated blocks across the file. This usually leads to visual drift and makes the final hierarchy hard to keep intentional.
- The toolbar context grid can become dense with three stacked context items plus preset pill and status chip (`TopToolbar.tsx:153-179`), which may compete more than intended with the center workspace.
- Several supporting elements still use prominent pill/card treatments, especially repeated chips and inset cards across sidebar/right panel/bottom panel, increasing visual noise instead of quiet support.

### Pillar 3: Color (2/4)

Positive:
- The base color family broadly follows the spec: dominant dark canvas `#0f1116`, secondary `#151920`, accent `#7d98ff`, warning `#d9a441`, destructive `#e06c75` in `E:/work/ai/agent/src/styles/app-shell.css:6-26`.
- Status-tone mapping exists in both `TopToolbar.tsx:45-63` and `CenterWorkspace.tsx:47-65`.
- Approval is correctly mapped to warning tones and failure to danger tones in several pill and surface classes, e.g. `app-shell.css:1670-1679`, `1936-1948`.

Issues:
- Accent treatment is applied to many more surfaces than the spec reserves it for, including toolbar active segments, selected rows, status chips, review markers, spotlight states, user-message gradients, primary CTA gradients, and review CTA text across `app-shell.css:225-232`, `462-463`, `734-735`, `808-810`, `1117-1122`, `1664-1685`, `1721-1728`, `1929-1955`.
- The stylesheet relies on numerous hardcoded color values instead of consistently routing through semantic tokens, including `#869dff`, `#6a80e5`, `#8fa4ff`, `#6f84e9`, `#f0cb83`, `#f0a4ab`, and `#f3d7a6` in `app-shell.css:523,808-809,1119-1120,1635,1646,1673,1679,1941,1948,2155,2172,2254`.
- User messages use a bright accent gradient in `app-shell.css:806-810`, which makes chat bubbles visually louder than the spec’s desktop-workbench feel suggests.

### Pillar 4: Typography (2/4)

Positive:
- The later CSS pass explicitly pushes many shell elements to the target sizes and weights, especially 12/600 and 14/400 blocks in `app-shell.css:1890-1927`, `2005-2080`, `2121-2138`, `2232-2235`.
- Major headings use 20px and 28px in important places such as `app-shell.css:1703-1705` and `1502-1504`.

Issues against the spec’s four-size contract:
- The stylesheet still contains many legacy font sizes outside the allowed set of 12, 14, 20, and 28, including 10, 11, 13, 16, 18, 21, and 22 in `app-shell.css:312,335,384,415,481,531,537,580,606,659,720,789,823,1016,1044,1113,1257,1360,2264`.
- Legacy and final typography layers coexist in the same file, so the system is not actually simplified yet.
- Small text remains overused for metadata and labels, which may reduce scanability in a desktop tool intended to feel polished rather than cramped.

### Pillar 5: Spacing (2/4)

Positive:
- A compliant token layer is declared later in the file with 4/8/16/24/32/48 spacing in `E:/work/ai/agent/src/styles/app-shell.css:1848-1853`.
- Primary controls respect the 44px minimum in `app-shell.css:1810-1815`, and the shell keeps the 56px toolbar row in `app-shell.css:94`.

Issues:
- The original non-compliant spacing token layer still exists at the top of the file with `6/10/14/18/24/32` in `app-shell.css:30-35`.
- Many legacy spacing values remain directly in rules throughout the file, including `10px`, `14px`, `18px`, and `22px` in examples such as `app-shell.css:346,352,491,510,561,580,632,691,803,872,1011,1288,1345,1360`.
- Duplicate rule blocks mean spacing is being normalized by override rather than by true cleanup, which increases future drift risk and weakens consistency.

### Pillar 6: Experience Design (4/4)

Strong implementation coverage:
- Explicit startup states and recovery/no-workspace/chooser/session branches exist in `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx:875-998`.
- Loading and recovery states are represented, including `Loading workspace and recent sessions.` and recovery retry in `CenterWorkspace.tsx:988-996`.
- Composer disables during streaming or pending approval in `CenterWorkspace.tsx:962,982` and button/input disabled wiring in `CenterWorkspace.tsx:670-700`.
- Approval flow is cohesive across inline summary and lifecycle tray in `CenterWorkspace.tsx:464-501` and `BottomPanel.tsx:149-188`.
- Output and review states are handled thoroughly, including degraded review and empty review states in `BottomPanel.tsx:192-264`.
- Error handling exists for assistant, session history, recovery, and credential settings across `CenterWorkspace.tsx:866-873,916-924`, `TopToolbar.tsx:91-93`, and `RightPanel.tsx:111-129`.
- First changed file auto-selection is supported in store logic via `syncReviewSelection()` in `E:/work/ai/agent/src/app/state/appShellStore.ts:236-252` and invoked during review transitions in `appShellStore.ts:1260-1262,1310`.

Minor caveat:
- Rejecting a command appears immediate and non-confirmed in the UI layer, so the interaction is safe in outcome but lighter than the spec’s explicit destructive-confirmation copy.

---

## Registry audit
Registry audit skipped: `06-UI-SPEC.md` declares no third-party registry usage and `shadcn_initialized` is `false`.

---

## Files Audited
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-01-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-02-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-03-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-04-SUMMARY.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-01-PLAN.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-02-PLAN.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-03-PLAN.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-04-PLAN.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-UI-SPEC.md`
- `E:/work/ai/agent/.planning/phases/06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c/06-CONTEXT.md`
- `E:/work/ai/agent/CLAUDE.md`
- `E:/work/ai/agent/src/app/layout/AppShell.tsx`
- `E:/work/ai/agent/src/app/layout/TopToolbar.tsx`
- `E:/work/ai/agent/src/app/layout/LeftSidebar.tsx`
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`
- `E:/work/ai/agent/src/app/layout/RightPanel.tsx`
- `E:/work/ai/agent/src/app/layout/BottomPanel.tsx`
- `E:/work/ai/agent/src/app/state/appShellStore.ts`
- `E:/work/ai/agent/src/app/state/types.ts`
- `E:/work/ai/agent/src/styles/app-shell.css`
