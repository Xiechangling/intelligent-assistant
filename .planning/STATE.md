# STATE

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Make Claude Code-style local coding workflows significantly easier to configure, control, and reuse from a desktop interface without losing the power of project-aware agent execution.
**Current focus:** Phase 1 — Desktop Shell & Project Foundation

## Current Status

- Project initialized through GSD new-project flow
- Research completed for stack, features, architecture, and pitfalls
- Requirements defined and fully mapped to roadmap phases
- Ready to discuss and plan Phase 1

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Desktop Shell & Project Foundation | Next |
| 2 | Session Persistence & Recovery | Pending |
| 3 | Conversational Coding Workflow | Pending |
| 4 | Safe Execution & Visibility | Pending |
| 5 | Review, Skills & Workflow Polish | Pending |

## Notes

- Product scope is intentionally single-user, local-first, and Windows-first for MVP.
- Hybrid architecture remains the guiding direction: desktop GUI + local CLI orchestration + Claude API.
- Highest-risk areas identified by research are PTY/process handling, approval UX, session restoration, and secret safety.
