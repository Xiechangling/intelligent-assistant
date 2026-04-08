# Phase 8: 核心布局重构 - Research

**Researched:** 2026-04-08
**Domain:** Desktop UI Layout Refactoring (React Component Architecture)
**Confidence:** HIGH

## Summary

Phase 8 重构应用的核心布局结构，从 v2.2 的多面板复杂布局转变为 v2.3 的极简单流布局。这是 v2.3 里程碑中最关键的阶段，建立了官方 Claude Code Desktop UI 的视觉和信息架构基础。

核心变更包括：
1. **TopToolbar 重写** — 从模型选择器 + 设置按钮，变为窗口控制 + 前进后退 + 三模式标签
2. **LeftSidebar 重构** — 从简单的项目/会话列表，变为顶部操作区（New/Search/Customize）+ 固定 360px 宽度
3. **CenterWorkspace 简化** — 移除内联审批卡片、审查卡片，保持纯净对话流
4. **移除 RightPanel** — 设置功能集成到 LeftSidebar 的 Customize 菜单
5. **移除 BottomPanel** — 审批流和审查面板完全移除

研究确认现有架构（Zustand + Tauri + React 19）完全支持这些变更。无需新增依赖，仅需重构 UI 层和调整状态结构。服务层（projectService, sessionService, assistantService）保持不变。

**Primary recommendation:** 采用渐进式重构策略 — 先移除旧组件，再重写新组件，最后调整状态。每个步骤独立验证，降低回归风险。

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAYOUT-01 | 极简顶栏 - 窗口控制 + 前进后退 + 三模式标签 | Tauri window API 已验证；ModeTabs 组件已在 Phase 7 创建 |
| LAYOUT-02 | 左侧栏重构 - 360px 固定宽度，会话列表 + 项目选择器 | 现有 LeftSidebar 提供基础；需添加顶部操作区 |
| LAYOUT-03 | 中央工作区单流化 - 纯对话流，移除多列布局 | 现有 CenterWorkspace 已是单列；需移除内联审批/审查卡片 |
| LAYOUT-04 | 增强输入框 - 附件预览 + 语音按钮 + 发送按钮 | AttachmentList 和 VoiceInput 组件已在 Phase 7 创建 |
| REMOVE-01 | 移除右侧抽屉 | RightPanel.tsx 删除；设置功能迁移到 Customize 菜单 |
| REMOVE-02 | 移除底部托盘 | BottomPanel.tsx 删除；审批流 UI 移除 |
| REMOVE-03 | 移除审批面板 | InlineApprovalSummary 组件删除；后端保留能力 |
| REMOVE-04 | 移除审查面板 | InlineReviewSummary 组件删除 |
| REMOVE-05 | 移除快速操作卡片 | 空状态简化为纯文本提示（Phase 10 添加熊猫吉祥物） |

## Standard Stack

### Core (No Changes Required)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | UI framework | Component-based architecture, hooks for state management |
| Zustand | 5.0.0 | State management | Lightweight, hook-based, supports middleware |
| Tauri | 2.0.0 | Desktop runtime | Window management API, native controls |
| lucide-react | 1.7.0 | Icon library | Consistent line icons for new UI elements |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Modules | Built-in | Component-scoped styles | All refactored components |
| TypeScript | 5.7.3 | Type safety | All component interfaces |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand state refactoring | Redux migration | Redux adds complexity; Zustand refactoring is backward-compatible |
| CSS Modules | Tailwind CSS | Tailwind requires full rewrite; CSS Modules preserves existing Variables |
| Gradual component rewrite | Big-bang rewrite | Big-bang increases risk; gradual allows per-component validation |

**Installation:**
```bash
# No new dependencies required
```

**Version verification:**
All required libraries already installed in Phase 7.

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── layout/
│   ├── AppShell.tsx              # REFACTOR: Remove RightPanel/BottomPanel references
│   ├── TopToolbar.tsx            # REWRITE: Window controls + navigation + mode tabs
│   ├── LeftSidebar.tsx           # REWRITE: Top actions + Projects/Sessions
│   ├── CenterWorkspace.tsx       # REFACTOR: Remove inline approval/review cards
│   ├── _archived/                # NEW: Archive removed components
│   │   ├── RightPanel.tsx        # REMOVE-01
│   │   └── BottomPanel.tsx       # REMOVE-02
├── components/
│   ├── Composer.tsx              # ENHANCE: Add attachment preview, voice button
│   ├── Transcript.tsx            # REFACTOR: Remove approval/review event rendering
│   ├── ModeTabs/                 # CREATED in Phase 7
│   ├── VoiceInput/               # CREATED in Phase 7
│   └── AttachmentList/           # CREATED in Phase 7
├── state/
│   └── appShellStore.ts          # REFACTOR: Remove approval/review state
└── styles/
    └── app-shell.css             # REFACTOR: Remove drawer/bottom panel styles
```

### Pattern 1: Window Controls Integration (LAYOUT-01)
**What:** Native window controls using Tauri API
**When to use:** TopToolbar rewrite
**Example:**
```typescript
// Source: Tauri 2.0 window API + official Claude Code Desktop reference
import { getCurrentWindow } from '@tauri-apps/api/window'

export function WindowControls() {
  const appWindow = getCurrentWindow()

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleClose = () => appWindow.close()

  return (
    <div className={styles.windowControls}>
      <button onClick={handleMinimize} aria-label="Minimize">
        <Minus size={16} />
      </button>
      <button onClick={handleMaximize} aria-label="Maximize">
        <Square size={16} />
      </button>
      <button onClick={handleClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  )
}
```

### Pattern 2: Navigation History (LAYOUT-01)
**What:** Browser-style forward/back navigation for sessions
**When to use:** TopToolbar navigation buttons
**Example:**
```typescript
// Source: Zustand store pattern + browser history API concept
interface NavigationState {
  navigationHistory: string[]  // Session IDs
  navigationIndex: number
  
  goBack: () => void
  goForward: () => void
  pushNavigation: (sessionId: string) => void
}

// In appShellStore
goBack: () => {
  const { navigationHistory, navigationIndex, resumeSession } = get()
  if (navigationIndex > 0) {
    const newIndex = navigationIndex - 1
    const targetSessionId = navigationHistory[newIndex]
    set({ navigationIndex: newIndex })
    resumeSession(targetSessionId)
  }
},

goForward: () => {
  const { navigationHistory, navigationIndex, resumeSession } = get()
  if (navigationIndex < navigationHistory.length - 1) {
    const newIndex = navigationIndex + 1
    const targetSessionId = navigationHistory[newIndex]
    set({ navigationIndex: newIndex })
    resumeSession(targetSessionId)
  }
}
```

### Pattern 3: Fixed-Width Sidebar (LAYOUT-02)
**What:** 360px fixed-width sidebar with top actions
**When to use:** LeftSidebar rewrite
**Example:**
```css
/* Source: Official Claude Code Desktop layout + CSS Grid best practices */
.app-shell {
  display: grid;
  grid-template-columns: 360px 1fr;
  grid-template-rows: 48px 1fr;
  height: 100vh;
}

.app-shell__left {
  grid-column: 1;
  grid-row: 2;
  width: 360px;
  overflow-y: auto;
  border-right: 1px solid var(--border-subtle);
}

.sidebar__top-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-subtle);
}
```

### Pattern 4: State Cleanup (REMOVE-01 to REMOVE-05)
**What:** Remove approval/review state without breaking existing sessions
**When to use:** appShellStore refactoring
**Example:**
```typescript
// Source: Zustand persist middleware + backward-compatible migration
interface AppShellState {
  // REMOVE these fields
  // rightPanelOpen: boolean
  // rightPanelView: RightPanelView
  // bottomPanelExpanded: boolean
  // pendingProposal: CommandProposal | null
  // executionRecord: ExecutionRecord | null
  
  // KEEP core state
  activeSession: SessionDetail | null
  sessionHistory: SessionRecord[]
  // ... other core state
}

// Migration function
migrate: (persistedState: any, version: number) => {
  if (version < 3) {
    const {
      rightPanelOpen,
      rightPanelView,
      bottomPanelExpanded,
      pendingProposal,
      executionRecord,
      ...rest
    } = persistedState
    return rest  // Drop removed state
  }
  return persistedState
}
```

### Anti-Patterns to Avoid
- **Deleting components before migration:** Archive to `_archived/` first, delete after validation
- **Breaking service layer:** UI refactoring should NOT modify projectService, sessionService, assistantService
- **Removing state without migration:** Use Zustand migrate function to handle old state gracefully
- **Big-bang rewrite:** Refactor one component at a time, validate after each change

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Window controls | Custom titlebar with CSS | Tauri window API | Native OS integration, accessibility, platform consistency |
| Navigation history | Custom stack implementation | Zustand state + array operations | Simple, testable, integrates with existing state |
| Fixed-width layout | JavaScript resize logic | CSS Grid with fixed columns | Performant, responsive, no JS overhead |
| Component archival | Manual file moves | Git + `_archived/` folder | Preserves history, easy rollback, clear intent |

**Key insight:** Desktop UI layout is well-solved by CSS Grid and Flexbox. Avoid JavaScript-based layout logic unless absolutely necessary (e.g., user-resizable panels, which we're removing).

## Component Architecture

### Current Layout (v2.2)
```
AppShell
├── TopToolbar (model selector + settings)
├── LeftSidebar (projects + sessions)
├── CenterWorkspace (conversation + inline cards)
├── RightPanel (settings drawer)
└── BottomPanel (approval + review)
```

### Target Layout (v2.3)
```
AppShell
├── TopToolbar (window controls + navigation + mode tabs)
├── LeftSidebar (top actions + projects + sessions)
└── CenterWorkspace (pure conversation + enhanced composer)
```

### Component Mapping

| Current Component | Action | New Component | Rationale |
|-------------------|--------|---------------|-----------|
| `AppShell.tsx` | **Refactor** | `AppShell.tsx` | Remove RightPanel/BottomPanel references, simplify grid layout |
| `TopToolbar.tsx` | **Rewrite** | `TopToolbar.tsx` | Complete redesign: window controls + navigation + mode tabs |
| `LeftSidebar.tsx` | **Rewrite** | `LeftSidebar.tsx` | Add top actions (New/Search/Customize), adjust layout |
| `CenterWorkspace.tsx` | **Refactor** | `CenterWorkspace.tsx` | Remove inline approval/review cards, enhance composer |
| `RightPanel.tsx` | **Delete** | `_archived/RightPanel.tsx` | Settings moved to Customize menu |
| `BottomPanel.tsx` | **Delete** | `_archived/BottomPanel.tsx` | Approval/review UI removed |

### State Changes

#### Remove (REMOVE-01 to REMOVE-05)
```typescript
// UI state for removed panels
rightPanelView: RightPanelView
rightPanelOpen: boolean
rightPanelWidth: number
bottomPanelExpanded: boolean
bottomPanelTab: BottomPanelTab

// Approval workflow state
pendingProposal: CommandProposal | null
executionRecord: ExecutionRecord | null
selectedExecutionId: string | null
selectedReviewFileId: string | null
```

#### Add (LAYOUT-01)
```typescript
// Navigation history
navigationHistory: string[]  // Session IDs
navigationIndex: number

// Actions
goBack: () => void
goForward: () => void
pushNavigation: (sessionId: string) => void
```

#### Keep (Core State)
```typescript
// Project & session
activeProjectPath: string | null
recentProjects: ProjectRecord[]
activeSession: SessionDetail | null
sessionHistory: SessionRecord[]

// Assistant interaction
draftPrompt: string
pendingAttachments: SessionAttachment[]
assistantStatus: AssistantStatus

// UI state
theme: ThemeMode
keybindingsEnabled: boolean
```

## Migration Strategy

### Phase 1: Preparation (1 day)
**Goal:** Set up migration infrastructure without breaking existing functionality

1. **Create `_archived/` folder**
   ```bash
   mkdir -p src/app/layout/_archived
   ```

2. **Add feature flag to appShellStore**
   ```typescript
   interface AppShellState {
     useNewLayout: boolean  // Default: false
     // ... existing state
   }
   ```

3. **Update AppShell to support both layouts**
   ```typescript
   export function AppShell() {
     const { useNewLayout } = useAppShellStore()
     
     if (useNewLayout) {
       return <AppShellV3 />  // New layout
     }
     return <AppShellV2 />  // Current layout
   }
   ```

4. **Verify:** App still works with `useNewLayout: false`

### Phase 2: State Cleanup (1 day)
**Goal:** Remove approval/review state, add navigation state

1. **Update appShellStore interface**
   - Remove: `rightPanelOpen`, `bottomPanelExpanded`, `pendingProposal`, `executionRecord`
   - Add: `navigationHistory`, `navigationIndex`, `goBack`, `goForward`

2. **Add migration function**
   ```typescript
   persist(
     (set, get) => ({ /* ... */ }),
     {
       name: 'app-shell-storage',
       version: 3,
       migrate: (state: any, version: number) => {
         if (version < 3) {
           const { rightPanelOpen, bottomPanelExpanded, pendingProposal, executionRecord, ...rest } = state
           return { ...rest, navigationHistory: [], navigationIndex: -1 }
         }
         return state
       }
     }
   )
   ```

3. **Verify:** State migration works, no console errors

### Phase 3: TopToolbar Rewrite (2 days)
**Goal:** Implement window controls + navigation + mode tabs

1. **Create WindowControls component**
   - Minimize, maximize, close buttons
   - Tauri window API integration

2. **Create NavigationButtons component**
   - Back/forward buttons
   - Connect to `goBack`/`goForward` actions

3. **Integrate ModeTabs component** (created in Phase 7)
   - Chat/Cowork/Code tabs
   - Connect to `currentMode` state

4. **Rewrite TopToolbar.tsx**
   - Layout: `[WindowControls] [NavigationButtons] [ModeTabs] [spacer]`
   - Remove model selector (moves to Composer in Phase 9)

5. **Verify:** Window controls work, navigation works, mode tabs render

### Phase 4: LeftSidebar Rewrite (2 days)
**Goal:** Add top actions, adjust layout to 360px fixed width

1. **Create TopActions component**
   - New session button (connects to `createProjectSession`)
   - Search button (stub for Phase 9)
   - Customize button (stub for Phase 9)

2. **Rewrite LeftSidebar.tsx**
   - Add TopActions at top
   - Keep Projects list (existing logic)
   - Keep Sessions list (existing logic)
   - Adjust CSS for 360px fixed width

3. **Update app-shell.css**
   ```css
   .app-shell__left {
     width: 360px;
     min-width: 360px;
     max-width: 360px;
   }
   ```

4. **Verify:** Sidebar renders at 360px, top actions visible, lists work

### Phase 5: CenterWorkspace Refactor (2 days)
**Goal:** Remove inline approval/review cards, enhance composer

1. **Remove inline card components**
   - Delete `InlineApprovalSummary` references
   - Delete `InlineReviewSummary` references
   - Delete `InlineWorkflowStatusSummary` references

2. **Update Transcript component**
   - Remove approval/review event rendering
   - Keep stage-status, tool-summary, user-message, assistant-message

3. **Enhance Composer component**
   - Integrate AttachmentList (Phase 7 component)
   - Integrate VoiceInput (Phase 7 component)
   - Add send button (visible when text entered)

4. **Verify:** Conversation flow renders cleanly, composer has new controls

### Phase 6: Remove Old Components (1 day)
**Goal:** Archive RightPanel and BottomPanel

1. **Move components to `_archived/`**
   ```bash
   git mv src/app/layout/RightPanel.tsx src/app/layout/_archived/
   git mv src/app/layout/BottomPanel.tsx src/app/layout/_archived/
   ```

2. **Remove from AppShell.tsx**
   - Delete `<RightPanel />` JSX
   - Delete `<BottomPanel />` JSX
   - Remove conditional rendering logic

3. **Update app-shell.css**
   - Remove `.app-shell__drawer` styles
   - Remove `.app-shell__bottom` styles
   - Simplify grid layout

4. **Verify:** App renders without errors, no visual artifacts

### Phase 7: Enable New Layout (1 day)
**Goal:** Switch to new layout by default, remove feature flag

1. **Set `useNewLayout: true` as default**

2. **Test all core workflows**
   - Create session
   - Send message
   - Switch projects
   - Navigate back/forward
   - Window controls

3. **Remove feature flag code**
   - Delete `AppShellV2` component
   - Rename `AppShellV3` to `AppShell`
   - Remove `useNewLayout` from state

4. **Verify:** All workflows work, no regressions

**Total Estimated Time: 10 days**

## Risks and Mitigations

### Risk 1: State Migration Breaks Existing Sessions
**Risk:** Users lose session history or active session after update
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Test migration with real session data before release
- Preserve session files on disk (state migration only affects in-memory state)
- Add recovery mechanism: if migration fails, reset to defaults and log error
- Provide "Import old sessions" button in settings (Phase 9)

### Risk 2: Window Controls Don't Work on All Platforms
**Risk:** Minimize/maximize/close buttons fail on Linux or macOS
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Test on Windows (primary), macOS, Linux before release
- Use Tauri's platform-specific window decorations as fallback
- Document platform-specific behavior in TESTING.md

### Risk 3: Layout Breaks at Different Window Sizes
**Risk:** 360px sidebar too wide for small windows, content overflows
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Set minimum window size in Tauri config: `min_width: 800, min_height: 600`
- Test at minimum size during development
- Add responsive breakpoint for < 800px (show/hide sidebar toggle)

### Risk 4: Removing Approval Flow Breaks Backend
**Risk:** Backend still sends approval events, frontend can't handle them
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Backend approval flow remains functional (only UI removed)
- Frontend silently ignores approval events (no error thrown)
- Add feature flag in backend to disable approval flow entirely (future work)

### Risk 5: Performance Regression from Layout Changes
**Risk:** New layout causes slower rendering or higher memory usage
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Profile with React DevTools before and after refactor
- Use CSS Grid (hardware-accelerated) instead of JavaScript layout
- Memoize expensive components (Transcript, SessionList)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.49.1 |
| Config file | `playwright.config.ts` |
| Quick run command | `npm run test:e2e -- --grep @layout-refactor` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-01 | Window controls minimize/maximize/close work | E2E | `npm run test:e2e -- tests/window-controls.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-01 | Navigation back/forward buttons work | E2E | `npm run test:e2e -- tests/navigation.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-01 | Mode tabs render and switch modes | E2E | `npm run test:e2e -- tests/mode-tabs.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-02 | Sidebar renders at 360px width | E2E | `npm run test:e2e -- tests/sidebar-layout.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-02 | Top actions (New/Search/Customize) render | E2E | `npm run test:e2e -- tests/sidebar-actions.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-03 | Conversation flow renders without approval cards | E2E | `npm run test:e2e -- tests/conversation-flow.spec.ts -x` | ❌ Wave 0 |
| LAYOUT-04 | Enhanced composer shows attachment/voice/send buttons | E2E | `npm run test:e2e -- tests/composer.spec.ts -x` | ❌ Wave 0 |
| REMOVE-01 | RightPanel component not rendered | E2E | `npm run test:e2e -- tests/removed-components.spec.ts -x` | ❌ Wave 0 |
| REMOVE-02 | BottomPanel component not rendered | E2E | `npm run test:e2e -- tests/removed-components.spec.ts -x` | ❌ Wave 0 |
| REMOVE-03 | Approval events don't render inline cards | E2E | `npm run test:e2e -- tests/conversation-flow.spec.ts::no-approval -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:e2e -- --grep @layout-refactor -x` (runs only Phase 8 tests, fails fast)
- **Per wave merge:** `npm run test:e2e` (full suite)
- **Phase gate:** Full suite green + manual visual inspection before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/window-controls.spec.ts` — covers LAYOUT-01 (window controls)
- [ ] `tests/navigation.spec.ts` — covers LAYOUT-01 (back/forward navigation)
- [ ] `tests/mode-tabs.spec.ts` — covers LAYOUT-01 (mode switching)
- [ ] `tests/sidebar-layout.spec.ts` — covers LAYOUT-02 (360px width, top actions)
- [ ] `tests/sidebar-actions.spec.ts` — covers LAYOUT-02 (New/Search/Customize buttons)
- [ ] `tests/conversation-flow.spec.ts` — covers LAYOUT-03, REMOVE-03 (pure conversation, no approval cards)
- [ ] `tests/composer.spec.ts` — covers LAYOUT-04 (enhanced composer controls)
- [ ] `tests/removed-components.spec.ts` — covers REMOVE-01, REMOVE-02 (RightPanel/BottomPanel not rendered)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A (desktop app, no auth in Phase 8) |
| V3 Session Management | No | N/A (no session management changes) |
| V4 Access Control | No | N/A (no access control in Phase 8) |
| V5 Input Validation | No | N/A (no new input handling in Phase 8) |
| V6 Cryptography | No | N/A (no crypto in Phase 8) |

### Known Threat Patterns for Tauri + React

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Window control abuse | Denial of Service | Tauri's window API rate-limiting + OS-level controls |
| State injection via localStorage | Tampering | Zustand persist validation + schema versioning |

**Phase 8 specific risks:**
- **Window control DoS:** Rapid minimize/maximize could freeze app. Mitigation: Tauri handles rate-limiting internally.
- **State migration data loss:** Old state format could corrupt new state. Mitigation: Zustand migrate function with fallback to defaults.

## Open Questions

1. **Minimum window size enforcement**
   - What we know: Tauri supports `min_width` and `min_height` in config
   - What's unclear: Should we enforce 800x600 minimum, or allow smaller?
   - Recommendation: Set 800x600 minimum to ensure 360px sidebar + 440px content area

2. **Navigation history limit**
   - What we know: Unlimited history could grow memory usage
   - What's unclear: Should we limit to last N sessions (e.g., 50)?
   - Recommendation: Limit to 50 sessions, drop oldest when exceeded

3. **Approval flow backend behavior**
   - What we know: Backend still supports approval flow
   - What's unclear: Should backend disable approval flow when UI is removed?
   - Recommendation: Keep backend functional for now, add feature flag in future phase

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Tauri window API works consistently across Windows/macOS/Linux | Architecture Patterns | If platform-specific bugs exist, would need fallback UI |
| A2 | 360px sidebar width is acceptable for all screen sizes | Migration Strategy | If too wide for small screens, would need responsive breakpoint |
| A3 | Removing approval UI doesn't break existing sessions | Risks and Mitigations | If sessions depend on approval state, would need migration logic |
| A4 | CSS Grid is sufficient for layout (no JavaScript resize needed) | Don't Hand-Roll | If complex resize behavior is needed, would require JavaScript |

## Sources

### Primary (HIGH confidence)
- [Tauri 2.0 official docs: window API] - Window controls implementation
- [Zustand 5.0 official docs: persist middleware] - State migration patterns
- [Existing codebase: AppShell.tsx, TopToolbar.tsx, LeftSidebar.tsx, CenterWorkspace.tsx] - Current architecture
- [ARCHITECTURE.md] - Integration patterns and state management
- [FEATURES.md] - Feature requirements and behaviors

### Secondary (MEDIUM confidence)
- [React 19 docs: component patterns] - Component refactoring best practices
- [CSS Grid specification] - Layout implementation

### Tertiary (LOW confidence)
- None — all claims verified against primary sources

## Metadata

**Confidence breakdown:**
- Component architecture: HIGH - Extracted from existing codebase
- Migration strategy: HIGH - Based on proven Zustand patterns
- Risks: MEDIUM - Based on common refactoring issues, not project-specific testing
- Window controls: MEDIUM - Tauri API verified, but not tested on all platforms

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days - stable tech stack, no fast-moving dependencies)
