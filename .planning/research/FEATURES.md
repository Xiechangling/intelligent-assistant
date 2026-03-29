# FEATURES

## Table Stakes

These are the minimum features users expect from a desktop coding assistant that replaces CLI friction.

### Session Management
- Start a new session from the desktop UI
- Resume prior sessions
- Browse session history by project
- View session status and recent activity
- Preserve transcript/context per session

**Complexity:** Medium
**Dependencies:** local persistence, project association, model/config state

### Project Workspace Management
- Add/open local project directories
- Switch active project context quickly
- Show current project root clearly
- Keep per-project recent sessions/config

**Complexity:** Medium
**Dependencies:** filesystem access, persistence

### Model + Runtime Configuration
- Choose active model
- Switch model without hunting through CLI config
- Save reusable presets/templates
- Show current runtime configuration clearly

**Complexity:** Low-Medium
**Dependencies:** settings model, secure secret handling

### Natural-Language Task Interface
- Chat-style prompt entry
- Streaming assistant responses
- Support coding tasks like explanation, analysis, edits, and command suggestions
- Show tool/task progress visibly

**Complexity:** High
**Dependencies:** orchestration layer, assistant transport, session state

### Command Approval + Execution Visibility
- Show proposed commands before execution when needed
- Let user approve/reject
- Show terminal/log output
- Track running/completed tasks

**Complexity:** High
**Dependencies:** command orchestration, PTY/logging, approval UX

### Diff / Change Review
- Show changed files
- Preview diffs before/after actions when available
- Link activity back to project/session

**Complexity:** High
**Dependencies:** git/diff integration or file snapshot tracking

## Good MVP Differentiators

These are strong additions but should be secondary to the table stakes above.

### Skill Configuration
- Enable/disable configured skills
- Surface available workflows/skills in UI
- Let user edit common skill settings

**Complexity:** Medium
**Dependencies:** configuration model, settings UX

### Saved Presets / Profiles
- Named model + instruction presets
- Project-scoped defaults
- Quick switching between work modes

**Complexity:** Medium
**Dependencies:** config persistence, settings UX

### Multi-pane Productivity Layout
- Chat pane
- terminal/task pane
- project/session sidebar
- diff/review pane

**Complexity:** Medium
**Dependencies:** strong layout/state architecture

## Defer to Later Differentiators

These are valuable later, but not needed for MVP.

- Cross-device cloud sync
- Team/shared workspaces
- Plugin marketplace
- Deep analytics/telemetry dashboards
- Collaborative session sharing
- Voice input / multimodal extras
- Built-in issue tracker integrations beyond lightweight launch links

## Anti-Features For MVP

| Anti-feature | Why not now |
|---|---|
| Team collaboration | Not needed for single-user self-use MVP |
| Multi-user permissions | Pulls architecture toward SaaS/admin complexity |
| Cloud-hosted session sync | Adds auth, privacy, and conflict complexity |
| Plugin marketplace | Requires stability, API design, trust model, and moderation |
| Overly broad IDE replacement ambitions | Risks losing focus on Claude Code workflow enhancement |
| Fully autonomous background execution by default | Dangerous before approval and visibility UX are solid |

## Recommended MVP Feature Set

### Include in v1
1. Project directory management
2. Session creation, resume, and history
3. Model selection and quick switching
4. Prompt/chat interface with streaming responses
5. Command approval surface
6. Terminal/log output visibility
7. Diff preview for edits/changes
8. Basic skills/settings configuration
9. Reusable config templates/presets

### Keep lean in v1
- Single local user
- Local-only persistence
- Windows-first assumptions
- Explicit approval on impactful actions

## Feature Dependencies / Build Order

1. **Project + settings foundation**
2. **Session lifecycle + persistence**
3. **Assistant interaction + streaming**
4. **Command execution + approvals**
5. **Diff/review flows**
6. **Polish: presets, skills UI, better navigation**

## Bottom Line

The MVP should focus on making **model switching, session management, project management, natural-language interaction, approvals, and diff visibility** feel dramatically better than CLI usage. That is the real product promise.
