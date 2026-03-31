---
plan_id: "02"
phase: "03"
title: "Implement project-mode agent workflow conversation UI"
wave: 2
depends_on:
  - "01"
files_modified:
  - "src/app/layout/CenterWorkspace.tsx"
  - "src/app/layout/TopToolbar.tsx"
  - "src/app/layout/RightPanel.tsx"
  - "src/styles/app-shell.css"
requirements_addressed:
  - "CHAT-01"
  - "CHAT-02"
  - "CHAT-03"
autonomous: true
---

## Objective
Turn project mode into a real conversational coding surface with a coding command bar, staged agent-style response flow, and compact task summary blocks that feel inspired by Claude Code CLI while remaining conversation-first.

## Must Haves
- Project mode uses a coding command bar rather than a standard chat textbox
- Project conversation timeline renders user messages, assistant body content, stage-status segments, and tool-summary blocks
- Streaming state is visible as staged workflow progress without becoming a raw execution-log viewer

<tasks>
  <task id="02.1">
    <objective>Replace the project session history center pane with a project-mode conversation timeline and coding command bar.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- src/styles/app-shell.css
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
- .planning/phases/02-session-persistence-recovery/02-UI-SPEC.md
    </read_first>
    <action>Update src/app/layout/CenterWorkspace.tsx so that when project mode has an active session, the center pane renders a project conversation timeline plus a bottom-aligned coding command bar instead of the Phase 2 history-management surface. Keep the session-history and project-filter management path available when the user is browsing project sessions without an active conversation, but once a session is active, the primary experience must shift to conversation. Render transcript events using the approved project-mode structure: user messages as task requests, assistant body messages as readable conversation output, stage-status events as staged workflow markers, and tool-summary events as compact supporting blocks. The coding command bar should visually emphasize project tasking rather than generic chat.</action>
    <acceptance_criteria>
- src/app/layout/CenterWorkspace.tsx renders a project conversation timeline when project mode has an active session
- project conversation view renders a coding command bar distinct from a standard chat textbox
- project conversation view renders user, assistant-body, stage-status, and tool-summary transcript entries distinctly
- session history/filter management remains accessible when there is no active project conversation open
- center workspace does not replace the five-region shell layout
    </acceptance_criteria>
  </task>

  <task id="02.2">
    <objective>Implement staged streaming presentation for project-mode assistant work.</objective>
    <read_first>
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/app/state/types.ts
- src/styles/app-shell.css
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
- .planning/phases/03-conversational-coding-workflow/03-RESEARCH.md
    </read_first>
    <action>Render project-mode assistant progress as a staged agent workflow rather than plain loading text. Use stage-status transcript events to show clear segments such as understanding request, analyzing project, acting/generating result, and done when those events exist. While assistant output is streaming, show an in-progress project task state that remains conversation-first: assistant body content should still be readable as it grows, and stage markers should support the reading flow instead of interrupting it. Tool-summary events should appear as lightweight task summary blocks embedded in the timeline rather than a separate execution log panel.</action>
    <acceptance_criteria>
- project-mode conversation UI shows visible in-progress state during assistant streaming
- stage-status transcript entries render as staged workflow markers, not generic spinners only
- assistant body content remains readable while the response is streaming
- tool-summary transcript entries render as compact embedded summary blocks in the conversation timeline
- project-mode UI does not render a raw terminal-log or full execution-output viewer in this phase
    </acceptance_criteria>
  </task>

  <task id="02.3">
    <objective>Align always-visible shell context with the project conversation workflow.</objective>
    <read_first>
- src/app/layout/TopToolbar.tsx
- src/app/layout/RightPanel.tsx
- src/app/layout/CenterWorkspace.tsx
- src/app/state/appShellStore.ts
- src/styles/app-shell.css
- .planning/phases/03-conversational-coding-workflow/03-CONTEXT.md
    </read_first>
    <action>Refine TopToolbar, RightPanel, and any necessary supporting styles so project-mode conversational work remains clearly tied to the active project, session, and effective model while the user is chatting. Add lightweight indicators for project-mode conversation activity such as active agent/task status or current stage summary when helpful, but keep these surfaces secondary to the center conversation flow. Preserve the existing project/model visibility and do not move core conversation content out of the center pane.</action>
    <acceptance_criteria>
- TopToolbar continues to show active project and effective model while project conversations run
- TopToolbar or RightPanel shows lightweight project conversation activity context such as current stage or active task summary
- RightPanel remains informational and does not become the primary conversation surface
- shell context updates stay synchronized with the active project session while prompts are submitted and responses stream
- no approval or diff-review controls are introduced into these surfaces
    </acceptance_criteria>
  </task>
</tasks>

## Verification
- Read CenterWorkspace.tsx and confirm active project sessions render a conversation timeline plus coding command bar
- Read styles and markup and confirm stage-status and tool-summary events are visually distinct without turning into a log viewer
- Read TopToolbar.tsx and RightPanel.tsx and confirm project/session/model context stays visible during project conversations
- Confirm project-mode UI matches the approved differentiated workflow direction rather than a generic chat-only surface
