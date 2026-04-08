# Claude Code v2.1.88 Minimal CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `src-claude-code-v2.1.88` boot as a minimal CLI that can answer basic code questions against the current working directory while preserving the vendored source structure as much as possible.

**Architecture:** Keep the vendored `src/` tree intact, add only the missing project bootstrap files around it, then recover the real startup path from `src/main.tsx` and gate unsupported capabilities until the smallest useful interactive flow works. Prefer explicit runtime disablement over broad rewrites so later work can continue toward fuller v2.1.88 restoration.

**Tech Stack:** TypeScript, Bun-first runtime assumptions in vendored code, Node-compatible package metadata, Anthropic SDK/auth flow already embedded in vendored source, terminal CLI entry through `src/main.tsx`

---

## File Structure

### Existing files to inspect or modify
- Modify: `src-claude-code-v2.1.88/src/main.tsx` — primary CLI startup path and the place where bring-up blockers will first surface
- Modify: `src-claude-code-v2.1.88/src/commands.ts` — command registry; likely place to disable or gate commands that break minimal startup
- Modify: `src-claude-code-v2.1.88/src/query.ts` — core model query loop; validate that the minimal question path can use current-directory context
- Modify: `src-claude-code-v2.1.88/src/context.ts` — current-directory and git/user context gathering for code Q&A
- Modify as needed: files under `src-claude-code-v2.1.88/src/utils/`, `src-claude-code-v2.1.88/src/services/`, or `src-claude-code-v2.1.88/src/entrypoints/` that are direct startup blockers

### New files likely required
- Create: `src-claude-code-v2.1.88/package.json` — declare scripts, module type, runtime entry, and minimum dependencies
- Create: `src-claude-code-v2.1.88/tsconfig.json` — define TypeScript configuration for the vendored subproject
- Create: `src-claude-code-v2.1.88/.gitignore` — exclude generated runtime artifacts for the subproject if needed
- Create if needed: `src-claude-code-v2.1.88/src/minimalRuntimeFlags.ts` or similar focused file — centralize minimal-runtime feature gating rather than scattering ad hoc checks
- Create if needed: `src-claude-code-v2.1.88/README.md` — only if a short runbook becomes necessary for bring-up and manual verification

### Verification targets
- Run from: `src-claude-code-v2.1.88/`
- Verify startup command works from terminal
- Verify one interactive prompt round-trip works against a real working directory
- Verify unsupported features fail with explicit messages instead of immediate startup crashes

---

### Task 1: Create the minimal project bootstrap

**Files:**
- Create: `src-claude-code-v2.1.88/package.json`
- Create: `src-claude-code-v2.1.88/tsconfig.json`
- Create: `src-claude-code-v2.1.88/.gitignore`
- Inspect: `src-claude-code-v2.1.88/src/main.tsx:1-260`
- Inspect: `src-claude-code-v2.1.88/src/commands.ts:1-260`

- [ ] **Step 1: Write a failing bootstrap expectation checklist in the plan notes**

```txt
Expected initial bring-up behavior:
1. `bun run src/main.tsx --help` should execute project startup code.
2. Failure mode should be a missing dependency/module/runtime requirement, not "no package.json".
3. The vendored project should be runnable as its own subproject without depending on the Tauri app package.json.
```

- [ ] **Step 2: Verify the bootstrap currently fails for structural reasons**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
FAIL because package metadata, dependency resolution, or runtime config is missing.
```

- [ ] **Step 3: Create the minimal package manifest**

Create `src-claude-code-v2.1.88/package.json` with a minimal, Bun-oriented manifest that does not invent extra build layers:

```json
{
  "name": "claude-code-v2-1-88-minimal",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "bun run src/main.tsx",
    "help": "bun run src/main.tsx --help",
    "doctor:min": "bun run src/main.tsx doctor",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@commander-js/extra-typings": "latest",
    "chalk": "latest",
    "lodash-es": "latest",
    "react": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

Note: adjust versions only if the vendored code proves incompatible with `latest`; prefer explicit versions discovered from runtime errors rather than guessing upfront.

- [ ] **Step 4: Create a focused TypeScript config**

Create `src-claude-code-v2.1.88/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": false,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vendor/**/*.ts"]
}
```

- [ ] **Step 5: Create a minimal gitignore for local bring-up artifacts**

Create `src-claude-code-v2.1.88/.gitignore`:

```gitignore
node_modules/
bun.lockb
bun.lock
*.log
.tmp/
dist/
```

- [ ] **Step 6: Install dependencies and capture the next real blocker**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun install
```

Expected:
```txt
Install succeeds or reports the first concrete missing dependency set.
```

- [ ] **Step 7: Re-run startup to move from structural failure to code-level failure**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
Either help renders, or startup now fails inside vendored code with a concrete module/runtime error.
```

- [ ] **Step 8: Commit bootstrap files**

```bash
git add src-claude-code-v2.1.88/package.json src-claude-code-v2.1.88/tsconfig.json src-claude-code-v2.1.88/.gitignore
git commit -m "chore: bootstrap vendored claude code snapshot"
```

---

### Task 2: Recover the actual startup chain and first hard blockers

**Files:**
- Modify: `src-claude-code-v2.1.88/src/main.tsx:1-260`
- Modify: `src-claude-code-v2.1.88/src/commands.ts:1-260`
- Inspect: `src-claude-code-v2.1.88/src/entrypoints/**/*`
- Inspect: `src-claude-code-v2.1.88/src/utils/**/*`

- [ ] **Step 1: Document the first failing imports or runtime assumptions**

Write a short scratch checklist from the actual startup failure, for example:

```txt
Startup blockers checklist:
- bun-only import resolution issue?
- missing `src/...` alias support?
- unsupported top-level feature flag imports?
- missing generated config/auth/bootstrap files?
```

- [ ] **Step 2: Run startup again and capture the first code-level failure**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
FAIL with a specific file/module/runtime assumption inside src/main.tsx or one of its imports.
```

- [ ] **Step 3: Fix only path-resolution or startup-critical issues needed to continue**

If the failure is an unresolved `src/...` import from files like `src/main.tsx`, update `tsconfig.json` and `package.json` support rather than rewriting dozens of imports. If Bun still cannot resolve the alias, create the smallest viable alias-compatible change, such as replacing only startup-critical `src/...` imports with relative imports.

Example targeted edit pattern in `src/main.tsx` if alias resolution is the blocker:

```ts
import { isAnalyticsDisabled } from './services/analytics/config.js'
import { getFeatureValue_CACHED_MAY_BE_STALE } from './services/analytics/growthbook.js'
import { logEvent } from './services/analytics/index.js'
```

Do **not** mass-edit the whole tree unless startup proves that it is required.

- [ ] **Step 4: Gate feature-flagged modules that block minimal boot**

If startup fails on optional capabilities, centralize the first gating pass rather than patching random call sites. A focused pattern is:

```ts
export const MINIMAL_RUNTIME = true

export function isFeatureEnabledForMinimalRuntime(name: string): boolean {
  return ![
    'VOICE_MODE',
    'BRIDGE_MODE',
    'BUDDY',
    'DAEMON',
    'COORDINATOR_MODE'
  ].includes(name)
}
```

Then use that helper only where startup is blocked.

- [ ] **Step 5: Re-run startup after each focused fix**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
Progresses further through startup; new failures should move deeper into the minimal execution path.
```

- [ ] **Step 6: Stop once help or non-interactive startup reaches the CLI parser**

Success condition for this task:
```txt
The process reaches command parsing / CLI setup instead of dying during import evaluation.
```

- [ ] **Step 7: Commit startup recovery changes**

```bash
git add src-claude-code-v2.1.88/src/main.tsx src-claude-code-v2.1.88/src/commands.ts src-claude-code-v2.1.88/tsconfig.json
git commit -m "fix: recover minimal claude code startup path"
```

---

### Task 3: Trim command availability to a minimal-safe surface

**Files:**
- Modify: `src-claude-code-v2.1.88/src/commands.ts:1-260`
- Modify if needed: `src-claude-code-v2.1.88/src/cli/**/*`
- Create if needed: `src-claude-code-v2.1.88/src/minimalRuntimeFlags.ts`

- [ ] **Step 1: Identify which commands are safe for the first minimal runtime**

Minimum recommended safe set:

```txt
Keep first:
- help
- doctor
- login / auth-related command only if required for real model access
- clear / status only if they do not pull in heavy optional systems
- the default interactive prompt path

Gate initially:
- bridge
- mobile
- desktop
- voice
- buddy
- teleport
- remote-control or daemon paths
- workflow-heavy or plugin-heavy commands if they block boot
```

- [ ] **Step 2: Implement explicit minimal-runtime command filtering**

Prefer a small wrapper around the existing command list rather than deleting entries. Example shape:

```ts
const MINIMAL_DISABLED_COMMANDS = new Set([
  'bridge',
  'desktop',
  'mobile',
  'voice',
  'buddy',
  'teleport'
])

function filterCommandsForMinimalRuntime(commands: Command[]): Command[] {
  return commands.filter(command => !MINIMAL_DISABLED_COMMANDS.has(command.name))
}
```

Then apply it where `getCommands()` returns the list for startup.

- [ ] **Step 3: Add a clear message for intentionally disabled commands**

If command dispatch can still reference disabled entries, use an explicit message instead of a stack trace:

```ts
throw new Error('This command is not enabled in the minimal Claude Code runtime yet.')
```

- [ ] **Step 4: Verify the trimmed command surface still boots**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
Help output lists a reduced but coherent command surface, or the interactive app starts without loading disabled command paths.
```

- [ ] **Step 5: Verify one gated command fails clearly**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx /bridge
```

Expected:
```txt
FAIL with a clear "not enabled in the minimal runtime" message, not a stack trace from deep imports.
```

- [ ] **Step 6: Commit command gating changes**

```bash
git add src-claude-code-v2.1.88/src/commands.ts src-claude-code-v2.1.88/src/minimalRuntimeFlags.ts
git commit -m "feat: gate unsupported commands in minimal runtime"
```

---

### Task 4: Verify current-directory context and question path are usable

**Files:**
- Modify: `src-claude-code-v2.1.88/src/context.ts:1-190`
- Modify: `src-claude-code-v2.1.88/src/query.ts:1-260`
- Inspect: `src-claude-code-v2.1.88/src/utils/messages.js`
- Inspect: `src-claude-code-v2.1.88/src/entrypoints/init.js`

- [ ] **Step 1: Validate the minimal context contract from existing code**

Current expected context sources already visible:

```txt
- system context: git branch, git status, recent commits, git user
- user context: CLAUDE.md / memory-derived prompt files and current date
```

Confirm the minimal runtime still includes current working directory context without requiring advanced features.

- [ ] **Step 2: Run a startup path that reaches interactive mode or the default command loop**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx
```

Expected:
```txt
Interactive CLI starts, or a concrete auth/config blocker is shown after startup completes.
```

- [ ] **Step 3: If context gathering crashes on nonessential features, narrow it to the minimal set**

Use the existing `getSystemContext()` / `getUserContext()` shape and only remove blockers that are not required for code Q&A. Example of acceptable simplification if needed:

```ts
return {
  ...(gitStatus && { gitStatus }),
}
```

and

```ts
return {
  currentDate: `Today's date is ${getLocalISODate()}.`,
  ...(claudeMd && { claudeMd })
}
```

Do not remove git or CLAUDE.md context unless they are the direct blocker.

- [ ] **Step 4: Ensure the query path still prepends/appends context into the API request**

Verify that the minimal execution path still uses:

```ts
prependUserContext(...)
appendSystemContext(...)
```

inside `src/query.ts` and that changes did not bypass them.

- [ ] **Step 5: Test a real code-oriented question against the current directory**

Run from a code-bearing directory, for example the repository root or the vendored project:

```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx
```

Then ask:

```txt
What files are responsible for command registration in this project?
```

Expected:
```txt
A real answer that mentions command-registration files such as `src/commands.ts` and related startup files, proving that the runtime can read project context and answer a code question.
```

- [ ] **Step 6: Commit context/query stabilization changes**

```bash
git add src-claude-code-v2.1.88/src/context.ts src-claude-code-v2.1.88/src/query.ts
git commit -m "fix: enable minimal code q-and-a context flow"
```

---

### Task 5: Make auth/config failures actionable instead of opaque

**Files:**
- Modify: `src-claude-code-v2.1.88/src/main.tsx:1-260`
- Inspect/modify as needed: `src-claude-code-v2.1.88/src/utils/auth.js`
- Inspect/modify as needed: `src-claude-code-v2.1.88/src/utils/config.js`
- Inspect/modify as needed: `src-claude-code-v2.1.88/src/commands/login/**/*`

- [ ] **Step 1: Trigger the real auth/config requirement on the minimal path**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx
```

Expected:
```txt
Either the user reaches the prompt, or the CLI reports missing login/token/config requirements.
```

- [ ] **Step 2: Replace opaque bring-up errors with actionable startup guidance**

If the minimal path currently throws unclear auth/config errors, wrap only the startup edge with a targeted message such as:

```ts
exitWithError(
  'Minimal Claude Code runtime requires valid Claude authentication before code Q&A can run. Configure auth, then restart the CLI.'
)
```

Use the project's existing exit helpers rather than `console.log` + `process.exit` when available.

- [ ] **Step 3: Verify login/help path is discoverable**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx login --help
```

Expected:
```txt
Displays login guidance or command help instead of failing during unrelated startup work.
```

- [ ] **Step 4: Verify unauthenticated startup now explains what to do next**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx
```

Expected:
```txt
If auth is missing, the output tells the user how to authenticate rather than exposing an internal stack trace.
```

- [ ] **Step 5: Commit auth/config startup messaging changes**

```bash
git add src-claude-code-v2.1.88/src/main.tsx
git commit -m "fix: clarify minimal runtime auth requirements"
```

---

### Task 6: Perform end-to-end minimal runtime verification

**Files:**
- Verify: `src-claude-code-v2.1.88/package.json`
- Verify: `src-claude-code-v2.1.88/src/main.tsx`
- Verify: `src-claude-code-v2.1.88/src/commands.ts`
- Verify: `src-claude-code-v2.1.88/src/context.ts`
- Verify: `src-claude-code-v2.1.88/src/query.ts`
- Create if needed: `src-claude-code-v2.1.88/README.md`

- [ ] **Step 1: Verify help/startup path fresh**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx --help
```

Expected:
```txt
CLI startup succeeds without structural/import-time crashes.
```

- [ ] **Step 2: Verify interactive startup fresh**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx
```

Expected:
```txt
Interactive prompt appears, or an actionable auth/config requirement is shown.
```

- [ ] **Step 3: Verify one real code Q&A round-trip**

Run the CLI in a code directory and ask:

```txt
What files are responsible for command registration in this project?
```

Expected:
```txt
The response references the current project, especially `src/commands.ts`, proving basic code-aware Q&A works.
```

- [ ] **Step 4: Verify one intentionally unsupported feature stays nonfatal**

Run:
```bash
cd "E:/work/ai/agent/src-claude-code-v2.1.88" && bun run src/main.tsx /voice
```

Expected:
```txt
The CLI responds with a clear minimal-runtime disablement message instead of an unhandled exception.
```

- [ ] **Step 5: Write a short runbook only if manual startup steps are non-obvious**

If needed, create `src-claude-code-v2.1.88/README.md` with exactly this level of detail:

```md
# Minimal Claude Code v2.1.88 Runtime

## Run

```bash
bun install
bun run src/main.tsx
```

## Current scope
- Minimal CLI startup
- Basic code Q&A in the current directory
- Unsupported advanced commands are gated
```
```

Skip this file entirely if the commands are already obvious from `package.json` and terminal output.

- [ ] **Step 6: Commit final minimal-runtime bring-up work**

```bash
git add src-claude-code-v2.1.88
git commit -m "feat: enable minimal claude code v2.1.88 runtime"
```

---

## Self-Review

### Spec coverage check
- Minimal runnable CLI bootstrap: covered by Tasks 1-2
- Preserve vendored structure: enforced throughout file structure and task boundaries
- Basic code Q&A against current directory: covered by Tasks 4 and 6
- Unsupported advanced features degrade clearly: covered by Tasks 3, 5, and 6
- No Tauri entanglement: no task touches `src/` or `src-tauri/`

### Placeholder scan
- No `TODO`/`TBD` placeholders left in task steps
- Each verification step includes a concrete command and expected outcome
- Code-change tasks include concrete configuration or code patterns to apply

### Type / naming consistency check
- Uses one consistent concept name: **minimal runtime**
- Uses the same target root throughout: `src-claude-code-v2.1.88`
- Uses the same key startup files throughout: `src/main.tsx`, `src/commands.ts`, `src/context.ts`, `src/query.ts`
