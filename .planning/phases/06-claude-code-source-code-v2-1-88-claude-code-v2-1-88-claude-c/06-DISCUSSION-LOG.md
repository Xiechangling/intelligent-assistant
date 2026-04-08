# Phase 6: Claude Code Desktop Alignment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the auto-selected assumptions used for autonomous execution.

**Date:** 2026-04-06
**Phase:** 06-claude-code-source-code-v2-1-88-claude-code-v2-1-88-claude-c
**Mode:** auto discuss
**Areas discussed:** Reference alignment, Desktop shell direction, Session and workspace experience, Interaction model, Scope controls

---

## Reference alignment

| Option | Description | Selected |
|--------|-------------|----------|
| Adapt official source concepts into current Tauri architecture | Preserve current app architecture while aligning workflow and UX with Claude Code v2.1.88 | ✓ |
| Port upstream UI/runtime directly | Attempt to transplant official code and runtime assumptions into this app | |
| Ignore reference source and continue custom UX | Keep evolving the app without strong official alignment | |

**Auto choice:** Adapt official source concepts into current Tauri architecture.
**Notes:** Chosen because the current app already has a coherent Tauri + React + Rust structure, while the vendored reference snapshot is better suited as behavioral guidance than drop-in implementation.

---

## Desktop shell direction

| Option | Description | Selected |
|--------|-------------|----------|
| Keep five-region shell, redesign inner workflow | Preserve established shell structure but make the experience feel more official | ✓ |
| Replace shell with terminal-like single-pane UI | Move closer to CLI mirroring at the expense of desktop product affordances | |
| Only restyle existing surfaces | Cosmetic polish without information-architecture changes | |

**Auto choice:** Keep five-region shell, redesign inner workflow.
**Notes:** Earlier phases locked in the shell structure, and the user asked to continue from the current project rather than restart the product architecture.

---

## Session and workspace experience

| Option | Description | Selected |
|--------|-------------|----------|
| Make session/workspace attachment first-class | Shift the product toward clearer official-style session chooser and resume semantics | ✓ |
| Keep simple history list only | Leave current session selection UX mostly unchanged | |
| Focus on generic chat first | Prioritize conversation mode over coding workspace alignment | |

**Auto choice:** Make session/workspace attachment first-class.
**Notes:** Supported by the official `AssistantSessionChooser`, `sessionDiscovery`, `sessionHistory`, and bridge/session types, and aligns with the user’s stated priority.

---

## Interaction model

| Option | Description | Selected |
|--------|-------------|----------|
| Conversation-first with stronger workflow state framing | Keep transcript readability while making status, approvals, and review state feel integrated | ✓ |
| Fully log-centric execution viewer | Make the app read more like a terminal/debug console | |
| Minimal chat-only rendering | Hide workflow state details unless users open secondary panels | |

**Auto choice:** Conversation-first with stronger workflow state framing.
**Notes:** This carries forward Phase 3 decisions while integrating Phases 4-5 into a more coherent official-feeling desktop workflow.

---

## Scope controls

| Option | Description | Selected |
|--------|-------------|----------|
| Stay within single-user desktop workflow refinement | Refine information architecture, state model, and UX without adding collaboration or sync | ✓ |
| Expand into cloud/shared capabilities | Start implementing multi-user or synced desktop features | |
| Freeze architecture and do only copy polish | Avoid multi-file restructuring even if needed for official alignment | |

**Auto choice:** Stay within single-user desktop workflow refinement.
**Notes:** Matches PROJECT.md, REQUIREMENTS.md, and the user’s request to continue the desktop version rather than expand product scope.

---

## Claude's Discretion

- Exact naming of the new session/workspace surfaces
- Exact visual distribution of state between workspace, inspector, and bottom tray
- Exact wording of official-style lifecycle/status copy

## Deferred Ideas

- Collaboration and shared workspaces
- Cloud sync and hosted session sharing
- Plugin marketplace or third-party extension ecosystem
- Literal upstream UI/runtime embedding
