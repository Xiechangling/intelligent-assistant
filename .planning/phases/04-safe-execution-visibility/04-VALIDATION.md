---
phase: 4
slug: safe-execution-visibility
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-06
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright + build gate + native Tauri manual verification |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run test:e2e:approval && npm run test:e2e:review && npm run test:e2e:status && npm run build` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run test:e2e:approval && npm run test:e2e:review && npm run test:e2e:status && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | EXEC-01, EXEC-03 | T-04-01 | Approval payload and session timeline remain synchronized | build | `npm run build` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | EXEC-02 | T-04-01 | Output/review state derives from one execution contract | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | EXEC-01, EXEC-03 | T-04-02 | Approval UI shows exact command, workspace path, and working directory | e2e | `npm run test:e2e:approval` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | EXEC-02 | T-04-03 | Output/review visibility stays attached to the active session flow | e2e | `npm run test:e2e:review` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 3 | EXEC-01, EXEC-02, EXEC-03 | T-04-08 / T-04-09 | Approval, review, and canonical status labels stay stable under automated coverage | e2e + build | `npm run test:e2e:approval && npm run test:e2e:review && npm run test:e2e:status && npm run build` | ✅ | ⬜ pending |
| 04-03-02 | 03 | 3 | EXEC-03 | T-04-10 | Native runtime rejects out-of-project working directories and preserves session continuity | manual | `npm run tauri:dev` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Add or tighten automated reject-path coverage in `tests/e2e/approval-flow.spec.ts`
- [ ] Add explicit degraded-review visibility coverage in `tests/e2e/review-flow.spec.ts`
- [ ] Keep `tests/e2e/status-system.spec.ts` asserting exact canonical labels used by approval/output/review surfaces
- [ ] Preserve native desktop verification through `.planning/phases/04-safe-execution-visibility/04-HUMAN-UAT.md`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native Tauri shell launch and tray behavior | EXEC-01, EXEC-02 | Browser E2E cannot prove native shell parity | Run `npm run tauri:dev`, trigger an approval-required command, and verify tray auto-expansion in the desktop window |
| Out-of-project working-directory rejection | EXEC-03 | Native Rust containment enforcement lives behind the Tauri command boundary | Use the Phase 4 UAT flow to provoke a blocked execution and confirm the rejection message/state |
| Degraded review path in non-git or no-diff conditions | EXEC-02 | Real repo/runtime state affects review availability | Follow `04-HUMAN-UAT.md` and confirm explicit degraded review messaging instead of silent success |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual verification requirements
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers missing trust-critical checks
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
