# Phase 4: Safe Execution & Visibility - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the auto-selected assumptions used for autonomous execution.

**Date:** 2026-04-06
**Phase:** 04-safe-execution-visibility
**Mode:** auto discuss
**Areas discussed:** Approval visibility, Execution output surface, Working-context safeguards, Presentation model

---

## Approval visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Inline summary + detailed tray context | Keep approval near the conversation while using bottom panel for exact command/workspace detail | ✓ |
| Modal approval dialog | Interrupt flow with separate modal confirmation | |
| Right-panel-only approval | Move approval decisions into the inspector | |

**Auto choice:** Inline summary + detailed tray context.
**Notes:** Best matches the established shell and keeps the center workflow primary while preserving explicit safety detail.

---

## Execution output surface

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom panel output stream | Show structured output in the existing collapsible tray | ✓ |
| Replace transcript with log view | Turn center workspace into temporary execution console | |
| Right panel log summary | Compress execution output into the inspector | |

**Auto choice:** Bottom panel output stream.
**Notes:** Carries forward the shell decision from Phase 1 and preserves conversation-first project workflow from Phase 3.

---

## Working-context safeguards

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit project/working-directory context plus root containment | Show command context clearly and enforce project-boundary execution | ✓ |
| Rely on project selection only | Assume active project is enough context | |
| Allow arbitrary working directory overrides | Favor flexibility over visible safety | |

**Auto choice:** Explicit project/working-directory context plus root containment.
**Notes:** Directly satisfies `EXEC-01` to `EXEC-03` and matches the current native validation pattern in `execution_service.rs`.

---

## Presentation model

| Option | Description | Selected |
|--------|-------------|----------|
| Conversation-first with workflow events | Approval and execution appear as transcript events plus supporting panels | ✓ |
| Tool-log-first | Make execution output the dominant reading surface | |
| Inspector-first workflow | Put primary command state in the right panel | |

**Auto choice:** Conversation-first with workflow events.
**Notes:** Carries forward Phase 3’s project workflow model while reserving detailed execution visibility for supporting surfaces.

---

## Claude's Discretion

- Exact helper copy for approval and execution status
- Exact bottom-panel tab wording and icon treatment
- Exact transcript event wording for approval/execution transitions

## Deferred Ideas

- Richer diff review polish — Phase 5
- Skills/config capability management — Phase 5
- Remote/shared execution controls — future phase
