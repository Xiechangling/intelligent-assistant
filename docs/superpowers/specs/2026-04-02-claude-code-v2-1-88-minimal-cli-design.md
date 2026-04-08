# Claude Code v2.1.88 Minimal CLI Design

**Date:** 2026-04-02  
**Status:** Approved for planning  
**Target:** `E:/work/ai/agent/src-claude-code-v2.1.88`

## Goal

Turn the vendored `src-claude-code-v2.1.88` source snapshot into a minimally runnable CLI-first project that can:

1. start from the terminal,
2. accept interactive input,
3. use the current working directory as project context,
4. send a basic coding question to Claude,
5. return a usable response without crashing on unimplemented advanced features.

This is explicitly **not** a full fidelity restoration of official Claude Code v2.1.88. The first milestone is a usable minimal runtime that preserves as much of the existing structure as possible.

## User-Confirmed Constraints

- **Entry point:** CLI first
- **Success bar:** Must support basic code Q&A against the current directory
- **Preservation preference:** Keep as much of the existing source structure as possible
- **Allowed changes:** Missing project/build files may be added when necessary
- **Deferred goal:** Official parity can be pursued later after the minimal runtime works

## Scope

### In scope
- Identify the real startup path inside the vendored source tree
- Add missing project metadata and build/runtime configuration
- Install or declare the minimum dependencies needed for startup
- Make the CLI boot successfully
- Make one interactive code-question flow work against the current directory
- Add explicit feature gating or fallbacks for advanced, incomplete, or environment-specific features
- Keep unsupported commands from crashing the process where practical

### Out of scope
- Full command coverage
- Full agent/workflow/bridge/voice/remote feature parity
- Tauri integration for this phase
- Recreating the full official packaging or release pipeline
- Refactoring the source tree for cleanliness beyond what is needed to run

## Recommended Approach

### Option A — Patch the snapshot into a runnable minimal project (**recommended**)
Treat `src-claude-code-v2.1.88` as a partial but structurally meaningful source snapshot. Preserve its existing layout, add the missing project scaffolding, then selectively disable or stub non-essential features until the minimal CLI flow works.

**Why this is recommended:**
- aligns with the user preference to preserve the original structure,
- gives the clearest path toward later official restoration,
- reveals which missing pieces are environmental versus architectural.

### Option B — Build a thin compatibility shell around selected modules
Create a new tiny CLI runner and import only a subset of the vendored modules.

**Why not recommended first:**
- faster to bootstrap, but drifts away from the real structure,
- creates likely rework later when reconnecting to the original startup chain.

### Option C — Reimplement behavior using the current desktop project
Use the vendored source as reference only and build a new CLI elsewhere.

**Why not recommended:**
- does not actually achieve the stated goal of making this source project runnable.

## Architecture Strategy

The implementation should preserve the existing layered structure and focus only on making the smallest viable path executable.

### 1. Project bootstrap layer
Add the missing engineering scaffolding required to treat the snapshot as a real Node/Bun CLI project.

Expected responsibilities:
- define package metadata,
- define runtime/build scripts,
- define TypeScript or Bun compilation settings,
- define dependency boundaries.

This layer exists only to make the snapshot operable; it should not redesign the app.

### 2. Startup path recovery layer
Determine the actual minimal boot chain from the vendored source.

Primary likely entrypoints and hubs already observed:
- `src-claude-code-v2.1.88/src/main.tsx`
- `src-claude-code-v2.1.88/src/commands.ts`
- `src-claude-code-v2.1.88/src/query.ts`
- `src-claude-code-v2.1.88/src/Tool.ts`
- `src-claude-code-v2.1.88/src/context.ts`

This layer should identify:
- what must load for the app to start,
- which features are hard requirements,
- which features can be gated or disabled.

### 3. Minimal interactive Q&A layer
Preserve the main interaction model but only require the shortest useful path:
- launch CLI,
- accept user prompt,
- collect current-directory context,
- send one model request,
- render response.

The Q&A path must be real, not simulated. If authentication or runtime configuration is required, that requirement should be surfaced explicitly.

### 4. Feature gating / compatibility layer
Advanced or missing capabilities should fail gracefully instead of blocking startup.

Likely categories for initial gating:
- bridge features,
- remote features,
- voice features,
- buddy/companion features,
- internal-only commands,
- platform-specific or build-time feature flags,
- modules that require files not present in the snapshot.

The first version should prefer:
- explicit disablement,
- safe no-op behavior where appropriate,
- user-visible "not enabled in minimal runtime" messaging.

## Runtime Behavior

### Startup
The CLI should boot from the terminal inside or against `src-claude-code-v2.1.88` and either:
- start an interactive session, or
- fail with an actionable environment/configuration error.

### Context handling
The minimal runtime should treat the current working directory as the active project context for code Q&A.

### Command surface
The first runnable version does not need all commands. The command registry may remain structurally intact, but unsupported commands should be disabled or clearly marked when selected.

### Model access
The minimal runtime must use a real Claude-backed request path if possible. If the original code expects official auth/config state, the implementation should preserve that expectation where practical and only add compatibility shims where necessary to get the minimal Q&A flow working.

## Error Handling

Error handling should optimize for debuggability over polish.

Required behavior:
- missing dependency → report exactly what package or module is missing,
- unsupported feature → report that it is not enabled in the minimal runtime,
- missing auth/config → report what the user must configure,
- snapshot incompleteness → fail explicitly rather than invent behavior,
- startup failure → preserve stack or structured diagnostics during bring-up.

No fake-success behavior should be introduced.

## Testing / Verification Strategy

Before claiming success, verify all of the following:

1. the CLI process starts,
2. the main interactive path is reachable,
3. a prompt can be submitted from the terminal,
4. current-directory context is available to the question path,
5. at least one real code-oriented response is returned,
6. unsupported commands/features do not cause immediate fatal crashes in the normal startup path.

Verification can initially be manual/runtime-based because the immediate goal is bring-up, but the plan should leave room for later automated coverage.

## Implementation Boundaries

To keep this effort focused, implementation should follow these rules:
- preserve existing source layout unless startup requires a targeted change,
- prefer patching and gating over broad rewrites,
- do not chase full parity during minimal-runtime bring-up,
- only add files that are necessary to make the project runnable,
- do not entangle this effort with the Tauri desktop shell yet.

## Expected Deliverable

After implementation, the repository should contain a minimally runnable CLI-oriented subproject rooted at `src-claude-code-v2.1.88` that is suitable for first-hand experimentation and later incremental restoration toward fuller Claude Code behavior.
