# Phase 5: Review, Skills & Workflow Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the auto-selected assumptions used for autonomous execution.

**Date:** 2026-04-06
**Phase:** 05-review-skills-workflow-polish
**Mode:** auto discuss
**Areas discussed:** Review surfaces, Presets and reuse, Workflow capabilities, Product cohesion

---

## Review surfaces

| Option | Description | Selected |
|--------|-------------|----------|
| Session-tied bottom-panel review | Keep changed-file list and diff preview linked to the active execution/session | ✓ |
| Detached repo diff browser | Make review independent from the session timeline | |
| Right-panel review | Move diff inspection into the inspector | |

**Auto choice:** Session-tied bottom-panel review.
**Notes:** Best matches the existing shell and keeps review tied to assistant-driven work instead of turning the app into a generic git client.

---

## Presets and reuse

| Option | Description | Selected |
|--------|-------------|----------|
| Lightweight runtime presets | Save/apply mode/model/review preference from shell state | ✓ |
| Large config profiles | Introduce a heavier separate configuration system | |
| No preset reuse | Keep all runtime choices ad hoc per session | |

**Auto choice:** Lightweight runtime presets.
**Notes:** Delivers reuse value without expanding beyond MVP scope.

---

## Workflow capabilities

| Option | Description | Selected |
|--------|-------------|----------|
| GUI capability toggles in settings | Keep feature toggles compact and understandable in the right panel | ✓ |
| Center-workspace controls | Put capability management into the primary interaction surface | |
| Hidden config-only controls | Require non-GUI workflow management | |

**Auto choice:** GUI capability toggles in settings.
**Notes:** Aligns with right-panel ownership and keeps the center workspace focused on active work.

---

## Product cohesion

| Option | Description | Selected |
|--------|-------------|----------|
| Same-workflow polish | Make review, presets, and skills feel like one cohesive desktop product | ✓ |
| Utility-first add-ons | Treat these as separate support modules | |
| Terminal-parity only | Keep desktop surfaces minimal and defer workflow polish | |

**Auto choice:** Same-workflow polish.
**Notes:** This is the core value of Phase 5 and the reason it should improve meaningfully over terminal-only usage.

---

## Claude's Discretion

- Exact preset names and small helper copy
- Exact visual density of review rows and diff blocks
- Exact workflow capability labels and ordering

## Deferred Ideas

- Team/shared review workflows
- Cloud-synced presets
- Plugin marketplace or third-party extension ecosystem
