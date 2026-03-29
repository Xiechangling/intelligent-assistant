# Validation Strategy — Phase 1: Desktop Shell & Project Foundation

**Phase:** 1
**Date:** 2026-03-30

## Validation Architecture

### Goal-backward checks
The plans for this phase must collectively prove:
1. The desktop app renders the agreed IDE-style shell with top, left, center, right, and bottom regions.
2. The shell visibly supports project mode and pure conversation mode with toolbar-based switching.
3. Project folder selection, recent-project persistence, active project display, and warning-but-continue behavior exist.
4. Model controls are visible in the toolbar and support global-default plus session-override-ready state shape.
5. Secure credential storage uses an OS-backed/native secure storage path instead of plaintext normal config persistence.

### Required evidence types
- Source code reads for shell layout, toolbar controls, state stores, and credential services
- UI component reads for the app shell and workspace entry states
- Configuration/state persistence reads for recent projects, mode, and model defaults
- Test commands for shell rendering and state/service behavior where applicable

### Anti-shallow safeguards
Plans should fail verification if they only:
- create a generic chat page without the five-region shell
- add a toolbar without project/mode/model visibility
- store credentials in plain JSON/localStorage/app config
- conflate project selection with automatic session creation
- defer pure conversation mode shell support entirely

### Planner expectations
Every plan should make its target evidence explicit in acceptance criteria, including exact files, exact exported functions/components, and exact visible behaviors to confirm.
