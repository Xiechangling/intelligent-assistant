# Roadmap: Intelligent Assistant

**Created:** 2026-03-29
**Project:** `.planning/PROJECT.md`
**Requirements:** `.planning/REQUIREMENTS.md`

## Overview

**5 phases** | **21 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Desktop Shell & Project Foundation | Establish the Windows-first desktop shell, local project management, model selection basics, and secure configuration foundation. | PROJ-01, PROJ-02, PROJ-03, CONF-01, CONF-02, SECR-01 | 4 |
| 2 | Session Persistence & Recovery | Make sessions durable, resumable, and clearly tied to project and model context. | SESS-01, SESS-02, SESS-03, SESS-04, SECR-02 | 4 |
| 3 | Conversational Coding Workflow | Deliver the natural-language assistant experience for project-aware coding tasks with streaming responses. | CHAT-01, CHAT-02, CHAT-03 | 4 |
| 4 | Safe Execution & Visibility | Add command approval, execution visibility, and clear working-context safeguards. | EXEC-01, EXEC-02, EXEC-03 | 4 |
| 5 | Review, Skills & Workflow Polish | Complete the MVP with diff review, skills/config management, templates, and workflow polish. | REVW-01, REVW-02, CONF-03, CONF-04 | 5 |

## Phase Details

### Phase 1: Desktop Shell & Project Foundation
**Goal:** Establish a usable Windows-first desktop shell that lets the user manage project roots, choose models, and configure secure local credentials.

**Requirements:** PROJ-01, PROJ-02, PROJ-03, CONF-01, CONF-02, SECR-01

**Success Criteria:**
1. User can launch the desktop app and add/open a local project directory.
2. User can switch between known projects and always see the active project context clearly.
3. User can choose and change the active Claude model from the GUI.
4. User can store required API credentials securely without plaintext secrets in normal UI config.

**UI hint:** yes

### Phase 2: Session Persistence & Recovery
**Goal:** Make the desktop product reliable for repeated daily use by introducing durable session creation, resume, history, and state recovery.

**Requirements:** SESS-01, SESS-02, SESS-03, SESS-04, SECR-02

**Success Criteria:**
1. User can create a new session tied to the selected project.
2. User can reopen the app and resume prior sessions with preserved transcript and metadata.
3. User can browse session history by project and identify current/previous activity.
4. Session state preserves key context such as project association, model choice, and recent task status.

**UI hint:** yes
**Status:** Complete on 2026-03-30

### Phase 3: Conversational Coding Workflow
**Goal:** Deliver the core desktop interaction loop for natural-language coding assistance with streaming responses in the chosen project context.

**Requirements:** CHAT-01, CHAT-02, CHAT-03

**Success Criteria:**
1. User can send prompts from the desktop conversation interface.
2. Assistant responses stream into the active session with visible in-progress state.
3. User can perform knowledge Q&A, code analysis, and project-aware code modification tasks from the app.
4. Conversation activity remains associated with the active project and session.

**UI hint:** yes
**Status:** Complete on 2026-03-30

### Phase 4: Safe Execution & Visibility
**Goal:** Make assistant-driven actions trustworthy by adding approval controls, execution output visibility, and explicit working-context safeguards.

**Requirements:** EXEC-01, EXEC-02, EXEC-03

**Success Criteria:**
1. User can review and approve or reject impactful commands before they run.
2. Approval UI clearly shows command intent and project/working context.
3. User can observe execution output and task progress inside the desktop app.
4. Command execution state stays synchronized with the active session timeline.

**UI hint:** yes
**Status:** Complete on 2026-03-30

### Phase 5: Review, Skills & Workflow Polish
**Goal:** Finish the MVP with review surfaces and configuration ergonomics that make the product meaningfully better than terminal-only usage.

**Requirements:** REVW-01, REVW-02, CONF-03, CONF-04

**Success Criteria:**
1. User can inspect changed files created during assistant-driven work.
2. User can preview diffs tied to session activity.
3. User can save and reuse configuration templates or presets.
4. User can configure available skills or workflow capabilities from the GUI.
5. Core desktop workflow feels cohesive across project, session, execution, and review surfaces.

**UI hint:** yes
**Status:** Complete on 2026-03-30
