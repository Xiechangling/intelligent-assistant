# Codebase Structure

**Analysis Date:** 2026-04-02

## Directory Layout

```text
E:/work/ai/agent/
├── .planning/                 # GSD planning artifacts and generated codebase maps
├── src/                       # React frontend for the desktop shell
│   ├── app/                   # Feature-oriented UI shell code
│   │   ├── layout/            # Shell regions and primary UI surfaces
│   │   ├── services/          # Frontend adapters to Tauri commands and plugins
│   │   └── state/             # Zustand store and shared UI/session types
│   └── styles/                # Global shell stylesheet
├── src-tauri/                 # Tauri desktop backend and packaging config
│   ├── src/                   # Rust command modules and app entrypoints
│   ├── capabilities/          # Tauri capability declarations
│   ├── gen/                   # Generated Tauri schema output
│   ├── icons/                 # App icons for packaging
│   └── target/                # Rust build output
├── dist/                      # Frontend build output consumed by Tauri packaging
├── package.json               # Frontend package manifest and scripts
├── vite.config.ts             # Vite frontend dev/build config
├── tsconfig.json              # TypeScript compiler config
└── src-claude-code-v2.1.88/   # Vendored upstream Claude Code source snapshot
```

## Directory Purposes

**`.planning/`:**
- Purpose: Store GSD planning assets and generated repository reference docs.
- Contains: `E:/work/ai/agent/.planning/PROJECT.md`, `E:/work/ai/agent/.planning/REQUIREMENTS.md`, `E:/work/ai/agent/.planning/ROADMAP.md`, `E:/work/ai/agent/.planning/phases/`, `E:/work/ai/agent/.planning/codebase/`
- Key files: `E:/work/ai/agent/.planning/PROJECT.md`, `E:/work/ai/agent/.planning/REQUIREMENTS.md`, `E:/work/ai/agent/.planning/ROADMAP.md`

**`src/`:**
- Purpose: Hold the frontend application that renders the desktop UI.
- Contains: `E:/work/ai/agent/src/main.tsx`, `E:/work/ai/agent/src/App.tsx`, `E:/work/ai/agent/src/app/`, `E:/work/ai/agent/src/styles/app-shell.css`
- Key files: `E:/work/ai/agent/src/main.tsx`, `E:/work/ai/agent/src/App.tsx`

**`src/app/layout/`:**
- Purpose: Hold top-level shell UI regions and their rendering logic.
- Contains: `E:/work/ai/agent/src/app/layout/AppShell.tsx`, `E:/work/ai/agent/src/app/layout/TopToolbar.tsx`, `E:/work/ai/agent/src/app/layout/LeftSidebar.tsx`, `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`, `E:/work/ai/agent/src/app/layout/RightPanel.tsx`, `E:/work/ai/agent/src/app/layout/BottomPanel.tsx`
- Key files: `E:/work/ai/agent/src/app/layout/AppShell.tsx`, `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`

**`src/app/services/`:**
- Purpose: Hold frontend-side boundary adapters for native features.
- Contains: `E:/work/ai/agent/src/app/services/assistantService.ts`, `E:/work/ai/agent/src/app/services/sessionService.ts`, `E:/work/ai/agent/src/app/services/projectService.ts`, `E:/work/ai/agent/src/app/services/credentialService.ts`, `E:/work/ai/agent/src/app/services/attachmentService.ts`
- Key files: `E:/work/ai/agent/src/app/services/assistantService.ts`, `E:/work/ai/agent/src/app/services/sessionService.ts`

**`src/app/state/`:**
- Purpose: Hold persistent UI workflow state contracts and the global store.
- Contains: `E:/work/ai/agent/src/app/state/appShellStore.ts`, `E:/work/ai/agent/src/app/state/types.ts`
- Key files: `E:/work/ai/agent/src/app/state/appShellStore.ts`, `E:/work/ai/agent/src/app/state/types.ts`

**`src/styles/`:**
- Purpose: Hold the application-wide shell styling.
- Contains: `E:/work/ai/agent/src/styles/app-shell.css`
- Key files: `E:/work/ai/agent/src/styles/app-shell.css`

**`src-tauri/`:**
- Purpose: Hold native desktop runtime code and Tauri packaging configuration.
- Contains: `E:/work/ai/agent/src-tauri/Cargo.toml`, `E:/work/ai/agent/src-tauri/tauri.conf.json`, `E:/work/ai/agent/src-tauri/src/`, `E:/work/ai/agent/src-tauri/icons/`, `E:/work/ai/agent/src-tauri/capabilities/`
- Key files: `E:/work/ai/agent/src-tauri/Cargo.toml`, `E:/work/ai/agent/src-tauri/tauri.conf.json`

**`src-tauri/src/`:**
- Purpose: Hold Rust entrypoints and domain service modules exposed to the UI.
- Contains: `E:/work/ai/agent/src-tauri/src/main.rs`, `E:/work/ai/agent/src-tauri/src/lib.rs`, `E:/work/ai/agent/src-tauri/src/project_service.rs`, `E:/work/ai/agent/src-tauri/src/session_service.rs`, `E:/work/ai/agent/src-tauri/src/credential_service.rs`, `E:/work/ai/agent/src-tauri/src/assistant_service.rs`, `E:/work/ai/agent/src-tauri/src/execution_service.rs`
- Key files: `E:/work/ai/agent/src-tauri/src/lib.rs`, `E:/work/ai/agent/src-tauri/src/session_service.rs`, `E:/work/ai/agent/src-tauri/src/execution_service.rs`

**`src-claude-code-v2.1.88/`:**
- Purpose: Hold a vendored upstream Claude Code codebase snapshot used as local reference material.
- Contains: `E:/work/ai/agent/src-claude-code-v2.1.88/src/`, `E:/work/ai/agent/src-claude-code-v2.1.88/vendor/`
- Key files: `E:/work/ai/agent/src-claude-code-v2.1.88/src/main.tsx`, `E:/work/ai/agent/src-claude-code-v2.1.88/src/commands.ts`

## Key File Locations

**Entry Points:**
- `E:/work/ai/agent/src/main.tsx`: Frontend React mount point.
- `E:/work/ai/agent/src/App.tsx`: Root React component that triggers recovery and returns the shell.
- `E:/work/ai/agent/src-tauri/src/main.rs`: Native executable entrypoint.
- `E:/work/ai/agent/src-tauri/src/lib.rs`: Tauri application builder and command registration point.

**Configuration:**
- `E:/work/ai/agent/package.json`: Frontend scripts and dependencies.
- `E:/work/ai/agent/vite.config.ts`: Frontend dev server and build configuration.
- `E:/work/ai/agent/tsconfig.json`: TypeScript compiler configuration.
- `E:/work/ai/agent/src-tauri/Cargo.toml`: Rust crate and native dependency configuration.
- `E:/work/ai/agent/src-tauri/tauri.conf.json`: Desktop window, bundle, and frontend integration settings.

**Core Logic:**
- `E:/work/ai/agent/src/app/state/appShellStore.ts`: Central application workflow controller.
- `E:/work/ai/agent/src/app/state/types.ts`: Shared TypeScript domain model.
- `E:/work/ai/agent/src/app/services/assistantService.ts`: Assistant request and execution invoke wrappers.
- `E:/work/ai/agent/src-tauri/src/assistant_service.rs`: Anthropic request handling and planner prompt construction.
- `E:/work/ai/agent/src-tauri/src/session_service.rs`: Session persistence and recovery storage.
- `E:/work/ai/agent/src-tauri/src/execution_service.rs`: Approved command execution and git review extraction.

**Testing:**
- Not detected. No frontend or Rust test directories or `*.test.*` / `*.spec.*` architecture entrypoints are present in the mapped application paths `E:/work/ai/agent/src/` and `E:/work/ai/agent/src-tauri/src/`.

## Naming Conventions

**Files:**
- React layout components use PascalCase filenames: `E:/work/ai/agent/src/app/layout/AppShell.tsx`, `E:/work/ai/agent/src/app/layout/TopToolbar.tsx`.
- Frontend service and state modules use camelCase filenames: `E:/work/ai/agent/src/app/services/assistantService.ts`, `E:/work/ai/agent/src/app/state/appShellStore.ts`.
- Rust backend modules use snake_case filenames: `E:/work/ai/agent/src-tauri/src/session_service.rs`, `E:/work/ai/agent/src-tauri/src/credential_service.rs`.
- Global stylesheet uses kebab-case: `E:/work/ai/agent/src/styles/app-shell.css`.

**Directories:**
- Frontend feature directories are short lowercase nouns: `E:/work/ai/agent/src/app/layout`, `E:/work/ai/agent/src/app/services`, `E:/work/ai/agent/src/app/state`.
- Native backend source stays under `E:/work/ai/agent/src-tauri/src` with per-concern module files instead of nested service folders.
- Planning content uses lowercase directories with phase-specific subfolders: `E:/work/ai/agent/.planning/phases/01-desktop-shell-project-foundation`.

## Where to Add New Code

**New Feature:**
- Primary code: Add UI surfaces in `E:/work/ai/agent/src/app/layout/` when the feature changes shell presentation; add orchestration in `E:/work/ai/agent/src/app/state/appShellStore.ts` when the feature needs shared workflow state; add invoke adapters in `E:/work/ai/agent/src/app/services/` when the feature crosses into native code.
- Tests: Not established in the current app. Introduce tests next to the feature area once a test framework is added, with frontend tests under `E:/work/ai/agent/src/app/` and native tests inside the relevant Rust module under `E:/work/ai/agent/src-tauri/src/`.

**New Component/Module:**
- Implementation: Place new shell-level React components in `E:/work/ai/agent/src/app/layout/` if they render a region or workspace surface. Place shared workflow types in `E:/work/ai/agent/src/app/state/types.ts` or split a new file under `E:/work/ai/agent/src/app/state/` if the type surface grows. Place new native commands as a new Rust module in `E:/work/ai/agent/src-tauri/src/` and register it in `E:/work/ai/agent/src-tauri/src/lib.rs`.

**Utilities:**
- Shared helpers: Keep frontend invoke helpers and boundary code in `E:/work/ai/agent/src/app/services/`. Keep native validation and persistence helpers private inside the relevant Rust module in `E:/work/ai/agent/src-tauri/src/*.rs` unless multiple commands need the same helper, at which point introduce a new shared Rust module in `E:/work/ai/agent/src-tauri/src/` and import it from `E:/work/ai/agent/src-tauri/src/lib.rs`.

## Special Directories

**`E:/work/ai/agent/.planning/codebase`:**
- Purpose: Store generated codebase reference documents for future GSD planning and execution.
- Generated: Yes
- Committed: Yes

**`E:/work/ai/agent/src-tauri/target`:**
- Purpose: Store Rust compiler and linker build artifacts.
- Generated: Yes
- Committed: No

**`E:/work/ai/agent/dist`:**
- Purpose: Store built frontend assets consumed by `E:/work/ai/agent/src-tauri/tauri.conf.json` during packaging.
- Generated: Yes
- Committed: No

**`E:/work/ai/agent/src-tauri/gen`:**
- Purpose: Store generated Tauri schema output.
- Generated: Yes
- Committed: Yes

**`E:/work/ai/agent/src-claude-code-v2.1.88`:**
- Purpose: Store vendored upstream reference code outside the active app architecture.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-02*
