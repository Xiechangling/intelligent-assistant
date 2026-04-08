# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**LLM API:**
- Anthropic Messages API - Assistant turn generation for project and conversation mode
  - SDK/Client: Rust `reqwest` client in `src-tauri/src/assistant_service.rs`
  - Auth: API key stored through `keyring` in `src-tauri/src/credential_service.rs`
  - Endpoint: Default URL constant `https://api.anthropic.com/v1/messages` in `src-tauri/src/assistant_service.rs`
  - Override path: User-configurable `apiBaseUrl` saved by `save_assistant_connection_settings` in `src-tauri/src/credential_service.rs` and edited from `src/app/layout/RightPanel.tsx`

**Native Desktop APIs:**
- Tauri command bridge - Frontend invokes Rust backend commands for assistant, session, project, credential, and execution operations
  - SDK/Client: `@tauri-apps/api/core` in `src/app/services/assistantService.ts`, `src/app/services/credentialService.ts`, `src/app/services/sessionService.ts`, and `src/app/services/projectService.ts`
  - Auth: Not applicable
- Native file dialog - Project folder and attachment selection
  - SDK/Client: `@tauri-apps/plugin-dialog` in `src/app/services/projectService.ts` and `src/app/services/attachmentService.ts`
  - Auth: Not applicable

**Local Tooling Integration:**
- Git CLI - Change review after approved command execution via `git status --short` and `git diff HEAD -- <path>` in `src-tauri/src/execution_service.rs`
  - SDK/Client: Rust `std::process::Command`
  - Auth: Uses the local machine's Git environment; no in-app credential flow detected
- System shell - Approved command execution via `cmd /C` on Windows or `sh -lc` on non-Windows in `src-tauri/src/execution_service.rs`
  - SDK/Client: Rust `std::process::Command`
  - Auth: Not applicable

## Data Storage

**Databases:**
- Not detected - No SQL or NoSQL database client, ORM, or connection string usage was found in `package.json`, `src/`, or `src-tauri/`

**File Storage:**
- Local filesystem only
  - Session metadata JSON is written under the app data directory in `src-tauri/src/session_service.rs`
  - Session transcripts JSON are written under the app data directory in `src-tauri/src/session_service.rs`
  - Recovery snapshot JSON is written under the app data directory in `src-tauri/src/session_service.rs`
  - Recent project history JSON is written under the app data directory in `src-tauri/src/project_service.rs`
  - Assistant connection settings JSON are written under the app data directory in `src-tauri/src/credential_service.rs`

**Caching:**
- None detected - No Redis, Memcached, in-memory cache service, or browser storage cache layer was found

## Authentication & Identity

**Auth Provider:**
- Custom API key flow for Anthropic
  - Implementation: The frontend collects the key in `src/app/layout/RightPanel.tsx`, sends it through `src/app/services/credentialService.ts`, and the backend stores it in the OS credential manager through `keyring::Entry` in `src-tauri/src/credential_service.rs`
  - Session identity: Single-user local application; no user accounts, OAuth flow, or multi-user identity provider detected

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Bugsnag, Rollbar, Datadog, or equivalent dependency/config was found

**Logs:**
- Command execution output is captured and returned to the UI as structured stdout/stderr/system entries in `src-tauri/src/execution_service.rs`
- Assistant request failures are surfaced as Tauri command errors from `src-tauri/src/assistant_service.rs`
- No centralized log shipping or external observability backend was detected

## CI/CD & Deployment

**Hosting:**
- Local desktop installation through Tauri MSI bundles configured in `src-tauri/tauri.conf.json`

**CI Pipeline:**
- None detected - No `.github/workflows/*` files were found under `E:/work/ai/agent/.github/workflows`

## Environment Configuration

**Required env vars:**
- Not required by the current checked-in application code for normal operation
- The active credential path is local secure storage in `src-tauri/src/credential_service.rs`, not repo env files
- The only runtime endpoint setting observed is `apiBaseUrl`, stored in local app data by `src-tauri/src/credential_service.rs`

**Secrets location:**
- Anthropic API key: Windows-native keyring entry created by `credential_entry()` in `src-tauri/src/credential_service.rs`
- Assistant endpoint override: Local JSON file created by `assistant_settings_path()` in `src-tauri/src/credential_service.rs`
- No project `.env` files were detected in `E:/work/ai/agent`

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoint handlers, HTTP server routes, or callback listeners were found in `src/` or `src-tauri/src/`

**Outgoing:**
- Anthropic Messages API POST requests from `start_assistant_turn` in `src-tauri/src/assistant_service.rs`
- No other outbound third-party API integrations were detected

---

*Integration audit: 2026-04-02*
