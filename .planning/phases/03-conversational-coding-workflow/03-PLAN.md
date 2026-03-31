---
plan_id: "03"
phase: "03"
title: "Implement pure conversation mode chat workflow and shared transcript rendering"
wave: 3
depends_on:
  - "01"
  - "02"
files_modified:
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/app/state/appShellStore.ts"
  - "src/styles/app-shell.css"
requirements_addressed:
  - "CHAT-01"
  - "CHAT-02"
  - "CHAT-03"
autonomous: true
---

## Objective
Deliver the pure conversation mode experience as a standard streaming chat surface while reusing the shared conversation foundation built for project sessions and keeping the shell-level session/model context coherent.

## Must Haves
- Pure conversation mode uses a standard mainstream chat input and transcript layout
- Pure conversation mode streams assistant responses visibly into the current session
- Shared conversation infrastructure supports both modes without collapsing their UX distinction

<tasks>
  <task id="03.1">
    <objective>Implement a standard pure-conversation chat surface on top of the shared transcript model.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- src/styles/app-shell.css
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
- .planning/phases/03-conversational-coding-workflow/03-RESEARCH.md
    </read_first>
    <action>Update src/app/layout/CenterWorkspace.tsx so pure conversation mode renders a standard chat-style conversation surface when the app is in conversation mode. This surface must use the shared transcript/event infrastructure from plan 01, but render user and assistant body messages in a mainstream chat pattern rather than the staged agent-workflow presentation used in project mode. Use a standard chat composer for pure conversation mode and keep mode-specific visuals clearly distinct from the project-mode coding command bar.</action>
    <acceptance_criteria>
- src/app/layout/CenterWorkspace.tsx renders a distinct pure-conversation chat surface when mode is conversation
- pure-conversation surface uses a standard chat composer rather than the project coding command bar
- pure-conversation surface renders user and assistant body messages in a mainstream chat layout
- pure-conversation UI remains visibly distinct from project-mode conversation styling
- shared transcript/event model is reused instead of creating a second incompatible message structure
    </acceptance_criteria>
  </task>

  <task id="03.2">
    <objective>Support streaming and transcript persistence in pure conversation mode.</objective>
    <read_first>
- src/app/state/appShellStore.ts
- src/app/services/assistantService.ts
- src/app/services/sessionService.ts
- src/app/layout/CenterWorkspace.tsx
- .planning/phases/03-conversational-coding-workflow/03-VALIDATION.md
    </read_first>
    <action>Ensure pure conversation mode can submit prompts through the same assistant orchestration path and render streaming assistant output into the active session. Update any mode-aware store logic so transcript persistence, recent-activity updates, and in-progress state all work correctly in conversation mode without requiring a selected project path. Keep the shared conversation plumbing intact while allowing conversation mode to omit project-specific stage-summary emphasis where appropriate.</action>
    <acceptance_criteria>
- pure conversation mode can submit a prompt without requiring an active project path
- assistant streaming path updates the active session transcript in conversation mode
- session recent activity updates after pure-conversation prompt/response flow
- conversation-mode in-progress state is visible while the assistant response streams
- shared assistant orchestration path is reused rather than duplicated separately for conversation mode
    </acceptance_criteria>
  </task>

  <task id="03.3">
    <objective>Finalize mode-specific rendering boundaries and conversation-state fallbacks.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/styles/app-shell.css
- src/app/layout/TopToolbar.tsx
- .planning/phases/01-desktop-shell-project-foundation/01-CONTEXT.md
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
    </read_first>
    <action>Refine mode routing, empty states, and fallback states so the app clearly communicates whether the user is in project-mode coding workflow or pure conversation mode. Preserve the top-level mode distinction from Phase 1, ensure each mode lands on its natural conversation surface when appropriate, and provide clear empty/instructional states when a mode has no active conversation yet. Keep the differences user-visible and intentional, not just cosmetic class changes.</action>
    <acceptance_criteria>
- mode routing clearly differentiates project-mode conversation surfaces from pure conversation surfaces
- pure conversation mode has a sensible empty or pre-conversation state when no transcript exists yet
- switching between project and conversation modes preserves the intended mode-specific interaction model
- styling and layout differences between the two modes are visible in CenterWorkspace and supporting CSS
- no mode fallback forces project-mode task workflow visuals into pure conversation mode
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read CenterWorkspace.tsx and confirm conversation mode renders a standard chat composer and transcript layout distinct from project mode
- Read appShellStore.ts and assistant/session services and confirm prompt submission plus streaming work in conversation mode without requiring project context
- Confirm empty/fallback states keep mode boundaries explicit and preserve the Phase 1 mode structure
- Confirm both modes reuse the same conversation foundation while preserving the UX differences approved in CONTEXT.md
