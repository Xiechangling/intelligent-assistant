# STACK

## Recommendation

**Recommended MVP stack:** **Tauri v2 + React 19 + TypeScript + Vite + Rust sidecar/command layer**, with **xterm.js** for terminal UI, **Zustand** for client state, **TanStack Query** for async/server state, and **SQLite + SQLx/Prisma-free lightweight persistence** for local metadata/session indexing.

## Core Stack

| Layer | Recommendation | Why | Confidence |
|---|---|---|---|
| Desktop shell | Tauri v2 | Smaller footprint than Electron, strong Rust-native boundaries, good fit for Windows-first local tools | High |
| Frontend | React 19 + TypeScript + Vite | Fast iteration, rich component ecosystem, good fit for complex multi-pane desktop UI | High |
| UI system | Tailwind CSS v4 + shadcn/ui | Fast polished desktop UI assembly without heavy design-system overhead | Medium |
| App state | Zustand | Simple local state for sessions, panes, approvals, selected project, model config | High |
| Async data | TanStack Query | Good for command status, session hydration, config fetch/update, background task refresh | High |
| Forms | React Hook Form + Zod | Useful for settings, model config, profile forms, validation | High |
| Terminal view | xterm.js | Mature embedded terminal surface for logs and interactive shell output | High |
| Command execution | Rust commands + spawned child processes / sidecars | Clear security boundary and better OS-level control than pure JS shelling | High |
| PTY layer | Rust-side PTY integration on Windows (ConPTY-compatible crate path) with thin frontend bridge | Keeps terminal/process handling native and closer to OS constraints | Medium |
| Secret storage | Windows Credential Manager via Tauri plugin/native Rust integration | Better than plaintext env/config files for API keys | High |
| Local persistence | SQLite for session/project metadata; filesystem for transcripts/diffs if needed | Reliable local-first persistence without service dependency | High |
| Packaging / updates | MSI installer first, auto-update later after core stability | Reduce updater complexity in MVP while keeping a clean Windows install path | Medium |
| Testing | Vitest + React Testing Library + Playwright + targeted Rust tests | Covers UI logic, flows, and native orchestration boundaries | High |

## Why This Stack Fits Intelligent Assistant

1. **Windows-first desktop delivery** favors native process control, secure local storage, and smaller installers.
2. **Hybrid local CLI + Claude API architecture** benefits from a Rust orchestration boundary that can safely manage subprocesses, filesystem access, and approval gates.
3. **Polished UI** is easier to deliver quickly with React ecosystem components than with a fully custom native UI stack.
4. **Personal MVP** does not need Electron's broader plugin/ecosystem weight if Tauri covers process and filesystem needs.

## Key Technical Choices

### Tauri over Electron
- Better default footprint for a utility-style desktop product
- Stronger boundary between frontend and privileged execution
- Better long-term fit if command execution and secret handling are first-class concerns
- Tradeoff: PTY/process integration is less turnkey than Electron/Node, so design the orchestration layer early

### Rust orchestration layer
Use Rust for:
- spawning/monitoring Claude Code CLI or helper subprocesses
- command approval pipeline
- filesystem-safe operations
- API key storage/retrieval
- session persistence and recovery
- diff/patch application coordination

Keep the frontend responsible for:
- layout and interaction
- session timeline visualization
- config/model switching UX
- approvals UI
- project/workspace management views

### SQLite over premature backend service
Use local SQLite for:
- project list
- session metadata
- model/config presets
- command history index
- approval records

Avoid adding a local HTTP backend for MVP unless desktop/native IPC proves insufficient.

## What To Avoid For MVP

| Avoid | Why |
|---|---|
| Electron-first architecture | Faster PTY familiarity, but heavier runtime and weaker default privilege separation for this product shape |
| Full plugin marketplace | Massive scope expansion before core workflow is validated |
| Multi-user sync architecture | Not aligned with self-use MVP |
| Remote database/backend | Adds ops and auth complexity without MVP value |
| Over-abstracted agent framework | Early product needs reliable orchestration, not a generic platform |
| Auto-update in v1 milestone | Useful later, but not before install, sessions, approvals, and project flows are stable |

## MVP Implementation Implications

1. Prove **project selection + session lifecycle + model switching + approval flow** before deeper extensibility.
2. Decide early whether Claude Code integration is a wrapped subprocess, embedded terminal workflow, or both.
3. Build PTY/terminal feasibility in Phase 1 or 2, not late.
4. Keep persistence local and simple.

## Suggested Versions / Ecosystem Direction

- Tauri v2
- React 19
- TypeScript 5.x
- Vite 6+
- Tailwind CSS v4
- Zustand 5.x
- TanStack Query 5.x
- React Hook Form 7.x
- Zod 3.x/4.x compatible path
- Vitest 2.x+
- Playwright latest stable

## Bottom Line

For this project, **Tauri + React + TypeScript + Rust-native orchestration** is the best MVP fit. It optimizes for Windows desktop UX, safer local execution boundaries, smaller distribution, and a strong path to project-aware agent tooling without dragging in unnecessary platform weight.
