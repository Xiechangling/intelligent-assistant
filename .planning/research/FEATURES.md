# Feature Landscape

**Domain:** Desktop Chat Application UI (Claude Code Desktop 复刻)
**Researched:** 2026-04-08
**Confidence:** MEDIUM (based on standard desktop chat UI patterns + milestone screenshots)

## Research Context

This research focuses on NEW features for v2.3 that replicate the official Claude Code Desktop UI. Existing features (project selection, session management, model selection, streaming chat, approval flow, code review panel, theme switching) are already implemented and not covered here.

## Table Stakes

Features users expect from a modern desktop chat application. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Mode Switcher (Chat/Cowork/Code)** | Core interaction paradigm in official UI | Medium | Tab-based navigation, affects available features/layout |
| **New Session Button** | Primary action for starting conversations | Low | Prominent placement in sidebar, keyboard shortcut expected |
| **Session List with Timestamps** | Essential for conversation history navigation | Low | Chronological order (newest first), date grouping labels |
| **Project List with "All" Filter** | Multi-project workflow is core use case | Low | "All" shows cross-project sessions, individual projects filter |
| **Empty State Visual** | First-run experience and session reset | Low | Panda mascot provides brand identity and welcoming feel |
| **Enhanced Input Box** | Modern chat apps have rich input controls | Medium | Attachment, settings, model selector, voice - all expected |
| **Window Controls** | Standard desktop app requirement | Low | Minimize/maximize/close in title bar |
| **Navigation Controls** | Browser-like history navigation | Low | Forward/back buttons for session history |

## Differentiators

Features that set the official Claude Code Desktop apart. Not expected everywhere, but valued here.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Three-Mode Paradigm** | Separates chat/collaboration/coding contexts | Medium | Unique to Claude Code, not standard in chat apps |
| **Auto Accept Edits Toggle** | Streamlines code editing workflow | Medium | Coding-specific feature, affects approval flow |
| **Voice Input Button** | Accessibility + hands-free coding | High | Requires speech-to-text integration, OS permissions |
| **Customize Menu** | Centralized settings access | Low | Replaces scattered settings, includes theme switcher |
| **Project-Scoped Sessions** | Sessions belong to projects, not global | Medium | Organizational model differs from typical chat apps |
| **Search Functionality** | Find conversations across history | Medium | Expected in mature apps, differentiator in MVP |

## Anti-Features

Features to explicitly NOT build in v2.3.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Quick Action Cards** | Official UI removed them (empty state is pure panda) | Show panda mascot only, no action shortcuts |
| **Approval Flow Panel** | Not part of official UI paradigm | Remove existing approval UI from v2.2 |
| **Code Review Panel** | Not visible in official screenshots | Remove existing review panel from v2.2 |
| **Bottom Tray** | Official UI uses clean single-column layout | Remove lifecycle tray from v2.2 |
| **Right Drawer** | Official UI has no right-side panels | Remove settings/presets drawer from v2.2 |
| **Multi-Column Layout** | Official UI is single-column conversation flow | Simplify to center-only layout |

## Feature Categories

### UI Layout Features

| Feature | Type | Relationship to Existing | Complexity |
|---------|------|-------------------------|------------|
| **Minimal Top Bar** | Replace | Replaces v2.2 chrome toolbar | Low |
| **Mode Tabs (Chat/Cowork/Code)** | New | No equivalent in v2.2 | Medium |
| **Sidebar Restructure** | Replace | Replaces v2.2 navigation sidebar | Medium |
| **Single-Column Center** | Replace | Removes multi-panel layout from v2.2 | Low |
| **Enhanced Input Box** | Enhance | Extends existing input with controls | Medium |

### Interaction Features

| Feature | Type | Relationship to Existing | Complexity |
|---------|------|-------------------------|------------|
| **New Session Action** | Enhance | Existing feature, new placement | Low |
| **Search Sessions** | New | No search in v2.2 | Medium |
| **Customize Menu** | New | Consolidates scattered settings | Low |
| **Forward/Back Navigation** | New | No history navigation in v2.2 | Low |
| **Auto Accept Toggle** | New | Related to existing approval flow | Medium |
| **Voice Input** | New | No voice input in v2.2 | High |
| **Attachment Button** | New | No file attachment in v2.2 | Medium |

### Visual Features

| Feature | Type | Relationship to Existing | Complexity |
|---------|------|-------------------------|------------|
| **Panda Empty State** | New | Replaces v2.2 empty state | Low |
| **Light Theme Refinement** | Enhance | v2.2 has themes, needs visual polish | Low |
| **Linear Icons** | Replace | Replaces v2.2 icon set | Low |
| **Rounded Cards** | Enhance | Refines existing message styling | Low |
| **Soft Dividers** | Enhance | Refines existing separators | Low |

### Content Features

| Feature | Type | Relationship to Existing | Complexity |
|---------|------|-------------------------|------------|
| **Date-Grouped Sessions** | Enhance | Existing sessions, adds grouping | Low |
| **Project Filter UI** | Enhance | Existing projects, adds "All" concept | Low |
| **Model Selector in Input** | Enhance | Moves existing model selector | Low |

## Feature Dependencies

```
Window Controls → (no dependencies)
Mode Tabs → Session List (mode affects visible sessions)
New Session → Mode Tabs (creates session in active mode)
Session List → Project Filter (filter affects visible sessions)
Project Filter → Session List (bidirectional)
Search → Session List (searches filtered sessions)
Customize Menu → Theme Switcher (consolidates existing feature)
Enhanced Input → Attachment Button, Auto Accept Toggle, Model Selector, Voice Input
Auto Accept Toggle → Approval Flow (modifies existing behavior)
Voice Input → OS Permissions, Speech-to-Text Service
Forward/Back → Session History (navigates existing sessions)
Empty State → Session List (shows when list is empty)
```

## Expected Behaviors

### Mode Switcher (Chat/Cowork/Code)

**What it does:**
- Three tabs in top bar: Chat, Cowork, Code
- Switches interaction context/paradigm
- Affects available features and UI layout

**Expected behavior:**
- Click tab to switch mode
- Active mode highlighted visually
- Mode persists per session (sessions remember their mode)
- Switching mode may filter session list to mode-specific sessions
- Keyboard shortcut: Cmd/Ctrl+1/2/3 for Chat/Cowork/Code

**Complexity:** Medium (requires mode state management, session filtering, UI adaptation)

### New Session Button

**What it does:**
- Creates new conversation in current mode
- Primary action in sidebar

**Expected behavior:**
- Click to create new session
- New session appears at top of session list
- Switches to new session immediately
- Keyboard shortcut: Cmd/Ctrl+N
- Icon: "+" or "New" with icon

**Complexity:** Low (extends existing session creation)

### Search Functionality

**What it does:**
- Finds sessions by content or title
- Filters session list in real-time

**Expected behavior:**
- Click search icon to activate search input
- Type to filter sessions (fuzzy match on titles/content)
- Clear button to reset filter
- Keyboard shortcut: Cmd/Ctrl+F
- Shows "No results" state when no matches

**Complexity:** Medium (requires search indexing, fuzzy matching, UI state)

### Customize Menu

**What it does:**
- Centralized settings access
- Replaces scattered settings from v2.2

**Expected behavior:**
- Click to open dropdown/modal
- Contains: Theme switcher, preferences, about
- Keyboard shortcut: Cmd/Ctrl+,
- Icon: gear or three dots

**Complexity:** Low (consolidates existing features)

### Projects List with "All"

**What it does:**
- Shows available projects
- "All" option shows cross-project sessions

**Expected behavior:**
- "All" selected by default
- Click project to filter sessions to that project
- Active project highlighted
- Search/filter icons for project management
- Collapsible section

**Complexity:** Low (extends existing project list)

### Sessions List with Date Grouping

**What it does:**
- Shows conversation history
- Groups by date (Today, Yesterday, Last 7 days, etc.)

**Expected behavior:**
- Newest sessions at top
- Date labels separate groups
- Click session to switch to it
- Active session highlighted
- Shows session title (auto-generated or user-set)
- Hover shows actions (rename, delete)

**Complexity:** Low (extends existing session list)

### Enhanced Input Box

**What it does:**
- Rich input controls for message composition
- Integrates attachment, settings, model, voice

**Expected behavior:**
- Multi-line text input (grows with content)
- Attachment button (left side): opens file picker
- Auto Accept toggle (left side): checkbox or switch
- Model selector (right side): dropdown showing current model
- Voice input button (right side): click to start/stop recording
- Send button (right side): appears when text entered
- Keyboard shortcut: Enter to send, Shift+Enter for newline

**Complexity:** Medium (multiple controls, state management)

### Auto Accept Edits Toggle

**What it does:**
- Enables/disables automatic approval of code edits
- Streamlines coding workflow

**Expected behavior:**
- Toggle switch or checkbox in input box
- When ON: code edits auto-apply without approval prompt
- When OFF: existing approval flow (v2.2 behavior)
- State persists per session
- Visual indicator when active

**Complexity:** Medium (modifies existing approval flow)

### Voice Input Button

**What it does:**
- Speech-to-text input for messages
- Accessibility feature

**Expected behavior:**
- Click to start recording (button changes to "listening" state)
- Click again to stop and transcribe
- Transcribed text appears in input box
- Requires microphone permission (OS prompt on first use)
- Visual feedback during recording (waveform or pulsing icon)
- Error handling for no permission or transcription failure

**Complexity:** High (OS integration, permissions, speech-to-text service)

### Attachment Button

**What it does:**
- Attaches files to messages
- Supports code files, images, documents

**Expected behavior:**
- Click to open file picker
- Selected files show as chips/tags in input area
- Remove button on each attachment
- File type validation (reject unsupported types)
- Size limit enforcement
- Preview for images

**Complexity:** Medium (file handling, validation, preview)

### Window Controls

**What it does:**
- Standard desktop window management
- Minimize, maximize, close

**Expected behavior:**
- Three buttons in top-right corner
- Minimize: hides to taskbar
- Maximize: toggles fullscreen/windowed
- Close: quits application (with unsaved work warning)
- Platform-specific styling (Windows style)

**Complexity:** Low (Tauri provides native controls)

### Forward/Back Navigation

**What it does:**
- Browser-like history navigation
- Moves through session history

**Expected behavior:**
- Back: returns to previous session
- Forward: moves to next session (if went back)
- Disabled when no history in that direction
- Keyboard shortcuts: Alt+Left/Right (Windows)
- Visual: arrow icons in top bar

**Complexity:** Low (session history stack)

### Empty State (Panda Mascot)

**What it does:**
- Welcoming visual when no session active
- Brand identity element

**Expected behavior:**
- Shows large panda illustration in center
- No quick action cards (removed from official UI)
- Optional welcome text
- Appears on first launch and when no session selected

**Complexity:** Low (static visual asset)

## MVP Recommendation

### Phase 1: Core Layout & Navigation
**Prioritize:**
1. Minimal top bar with window controls
2. Mode tabs (Chat/Cowork/Code) - stub modes initially
3. Sidebar restructure (New/Search/Customize buttons)
4. Single-column center layout (remove panels)
5. Forward/back navigation

**Why first:** Establishes visual foundation, removes v2.2 complexity

### Phase 2: Session & Project Management
**Prioritize:**
1. Date-grouped session list
2. Projects list with "All" filter
3. Search functionality
4. Empty state (panda mascot)

**Why second:** Core content organization, depends on layout

### Phase 3: Enhanced Input
**Prioritize:**
1. Input box redesign with control layout
2. Model selector in input
3. Attachment button
4. Auto accept toggle

**Why third:** Rich interaction, depends on layout + session management

### Phase 4: Visual Polish
**Prioritize:**
1. Light theme refinement
2. Linear icons
3. Rounded cards
4. Soft dividers

**Why fourth:** Visual consistency, can iterate after functionality works

### Defer to Post-MVP
- **Voice input:** High complexity, lower priority than core features
- **Customize menu:** Can use temporary settings UI until consolidated
- **Advanced search:** Basic filter sufficient for MVP

## Complexity Summary

| Complexity | Count | Features |
|------------|-------|----------|
| **Low** | 14 | Window controls, new session, empty state, customize menu, projects list, session list, forward/back, minimal top bar, single-column layout, date grouping, project filter, model selector move, light theme, icons |
| **Medium** | 9 | Mode tabs, sidebar restructure, enhanced input, search, auto accept toggle, attachment button, project-scoped sessions, mode filtering, input controls |
| **High** | 1 | Voice input |

**Total:** 24 features (14 low, 9 medium, 1 high)

## Relationship to Existing Features (v2.2)

### Features to Remove
- Approval flow panel (right side)
- Code review panel (drawer)
- Bottom lifecycle tray
- Right settings drawer
- Multi-column layout
- Quick action cards in empty state

### Features to Enhance
- Top toolbar → Minimal top bar with mode tabs
- Navigation sidebar → Restructured with New/Search/Customize
- Session list → Add date grouping
- Project list → Add "All" filter
- Input box → Add controls (attachment, auto accept, model, voice)
- Theme switcher → Move to Customize menu
- Empty state → Replace with panda mascot

### Features to Preserve
- Project selection/switching (core functionality)
- Session management/recovery (core functionality)
- Model selection (moved to input box)
- Streaming chat (unchanged)
- Theme switching (moved to Customize)

## Sources

**Confidence Assessment:**
- **Layout/Navigation features:** MEDIUM confidence (based on standard desktop chat UI patterns + milestone description)
- **Interaction features:** MEDIUM confidence (inferred from common desktop app behaviors)
- **Visual features:** LOW confidence (requires official screenshots for exact styling)
- **Mode switcher behavior:** LOW confidence (unique to Claude Code, needs official documentation)
- **Voice input implementation:** LOW confidence (no official documentation found)

**Research limitations:**
- No official Claude Code Desktop documentation found via web search
- Feature behaviors inferred from standard desktop chat application patterns (Slack, Discord, VS Code, etc.)
- Exact visual styling requires reference to official screenshots provided in milestone context
- Mode switcher (Chat/Cowork/Code) behavior is speculative without official documentation

**Recommended validation:**
- Review official Claude Code Desktop screenshots for exact visual styling
- Test official application (if available) to verify interaction patterns
- Validate mode switcher behavior with official documentation or user testing
- Confirm voice input implementation approach (OS-level vs cloud service)
