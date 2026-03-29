# ARCHITECTURE

## Recommended System Shape

Intelligent Assistant should use a **4-layer hybrid desktop architecture**:

1. **Desktop UI layer** — React-based multi-pane application
2. **Desktop orchestration layer** — Tauri/Rust commands handling privileged local operations
3. **Assistant integration layer** — Claude API client + local Claude Code / helper subprocess integration
4. **Workspace/persistence layer** — local filesystem, SQLite metadata store, secure secret storage

## Major Components

### 1. Desktop UI Layer
Responsibilities:
- project/session navigation
- prompt entry and transcript rendering
- model/config/settings views
- command approval UI
- terminal/log panel
- diff/review panel

Should not directly perform privileged shell/file operations.

### 2. Orchestration Layer
Responsibilities:
- validate and broker frontend requests
- spawn/monitor subprocesses
- manage command approvals
- collect stdout/stderr/task status
- read/write session metadata
- retrieve/store API keys securely
- coordinate diffs and file snapshots

This is the trust boundary between GUI and system actions.

### 3. Assistant Integration Layer
Responsibilities split:

**Claude API path**
- model-driven chat completions
- settings/model switching
- direct streaming for assistant responses where local CLI is not required

**Local CLI/subprocess path**
- project-aware coding workflows
- shell/tool execution
- repo/task operations resembling Claude Code behavior
- terminal-driven operations that need local context

### 4. Workspace / Persistence Layer
Includes:
- project directory references
- session metadata database
- local transcript storage if needed
- approval records
- config templates/presets
- secure API key storage

## Data Flow

### Standard conversational flow
1. User selects project + session in UI
2. UI sends prompt/config context to orchestration layer
3. Orchestration decides route:
   - Claude API direct path for chat/config-first interactions
   - local CLI/subprocess path for project-aware coding tasks
4. Streaming events are normalized
5. UI renders messages, tasks, approvals, and outputs
6. Session metadata is persisted locally

### Command execution flow
1. Assistant proposes command or tool action
2. Orchestration classifies whether approval is required
3. UI shows approval card with context
4. User approves/rejects
5. Orchestration executes via subprocess/PTY
6. Logs/status stream back to UI
7. Results attach to session and optional diff view

### Diff/review flow
1. File edits or repo changes detected
2. Orchestration gathers changed files/diff data
3. UI presents review surface
4. User inspects or accepts next action

## Key Boundaries

### Frontend boundary
Frontend must never become the place where raw shell access lives. It should request actions, not execute them.

### Execution boundary
Only orchestration layer may:
- launch commands
- access PTY
- touch secure secrets
- mutate protected local state

### Persistence boundary
Sensitive material should be separated:
- API keys in secure OS storage
- session/project metadata in SQLite
- optional verbose logs/transcripts on disk with clear retention rules

## Suggested Build Order

### Phase 1
- app shell
- project selection
- settings/model management foundation
- persistence foundation

### Phase 2
- session lifecycle
- chat transcript UI
- assistant streaming path

### Phase 3
- local command execution + approvals
- terminal/log views

### Phase 4
- diff/review integration
- skills config + presets
- UX polish and recovery paths

## Failure Modes To Design For

- subprocess hangs or zombie processes
- PTY incompatibilities on Windows
- session corruption or incomplete recovery after crash
- mismatched state between UI and running task
- secret leakage into logs or plain config files
- unsafe execution from unclear approval UX
- filesystem actions against wrong project root

## Security Boundaries

- require explicit project root selection
- normalize and validate file paths before operations
- separate read-only inspection from mutating actions
- require approval for impactful commands/edits
- redact secrets from logs and transcript surfaces
- make active model/project/session visibly obvious

## Bottom Line

The right architecture is a **React desktop workbench over a Rust orchestration core**, routing between **Claude API interactions** and **local Claude Code-like subprocess workflows**, with strong local persistence and explicit execution safety.
