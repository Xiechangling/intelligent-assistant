# Phase 3: Conversational Coding Workflow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 03-conversational-coding-workflow
**Areas discussed:** Input surfaces, Response presentation, Message structure, Coding task presentation

---

## Input surfaces

| Option | Description | Selected |
|--------|-------------|----------|
| Shared input surface | Project mode and pure conversation mode reuse the same central input behavior | |
| Different input surfaces | Project mode and pure conversation mode use clearly different input experiences | ✓ |
| Custom description | User describes a bespoke interaction model | |

**User's choice:** Different input surfaces
**Notes:** User then chose a project-mode coding command bar and a standard pure-conversation chat input.

---

## Project-mode input style

| Option | Description | Selected |
|--------|-------------|----------|
| Coding command bar | Claude Code / agent-control style task entry against active project | ✓ |
| Chat input with project context | Standard chat input with project/session context around it | |
| Dual-layer input | Natural-language input plus separate coding action shortcuts | |

**User's choice:** Coding command bar
**Notes:** User wants project mode to feel like Claude Code CLI and similar agent workflows.

---

## Pure conversation input style

| Option | Description | Selected |
|--------|-------------|----------|
| Standard chat input | Mainstream natural chat product interaction | ✓ |
| Light agent input | Some task feel, but without project emphasis | |
| Same as project mode | Similar interaction with project context removed | |

**User's choice:** Standard chat input
**Notes:** User explicitly wants clear differentiation from project mode.

---

## Response presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Both stream, different styles | Project mode uses task-flow styling, pure conversation uses chat-flow styling | ✓ |
| Project mode staged cards, pure conversation stream | Stronger visual separation but heavier workflow UI | |
| Both plain stream | Simple first cut with minimal differentiation | |

**User's choice:** Both stream, different styles
**Notes:** User later specified project mode should use stage-oriented flow referencing Claude Code CLI / agent workflows.

---

## Project-mode task flow depth

| Option | Description | Selected |
|--------|-------------|----------|
| Light status only | Simple status labels with main reply text dominant | |
| Status plus stage segments | Distinct workflow stages such as understanding, analysis, acting, done | ✓ |
| Terminal-like log stream | Heavy process/log visibility | |

**User's choice:** Status plus stage segments
**Notes:** User explicitly referenced Claude Code CLI and agent workflows as the model.

---

## Message structure

| Option | Description | Selected |
|--------|-------------|----------|
| Four visible types | User, assistant, stage-status, and tool/action summary messages | ✓ |
| Three types | User, assistant, and stage-status only | |
| Two types | User and assistant only | |

**User's choice:** Four visible types
**Notes:** This locks a richer project-mode transcript structure for planning.

---

## Coding task presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Conversation-first + task summary blocks | Main assistant response remains primary, with embedded supporting task summaries | ✓ |
| Task-block-first | Agent run units dominate, conversation becomes secondary | |
| Natural language only | No separate task blocks | |

**User's choice:** Conversation-first + task summary blocks
**Notes:** User wants task structure visible, but not to overpower the main conversation reading flow.

---

## Claude's Discretion

- Exact stage wording and microcopy
- Exact visual design of supporting task summary blocks
- Fine-grained input affordances not explicitly discussed

## Deferred Ideas

- Approval workflow and command review belong to Phase 4
- Execution log/details belong to Phase 4
- Diff review belongs to Phase 5
