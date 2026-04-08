# Retrospective

## Milestone: v2.1.88 — milestone

**Shipped:** 2026-04-08
**Phases:** 6 | **Plans:** 20

### What Was Built
- Windows-first desktop shell with native project picker and secure local credentials
- Durable sessions, recovery, resume, and project-aware history
- Dual-mode assistant conversations with true backend-to-frontend streaming
- Approval, execution output, and review-ready lifecycle tray
- Presets and workflow capability controls in the settings surface
- Claude Code Desktop v2.1.88-inspired chooser/session/workflow alignment

### What Worked
- GSD phase decomposition kept feature scope understandable across shell, session, execution, and review work.
- One shared Zustand shell store made cross-surface status, chooser, tray, and session state much easier to keep coherent.
- Playwright startup/approval/review/status coverage was the highest-leverage verification layer for closing stale verification gaps.

### What Was Inefficient
- Multiple phases had planning/verification artifacts that drifted behind the live code and had to be backfilled later.
- Some tests and review expectations became stale as workflow semantics evolved, especially around completed review states and model-selector behavior.
- `app-shell.css` accumulated overlapping token layers and legacy spacing/type values, which increased UI audit noise.

### Patterns Established
- Thin Tauri service wrappers over native Rust commands remain the right frontend boundary.
- Lifecycle-driven bottom tray is the correct ownership model for approval, output, and review.
- turnId-scoped assistant streaming events are the right contract for true incremental assistant delivery.
- Future-default model switching should stay distinct from active session model override.

### Key Lessons
- Fresh verification evidence matters more than historical `human_needed` / `gaps_found` states when re-auditing milestones.
- If a phase evolves materially after its original pass, refresh its verification and review artifacts before milestone closure.
- E2E expectations must track current product semantics, not frozen intermediate interpretations.

### Cost Observations
- Verification confidence improved the most when startup, approval, review, status, Rust stream tests, and build were all green at the same time.
- Shared-state desktop products benefit from explicit integration checks even when individual phases already verify as passed.

## Cross-Milestone Trends

- v2.1.88 established the shipped MVP baseline.
- The next milestone should begin from fresh requirements, not by mutating archived MVP scope in place.
