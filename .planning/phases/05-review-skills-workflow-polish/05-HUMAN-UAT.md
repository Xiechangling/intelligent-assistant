---
status: ready-for-human-check
phase: 05-review-skills-workflow-polish
source: [05-03-PLAN.md, current implementation, Playwright specs]
started: 2026-04-06T00:00:00Z
updated: 2026-04-06T00:00:00Z
---

# Phase 5 Human UAT

Use this checklist after running the Phase 5 automated checks. Keep the review in one session so the center workspace, bottom panel, and right panel can be judged as one workflow.

## Setup

1. Run `npm run build`.
2. Run `npm run verify:phase5`.
3. Launch the local app with the same dev workflow used by Playwright.
4. Open a workspace and attach or start a project session.

## Checklist

### 1. Review ready stays tied to the active session
- Decisions: D-01, D-02, D-03, D-11, D-12, D-13
- Steps:
  1. In a project session, send a prompt that produces an approval flow and changed files.
  2. Approve the command.
  3. Wait for execution to complete.
- Expect:
  - The center workspace shows `Review ready` inline for the current session.
  - The bottom panel opens into review, not a detached repo-wide browser.
  - The changed-file list only reflects the latest approved session action.
  - Selecting a file updates the diff preview in the same bottom-panel review surface.

### 2. Review unavailable is explicit
- Decisions: D-01, D-04, D-11, D-12
- Steps:
  1. Run a session action where execution completes but review artifacts cannot be collected.
  2. Open the Review tab in the bottom panel.
- Expect:
  - The UI shows `Review unavailable`.
  - The center workspace or session header explains why review artifacts are unavailable.
  - The bottom panel keeps execution output available instead of showing an ambiguous empty review state.
  - The wording is concise and tool-like.

### 3. No changed files is distinct from Review unavailable
- Decisions: D-04, D-11
- Steps:
  1. Run a session action that completes without file changes.
  2. Open the Review tab.
- Expect:
  - The review surface shows `No changed files` or equivalent no-change wording.
  - It does not reuse `Review unavailable` copy.
  - The result still feels attached to the current session action.

### 4. Preset save/apply stays compact and future-facing
- Decisions: D-05, D-06, D-07, D-09, D-10, D-11, D-12, D-13
- Steps:
  1. Open the right panel Settings view.
  2. Confirm the `Presets` section sits beside connection settings and workflow controls.
  3. Change shell-facing defaults such as mode, model, or review-open preference.
  4. Click `Save current`.
  5. Apply the saved preset.
- Expect:
  - A new Preset appears in the right panel with concise metadata.
  - Applying the preset updates future defaults such as mode, model, and review-open behavior.
  - Existing session history and transcript content do not get rewritten.
  - Presets feel lightweight, not like a heavy admin configuration system.

### 5. Workflow capabilities stay in the right panel and use product language
- Decisions: D-08, D-09, D-10, D-11, D-12, D-13
- Steps:
  1. Stay in the right panel Settings view.
  2. Find the `Workflow capabilities` section.
  3. Toggle one enabled capability off, then back on.
- Expect:
  - Workflow capabilities remain in the right panel, not the center workspace.
  - Labels are product-facing, such as command approval or change review.
  - Each row clearly shows enabled/disabled state with concise On/Off semantics.
  - The section feels like workflow polish, not a separate admin area.

## Pass Criteria
- Review ready, Review unavailable, and no-change review states are all clearly distinct.
- Preset save/apply is compact and changes future defaults only.
- Workflow capabilities are understandable, concise, and correctly placed in the right panel.
- The full shell feels cohesive across center workspace, bottom panel, and right panel.

## Execution Notes
- Automated prerequisite: `npm run verify:phase5`
- Manual execution status for this run: not performed by a human in-session
- If manual validation finds issues, report them grouped as: review, presets, capabilities
