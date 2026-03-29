# SUMMARY

## Stack
For the MVP, the strongest fit is **Tauri v2 + React 19 + TypeScript + Rust-native orchestration**. This gives Intelligent Assistant a lighter Windows-first desktop footprint than Electron, while keeping privileged execution, filesystem access, subprocess management, and secret handling behind a stronger native boundary. Use **xterm.js** for terminal rendering, **Zustand** for app state, **TanStack Query** for async task/session state, **SQLite** for local metadata, and Windows credential storage for API keys.

## Table Stakes
The product must make the everyday Claude Code workflow easier from a GUI. Core expectations are:
- project directory management
- session creation, resume, and history
- model selection and quick switching
- natural-language chat/task interaction
- explicit command approval
- terminal/log visibility
- diff/change review

These are the features that directly solve the user's current pain around CLI startup, configuration, model switching, and session visibility.

## Recommended MVP Shape
Build a **single-user, local-first desktop workbench** with four primary surfaces:
1. project/session sidebar
2. main conversation pane
3. terminal/task output pane
4. diff/review pane

Under the hood, use a hybrid execution model:
- **Claude API path** for model-driven chat/config interactions
- **local CLI/subprocess path** for project-aware coding actions and shell execution

## Key Architecture Insight
Do not make the app a thin chatbot wrapper. The real value is in combining **desktop visibility + local project control + safe execution boundaries**. The right shape is a React desktop UI over a Rust orchestration layer that normalizes events from both Claude API and local subprocess workflows.

## Watch Out For
The most important risks are:
- delaying PTY/process validation too long
- weak approval UX for impactful commands
- incomplete session restoration
- secret leakage into logs/config
- wrong-project execution due to poor context visibility

## Table Stakes vs Deferred
### Include in v1
- project management
- session management
- model switching
- chat/task interaction
- approvals
- terminal/log view
- diff preview
- basic skills/settings configuration
- reusable config templates

### Defer
- team collaboration
- shared workspaces
- cloud sync
- plugin marketplace
- broad extensibility platform work

## Build Order Implication
The safest sequence is:
1. app shell + project/settings foundation
2. session lifecycle + persistence
3. assistant interaction + streaming
4. command execution + approvals + terminal integration
5. diff/review flows
6. presets, skills configuration, polish

## Bottom Line
Intelligent Assistant should be built as a **Windows-first, polished, single-user desktop coding assistant** that preserves Claude Code’s local power while making model switching, session management, project context, and approval/review flows dramatically easier to use.
