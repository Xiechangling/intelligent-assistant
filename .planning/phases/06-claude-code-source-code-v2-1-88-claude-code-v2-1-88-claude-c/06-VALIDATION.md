---
phase: 6
slug: claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-06
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright + npm build gate |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run test:e2e` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | PH6-03 | T-06-01 | Canonical status is centrally derived, not panel-local | build | `npm run build` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | PH6-01, PH6-03 | T-06-01 | Recovery/chooser/approval/review state remains explicit and safe | build | `npm run build` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | PH6-01, PH6-02, PH6-04 | T-06-15 | Startup and chooser states match approved desktop workflow | e2e | `npm run test:e2e -- startup chooser` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | PH6-04 | T-06-15 | Active session surface preserves transcript-first flow with stronger lifecycle framing | e2e | `npm run test:e2e -- status-system` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 3 | PH6-03, PH6-05, PH6-06 | T-06-13 | Supporting regions reflect canonical status and lifecycle semantics | e2e | `npm run test:e2e -- approval-flow review-flow` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 4 | PH6-07 | T-06-14 / T-06-15 | Validation stack exists and does not depend on live secrets | build + e2e | `npm run build && npm run test:e2e` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — baseline config for Phase 6 desktop workflow verification
- [ ] `tests/e2e/startup.spec.ts` — startup/recovery/no-workspace checks
- [ ] `tests/e2e/chooser.spec.ts` — workspace/session chooser checks
- [ ] `tests/e2e/status-system.spec.ts` — canonical status label checks
- [ ] `tests/e2e/approval-flow.spec.ts` — approval/output flow checks
- [ ] `tests/e2e/review-flow.spec.ts` — review-ready and diff checks
- [ ] `npm install -D playwright` — if Playwright is not already installed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tauri desktop window launches with redesigned shell | PH6-07 | Browser E2E alone cannot prove native desktop launch quality | Run repo-local Tauri dev command and confirm window launch succeeds |
| Recovery spotlight and chooser hierarchy feel correct in desktop context | PH6-01, PH6-02 | Final judgment depends on whole-shell hierarchy, not isolated DOM assertions | Follow Phase 6 verification checklist and compare against UI-SPEC |
| Right panel remains supportive and bottom tray remains lifecycle-focused | PH6-05, PH6-06 | Layout emphasis and region priority need human confirmation | Verify center workspace remains primary while right panel/tray stay subordinate |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
