# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**
- TypeScript - Frontend application code in `src/`, including `src/main.tsx`, `src/App.tsx`, `src/app/services/credentialService.ts`, and `src/app/state/appShellStore.ts`
- Rust 2021 edition - Desktop backend and native command layer in `src-tauri/src/lib.rs`, `src-tauri/src/assistant_service.rs`, `src-tauri/src/session_service.rs`, and related Tauri command modules

**Secondary:**
- JSON - Project and desktop configuration in `package.json`, `tsconfig.json`, `src-tauri/tauri.conf.json`, and `src-tauri/capabilities/default.json`
- CSS - Desktop shell styling in `src/styles/app-shell.css`
- HTML - Vite entry document in `index.html`

## Runtime

**Environment:**
- Node.js runtime for frontend development and build scripts via `package.json`
- Tauri v2 desktop runtime for the packaged application via `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`
- Rust native runtime for backend commands compiled from `src-tauri/src/*.rs`

**Package Manager:**
- npm - Script and dependency management defined in `package.json`
- Lockfile: present in `package-lock.json`
- Cargo - Rust dependency management defined in `src-tauri/Cargo.toml`
- Lockfile: present in `src-tauri/Cargo.lock`

## Frameworks

**Core:**
- React 19 - UI rendering for the desktop shell in `src/main.tsx` and `src/App.tsx`
- Tauri 2 - Desktop app host, command bridge, and bundling in `src-tauri/src/lib.rs` and `src-tauri/tauri.conf.json`
- Zustand 5 - Client-side application state store in `src/app/state/appShellStore.ts`

**Testing:**
- Not detected - No Jest, Vitest, Playwright, or other test framework config was found in the project root

**Build/Dev:**
- Vite 6 - Frontend dev server and production bundler in `vite.config.ts`
- TypeScript 5 - Static typing and compile-time checks in `tsconfig.json`
- `@vitejs/plugin-react` - React integration for Vite in `vite.config.ts`
- `@tauri-apps/cli` - Desktop development workflow exposed by `package.json` script `tauri:dev`

## Key Dependencies

**Critical:**
- `react` - Core UI library declared in `package.json` and used by `src/main.tsx` and `src/App.tsx`
- `react-dom` - Browser renderer declared in `package.json` and used by `src/main.tsx`
- `zustand` - App state container declared in `package.json` and used by `src/app/state/appShellStore.ts`
- `@tauri-apps/api` - Frontend-to-native bridge declared in `package.json` and used across `src/app/services/assistantService.ts`, `src/app/services/credentialService.ts`, `src/app/services/sessionService.ts`, and `src/app/services/projectService.ts`
- `tauri` - Native desktop framework declared in `src-tauri/Cargo.toml` and wired in `src-tauri/src/lib.rs`

**Infrastructure:**
- `@tauri-apps/plugin-dialog` / `tauri-plugin-dialog` - Native file and directory selection used in `src/app/services/projectService.ts`, `src/app/services/attachmentService.ts`, and enabled in `src-tauri/src/lib.rs`
- `reqwest` - Blocking HTTP client used for assistant API calls in `src-tauri/src/assistant_service.rs`
- `keyring` with `windows-native` feature - Secure local credential storage used in `src-tauri/src/credential_service.rs`
- `dirs` - OS-specific app data path resolution used in `src-tauri/src/session_service.rs`, `src-tauri/src/project_service.rs`, and `src-tauri/src/credential_service.rs`
- `serde` / `serde_json` - Serialization for Tauri command payloads and persisted JSON in `src-tauri/src/*.rs`
- `lucide-react` - Icon set used in UI components such as `src/app/layout/TopToolbar.tsx` and `src/app/layout/RightPanel.tsx`

## Configuration

**Environment:**
- No required `.env` file was detected in `E:/work/ai/agent`; the current app stores runtime connection settings locally instead of relying on project env files
- Anthropic API credentials are stored through Windows-native keyring access in `src-tauri/src/credential_service.rs`
- Optional assistant endpoint override is stored in a local JSON settings file resolved by `assistant_settings_path()` in `src-tauri/src/credential_service.rs`
- Session history, recovery snapshots, and recent projects are stored under the local app data directory via `data_local_dir()` in `src-tauri/src/session_service.rs` and `src-tauri/src/project_service.rs`

**Build:**
- Frontend build and dev scripts are defined in `package.json`
- Vite config is in `vite.config.ts`
- TypeScript compiler config is in `tsconfig.json` and `tsconfig.node.json`
- Tauri app config is in `src-tauri/tauri.conf.json`
- Tauri capability permissions are in `src-tauri/capabilities/default.json`
- Desktop entrypoint is `src-tauri/src/main.rs`
- Frontend bundle output is `dist/`, referenced by `src-tauri/tauri.conf.json`

## Platform Requirements

**Development:**
- Node.js with npm to run `npm install`, `npm run dev`, and `npm run tauri:dev` from `package.json`
- Rust toolchain and Cargo to build `src-tauri/`
- Tauri desktop tooling through `@tauri-apps/cli` in `package.json`
- Windows is the intended development target according to `README.md` and the `keyring` `windows-native` feature in `src-tauri/Cargo.toml`

**Production:**
- Windows desktop target packaged as MSI, configured by `"targets": "msi"` in `src-tauri/tauri.conf.json`
- Local desktop deployment, not a hosted web application; the built frontend is embedded into the Tauri shell via `src-tauri/tauri.conf.json`

---

*Stack analysis: 2026-04-02*
