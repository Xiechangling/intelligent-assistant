---
phase: 5
slug: review-skills-workflow-polish
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright + build gate + targeted manual settings checks |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run test:e2e && npm run build` |
| **Estimated runtime** | ~90-240 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run the narrowest affected Playwright specs, then `npm run build`
- **Before `/gsd-verify-work`:** Run `npm run test:e2e && npm run build`
- **Max feedback latency:** 240 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | REVW-01, REVW-02 | T-05-01 | Review state remains execution/session-scoped and selected-file behavior stays tied to the active execution | e2e + build | `npm run test:e2e:review && npm run build` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | REVW-01, REVW-02 | T-05-01 | Diff preview, empty state, and degraded review state remain distinct and visible | e2e + build | `npm run test:e2e:review && npm run build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | CONF-03 | T-05-04 / T-05-05 | Presets affect future shell defaults without leaking secrets or rewriting session history | e2e + build | `npx playwright test tests/e2e/presets.spec.ts && npm run build` | ✅ planned in Plan 02 | ⬜ pending |
| 05-02-02 | 02 | 2 | CONF-04 | T-05-06 | Capability toggles remain compact, product-facing, and settings-bound | e2e + build | `npx playwright test tests/e2e/capabilities.spec.ts && npm run build` | ✅ planned in Plan 02 | ⬜ pending |
| 05-03-01 | 03 | 3 | REVW-01, REVW-02, CONF-03, CONF-04 | T-05-07 / T-05-08 / T-05-09 | Review, presets, and workflow capability polish remain cohesive across shell surfaces | e2e + build + manual | `npm run test:e2e && npm run build` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 3 | REVW-01, REVW-02, CONF-03, CONF-04 | T-05-07 | Manual UAT explicitly distinguishes review-ready, degraded review, presets, and workflow capabilities | document check | `python - <<'PY'
from pathlib import Path
path = Path(r'E:/work/ai/agent/.planning/phases/05-review-skills-workflow-polish/05-HUMAN-UAT.md')
text = path.read_text(encoding='utf-8')
required = ['Review ready', 'Review unavailable', 'Preset', 'Workflow capabilities']
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit(f'Missing manual checklist anchors: {missing}')
print('manual checklist anchors present')
PY` | ✅ planned in Plan 03 | ⬜ pending |
| 05-03-03 | 03 | 3 | REVW-01, REVW-02, CONF-03, CONF-04 | T-05-07 / T-05-08 / T-05-09 | Human verification confirms cohesive review and settings workflow before signoff | manual | `npm run test:e2e && npm run build` plus `05-HUMAN-UAT.md` | ✅ planned in Plan 03 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Validation Completion Strategy

Phase 5 does **not** require a separate bootstrap Wave 0. The current missing preset/capability verification assets are explicitly created by the planned execution itself:

- `05-02-PLAN.md` creates `tests/e2e/presets.spec.ts`
- `05-02-PLAN.md` creates `tests/e2e/capabilities.spec.ts`
- `05-03-PLAN.md` consolidates package scripts and manual UAT around those assets

This means validation gaps are closed **inside the normal phase execution flow**, not by a pre-plan placeholder wave.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Preset application changes future defaults only | CONF-03 | Human confirmation is still needed that preset application feels future-facing rather than history-mutating | Save/apply a preset in the right panel, then confirm future shell defaults change without rewriting prior session history |
| Capability toggles remain support-surface controls | CONF-04 | Product-facing clarity and settings placement still benefit from manual review | Open the right panel and confirm capability toggles remain concise, understandable, and do not move into the center workspace |
| Review empty vs degraded states remain distinguishable in real shell | REVW-01, REVW-02 | Browser tests may not capture every runtime combination | Verify both no-changed-files and review-unavailable scenarios produce distinct copy and tray behavior |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or explicit manual verification coverage
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify path
- [x] Validation gaps for presets/capabilities are explicitly closed by Plan 02 and Plan 03
- [x] No watch-mode flags
- [x] Feedback latency < 240s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
