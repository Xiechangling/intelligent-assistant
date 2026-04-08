---
phase: 03-conversational-coding-workflow
plan: 03
subsystem: conversation-mode-transcript-ui
status: completed
completed: 2026-03-30
files_modified:
  - E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx
  - E:/work/ai/agent/src/app/state/appShellStore.ts
  - E:/work/ai/agent/src/app/services/assistantService.ts
  - E:/work/ai/agent/src/styles/app-shell.css
verification:
  - Read E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx to confirm conversation mode renders a standard composer and chat transcript layout distinct from project mode.
  - Read E:/work/ai/agent/src/app/state/appShellStore.ts to confirm conversation-mode prompt submission reuses the shared transcript/session pipeline and can create or continue a conversation session.
  - Read E:/work/ai/agent/src/app/services/assistantService.ts to confirm the assistant streaming path is shared and accepts optional project context for conversation mode.
  - Read E:/work/ai/agent/src/styles/app-shell.css to confirm conversation transcript, composer, and mode-specific presentation styles are present.
---

# Phase 3 Plan 03: Implement pure conversation mode chat workflow and shared transcript rendering Summary

Completed the pure conversation mode surface on top of the shared Phase 3 transcript pipeline, keeping conversation mode as a mainstream chat experience while preserving the separate project-mode coding workflow.

## What Changed

### 1. Conversation mode now has a standard chat composer and transcript layout
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` renders conversation sessions through the same `SessionSurface` shell but passes `mode="conversation"` so the center workspace uses mainstream chat copy, transcript empty states, and send affordances.
- `Transcript` shows conversation-mode empty-state copy as “Start a conversation” and “Send a message without opening a workspace.”
- `Composer` switches labels, placeholder text, and rows for conversation mode so it behaves like a normal chat composer instead of the project-mode coding command bar.

### 2. Shared transcript infrastructure is reused instead of split
- `E:/work/ai/agent/src/app/state/appShellStore.ts` keeps one `submitPrompt` flow for both modes.
- The store appends the same transcript event model for user messages, assistant messages, stage updates, and tool summaries, then persists the updated transcript through the existing session persistence path.
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx` reuses the same event rendering infrastructure, with mode-aware presentation rather than a second incompatible conversation model.

### 3. Conversation mode can submit prompts without an active project path
- `createConversationSession()` creates sessions with `projectPath: '__conversation__'` and `projectName: 'Pure Conversation'`.
- In `submitPrompt()`, if no active session exists and the app is in conversation mode, the store creates a conversation session instead of requiring a selected workspace.
- The assistant request still goes through `streamAssistantResponse(...)`, and `E:/work/ai/agent/src/app/services/assistantService.ts` accepts `projectPath` as optional input, which keeps conversation-mode submission valid without project context.

### 4. Mode boundaries remain explicit
- `CenterWorkspace.tsx` keeps separate project and conversation session routing: project mode continues to surface approval, workflow-status, and review summaries inline, while conversation mode does not render those project workflow surfaces.
- Conversation sessions still show the shared session header and transcript stream, but the user-visible copy and interaction model stay chat-oriented.
- CSS in `E:/work/ai/agent/src/styles/app-shell.css` includes the shared transcript/composer system plus mode-aware message classes, preserving one infrastructure layer without collapsing the UX distinction.

## Delivered Scope
- Standard pure-conversation chat composer
- Standard chat-style transcript presentation for conversation mode
- Shared transcript/event infrastructure across project and conversation sessions
- Prompt submission and streaming in conversation mode without requiring a project path
- Conversation-mode empty state and session creation path

## Explicit Non-Goals Preserved
- This plan did not merge project mode into a generic chat flow.
- Project mode still carries the coding-session workflow surface, including approval/review-oriented inline summaries and project-attached session behavior.
- Full approval gating, execution-log review, and diff-review workflows remain outside this plan’s conversation-mode scope.

## Verification Notes
- `CenterWorkspace.tsx` confirms conversation mode uses a standard chat composer and chat transcript layout.
- `appShellStore.ts` confirms conversation-mode sessions can be created and used without an active project path, while still reusing transcript persistence and streaming state.
- `assistantService.ts` confirms the shared assistant orchestration accepts optional project context and streams assistant chunks through the same path.
- `app-shell.css` confirms the transcript/composer styling exists for the shared surface and preserves visible mode differences.

## Files
- `E:/work/ai/agent/src/app/layout/CenterWorkspace.tsx`
- `E:/work/ai/agent/src/app/state/appShellStore.ts`
- `E:/work/ai/agent/src/app/services/assistantService.ts`
- `E:/work/ai/agent/src/styles/app-shell.css`
