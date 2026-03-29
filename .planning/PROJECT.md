# Intelligent Assistant

## What This Is

Intelligent Assistant is a Windows-first desktop application that turns the Claude Code workflow into a polished local GUI experience for a single power user. It combines natural-language coding assistance, project workspace management, model switching, session management, and configurable skills into one desktop product inspired by Claude Code and cc-switch. The MVP focuses on making local coding-agent work more intuitive than the terminal-first experience.

## Core Value

Make Claude Code-style local coding workflows significantly easier to configure, control, and reuse from a desktop interface without losing the power of project-aware agent execution.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can open the desktop app, select or manage a local project directory, and work against that project context.
- [ ] User can start, resume, and manage coding sessions through a natural-language desktop interface.
- [ ] User can switch models, adjust key runtime configuration, and review command/diff outcomes from the GUI.

### Out of Scope

- Team collaboration and multi-user shared workspaces — initial version is intentionally optimized for single-user workflows.
- Cloud sync and plugin marketplace features — these add platform and product complexity before the core desktop workflow is validated.

## Context

The product is motivated by daily use of Claude Code in the terminal for knowledge Q&A, code analysis, and code modification. The current pain points are command-line startup friction, awkward interaction and configuration, non-intuitive model switching, and poor session visibility. The user wants a desktop product that combines the strengths of Claude Code and cc-switch while keeping project-aware local agent workflows intact. The MVP should prioritize polished usability, visible state, and developer productivity over collaboration or ecosystem expansion.

## Constraints

- **Platform**: Windows-first desktop delivery — the initial product should optimize for Windows developer workflows before expanding to other platforms.
- **Scope**: MVP for self-use — feature selection should favor single-user productivity over generalized team capabilities.
- **UX**: Polished desktop UI — interface quality is part of the product value, not a later enhancement.
- **Architecture**: Hybrid local CLI + Claude API approach — preserve strong local project/task execution while enabling richer desktop control surfaces.
- **Security**: Local-first access model with API key support — sensitive configuration and command execution boundaries must remain explicit and safe.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a desktop GUI rather than extend terminal usage | Main user pain is CLI friction around startup, configuration, and visibility | — Pending |
| Optimize MVP for a single self-user on Windows first | Current adoption target is the project creator, not teams | — Pending |
| Use a hybrid architecture that combines local CLI orchestration with Claude API control | This best matches the desired blend of Claude Code power and richer desktop interaction | — Pending |
| Treat model switching, session management, and project management as core MVP capabilities | These are the main reasons the existing workflow feels cumbersome | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 after initialization*
