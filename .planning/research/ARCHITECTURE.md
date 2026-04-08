# Architecture Integration: 官方 UI 复刻与现有架构

**Project:** Intelligent Assistant v2.3
**Researched:** 2026-04-08
**Confidence:** HIGH

## Executive Summary

新 UI 完全复刻官方 Claude Code Desktop 体验，但保留现有 Tauri 2.0 + React 19 + Zustand 架构。核心策略：**重构 UI 层，保留服务层和状态管理模式**。

现有架构已验证且稳定：
- Zustand store (`appShellStore`) 管理全局状态
- Tauri invoke 调用 Rust 后端服务
- React 组件消费 store 状态并触发 actions
- 服务层 (projectService, sessionService, assistantService) 封装 Tauri 调用

新 UI 集成方式：
1. **保留 appShellStore** — 调整状态结构以匹配新 UI 需求
2. **重写布局组件** — TopToolbar, LeftSidebar, CenterWorkspace 完全重构
3. **移除组件** — RightPanel, BottomPanel 删除
4. **保留服务层** — 所有 Tauri 服务调用不变
5. **保留数据流** — UI → store actions → services → Tauri backend

## Current Architecture (Preserved)

### State Management: Zustand Store

**Location:** `src/app/state/appShellStore.ts`

**Core Pattern:**
```typescript
// Store structure
interface AppShellState {
  // State
  mode: AppMode
  activeSession: SessionDetail | null
  sessionHistory: SessionRecord[]
  // ... more state
  
  // Actions
  setMode: (mode: AppMode) => void
  createProjectSession: () => Promise<void>
  submitPrompt: () => Promise<void>
  // ... more actions
}

// Usage in components
const { activeSession, submitPrompt } = useAppShellStore()
```

**Key State Categories:**
1. **Mode & Navigation:** `mode`, `activeShellView`, `theme`
2. **Project Context:** `activeProjectPath`, `recentProjects`
3. **Session State:** `activeSession`, `sessionHistory`, `sessionHistoryStatus`
4. **Workflow State:** `pendingProposal`, `executionRecord`, `assistantStatus`
5. **UI State:** `rightPanelOpen`, `bottomPanelExpanded`, `draftPrompt`
6. **Derived ViewModels:** `getDesktopWorkflow()`, `getChooserView()`, `getActiveSessionHeader()`

### Service Layer (Unchanged)

**Pattern:** All services wrap Tauri `invoke()` calls with TypeScript types.

**Services:**
- `projectService.ts` — `pickProjectDirectory()`, `getRecentProjects()`
- `sessionService.ts` — `createSession()`, `loadSession()`, `listSessions()`, `updateSessionActivity()`
- `assistantService.ts` — `streamAssistantResponse()`, `runApprovedCommand()`
- `attachmentService.ts` — `openFileAttachments()`, `openImageAttachments()`
- `credentialService.ts` — Credential management

**Example:**
```typescript
// Service wraps Tauri invoke
export async function createSession(input: CreateSessionInput) {
  return invoke<SessionDetail>('create_session', { input })
}

// Store action calls service
createProjectSession: async () => {
  const session = await createSession({ /* ... */ })
  set({ activeSession: session })
}

// Component calls store action
const { createProjectSession } = useAppShellStore()
await createProjectSession()
```

### Component Hierarchy (Current)

```
AppShell (layout container)
├── TopToolbar (model selector + settings)
├── LeftSidebar (projects + sessions)
├── CenterWorkspace (main content)
├── RightPanel (settings/context drawer)
└── BottomPanel (approval/output/review)
```

## New UI Architecture (v2.3)

### Component Hierarchy (Target)

```
AppShell (layout container)
├── TopToolbar (极简：窗口控制 + 导航 + 三模式标签)
├── LeftSidebar (New/Search/Customize + Projects/Sessions)
└── CenterWorkspace (单一对话流 + 增强输入框)
```

### Component Mapping: Rewrite vs Refactor

| Current Component | Action | New Component | Rationale |
|-------------------|--------|---------------|-----------|
| `AppShell.tsx` | **Refactor** | `AppShell.tsx` | Remove RightPanel/BottomPanel, simplify layout |
| `TopToolbar.tsx` | **Rewrite** | `TopToolbar.tsx` | 极简顶栏：窗口控制 + 前进后退 + Chat/Cowork/Code 标签 |
| `LeftSidebar.tsx` | **Rewrite** | `LeftSidebar.tsx` | 新结构：顶部操作 + Projects/Sessions 列表 |
| `CenterWorkspace.tsx` | **Refactor** | `CenterWorkspace.tsx` | 移除内联审批/审查卡片，纯净对话流 + 增强输入框 |
| `RightPanel.tsx` | **Delete** | — | 功能集成到 LeftSidebar Customize |
| `BottomPanel.tsx` | **Delete** | — | 审批流移除，审查面板移除 |

### State Management Changes

**appShellStore.ts 调整：**

#### Remove (不再需要的状态)
```typescript
// UI state for removed panels
rightPanelView: RightPanelView
rightPanelOpen: boolean
rightPanelWidth: number
bottomPanelExpanded: boolean
bottomPanelTab: BottomPanelTab

// Approval workflow state (审批流移除)
pendingProposal: CommandProposal | null
executionRecord: ExecutionRecord | null
selectedExecutionId: string | null
selectedReviewFileId: string | null

// Review presets (审查面板移除)
presets: ReviewPreset[]
activePresetId: string | null
```

#### Keep (保留的核心状态)
```typescript
// Mode & navigation
mode: AppMode  // 'conversation' | 'project'
theme: ThemeMode
activeShellView: ShellView

// Project & session
activeProjectPath: string | null
recentProjects: ProjectRecord[]
activeSession: SessionDetail | null
sessionHistory: SessionRecord[]

// Assistant interaction
draftPrompt: string
pendingAttachments: SessionAttachment[]
assistantStatus: AssistantStatus
assistantError: string | null
currentStageLabel: string | null

// Credentials
credentialStatus: CredentialStatusSummary
```

#### Add (新增状态)
```typescript
// Navigation history (前进后退)
navigationHistory: string[]
navigationIndex: number

// Sidebar state
sidebarCollapsed: boolean
searchQuery: string
searchResults: SessionRecord[]

// Three-mode tabs (Chat/Cowork/Code)
// Note: 可以复用现有 mode，或新增独立字段
activeMode: 'chat' | 'cowork' | 'code'
```

### Data Flow (Unchanged Pattern)

```
User Interaction
    ↓
Component Event Handler
    ↓
Store Action (useAppShellStore)
    ↓
Service Layer (projectService, sessionService, etc.)
    ↓
Tauri invoke() → Rust Backend
    ↓
Response → Service → Store State Update
    ↓
Component Re-render (Zustand subscription)
```

**Example: Creating a Session**

```typescript
// 1. User clicks "New session" in LeftSidebar
<button onClick={() => createProjectSession()}>New session</button>

// 2. Store action
createProjectSession: async () => {
  const { activeProjectPath, globalDefaultModel, recentProjects } = get()
  
  // 3. Call service
  const session = await createSession({
    projectPath: activeProjectPath,
    projectName: deriveProjectName(activeProjectPath, recentProjects),
    effectiveModelId: globalDefaultModel,
    title: `Session for ${projectName}`,
  })
  
  // 4. Update state
  set({
    activeSession: session,
    activeShellView: 'project-sessions',
  })
  
  // 5. Reload history
  await get().loadSessionHistory()
}

// 6. Component re-renders with new activeSession
```

## Integration Points

### 1. TopToolbar Integration

**Current:** Model selector + Settings button → opens RightPanel

**New:** 窗口控制 + 前进后退 + Chat/Cowork/Code 标签

**State Integration:**
```typescript
// Keep
const { theme, setTheme } = useAppShellStore()

// Add
const { 
  activeMode, 
  setActiveMode, 
  navigationHistory, 
  navigationIndex,
  goBack, 
  goForward 
} = useAppShellStore()

// Remove
// setRightPanelView, setRightPanelOpen (no longer needed)
```

**Tauri Integration:**
```typescript
// Window controls (new)
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()
await appWindow.minimize()
await appWindow.toggleMaximize()
await appWindow.close()
```

**New Actions to Add:**
```typescript
// In appShellStore
goBack: () => {
  const { navigationHistory, navigationIndex } = get()
  if (navigationIndex > 0) {
    const newIndex = navigationIndex - 1
    const targetView = navigationHistory[newIndex]
    set({ navigationIndex: newIndex, activeShellView: targetView })
  }
},

goForward: () => {
  const { navigationHistory, navigationIndex } = get()
  if (navigationIndex < navigationHistory.length - 1) {
    const newIndex = navigationIndex + 1
    const targetView = navigationHistory[newIndex]
    set({ navigationIndex: newIndex, activeShellView: targetView })
  }
},

pushNavigation: (view: ShellView) => {
  const { navigationHistory, navigationIndex } = get()
  const newHistory = navigationHistory.slice(0, navigationIndex + 1)
  newHistory.push(view)
  set({ 
    navigationHistory: newHistory, 
    navigationIndex: newHistory.length - 1,
    activeShellView: view
  })
}
```

### 2. LeftSidebar Integration

**Current:** Projects + Sessions 列表

**New:** 顶部操作 (New/Search/Customize) + Projects/Sessions 列表

**State Integration:**
```typescript
// Keep
const {
  activeProjectPath,
  recentProjects,
  sessionHistory,
  activeSession,
  resumeSession,
  setActiveProject,
} = useAppShellStore()

// Add
const {
  sidebarCollapsed,
  setSidebarCollapsed,
  searchQuery,
  setSearchQuery,
  searchResults,
  openCustomizeMenu,
} = useAppShellStore()

// Remove
// No changes to service calls
```

**Service Integration:**
```typescript
// Project picker (unchanged)
import { pickProjectDirectory } from '../services/projectService'

const handleProjectPick = async () => {
  const project = await pickProjectDirectory()
  if (project) {
    setActiveProject(project)
  }
}

// Session resume (unchanged)
const handleSessionResume = async (sessionId: string) => {
  await resumeSession(sessionId)
}
```

**New: Customize Menu**
- Theme toggle (集成现有 `theme` state)
- Keybindings toggle (集成现有 `keybindingsEnabled` state)
- Model selector (移动自 TopToolbar)

**New Actions to Add:**
```typescript
// In appShellStore
setSearchQuery: (query: string) => {
  set({ searchQuery: query })
  // Trigger search
  const { sessionHistory } = get()
  const results = sessionHistory.filter(session => 
    session.title.toLowerCase().includes(query.toLowerCase()) ||
    session.projectName.toLowerCase().includes(query.toLowerCase())
  )
  set({ searchResults: results })
},

setSidebarCollapsed: (collapsed: boolean) => {
  set({ sidebarCollapsed: collapsed })
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebarCollapsed', String(collapsed))
  }
}
```

### 3. CenterWorkspace Integration

**Current:** 对话流 + 内联审批卡片 + 内联审查卡片 + 输入框

**New:** 纯净对话流 + 增强输入框 (附件/Auto accept/模型/语音)

**State Integration:**
```typescript
// Keep (core conversation state)
const {
  activeSession,
  assistantStatus,
  currentStageLabel,
  draftPrompt,
  pendingAttachments,
  setDraftPrompt,
  addFileAttachments,
  addImageAttachments,
  removePendingAttachment,
  submitPrompt,
} = useAppShellStore()

// Add (enhanced composer)
const {
  autoAcceptEnabled,
  setAutoAcceptEnabled,
  voiceInputActive,
  startVoiceInput,
  stopVoiceInput,
} = useAppShellStore()

// Remove (approval/review workflow)
// pendingProposal, executionRecord, approvePendingCommand, rejectPendingCommand
// InlineApprovalSummary, InlineWorkflowStatusSummary, InlineReviewSummary
```

**Component Changes:**
```typescript
// Remove these components
- InlineApprovalSummary
- InlineWorkflowStatusSummary
- InlineReviewSummary

// Keep these components
- Transcript (对话流)
- Composer (输入框)
- SessionHeader (会话头部)

// Enhance Composer
+ Auto accept toggle
+ Model selector (per-session override)
+ Voice input button
```

**Service Integration (Unchanged):**
```typescript
// Prompt submission
import { streamAssistantResponse } from '../services/assistantService'

submitPrompt: async () => {
  const state = get()
  await streamAssistantResponse(
    { 
      mode: state.mode, 
      prompt: state.draftPrompt, 
      modelId: state.activeSession?.effectiveModelId,
      projectPath: state.activeProjectPath,
      attachments: state.pendingAttachments,
    },
    {
      onStage: async (stageLabel, body) => { 
        // Update transcript with stage event
        const session = get().activeSession
        if (!session) return
        
        const transcript = [
          ...session.transcript,
          createEvent({ kind: 'stage-status', body, stageLabel })
        ]
        set({ 
          activeSession: { ...session, transcript },
          currentStageLabel: stageLabel
        })
      },
      onAssistantChunk: async (chunk) => { 
        // Append to last assistant message
        const session = get().activeSession
        if (!session) return
        
        const transcript = session.transcript.map((event, idx) => {
          if (idx === session.transcript.length - 1 && event.kind === 'assistant-message') {
            return { ...event, body: event.body + chunk }
          }
          return event
        })
        set({ activeSession: { ...session, transcript } })
      },
      onComplete: async () => { 
        // Finalize session
        const session = get().activeSession
        if (!session) return
        
        await persistSession(session)
        set({ 
          assistantStatus: 'idle',
          currentStageLabel: null
        })
      },
    }
  )
}
```

**New Actions for Enhanced Composer:**
```typescript
// In appShellStore
autoAcceptEnabled: false,
voiceInputActive: false,

setAutoAcceptEnabled: (enabled: boolean) => {
  set({ autoAcceptEnabled: enabled })
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('autoAcceptEnabled', String(enabled))
  }
},

startVoiceInput: async () => {
  set({ voiceInputActive: true })
  // TODO: Integrate with Web Speech API or Tauri voice plugin
},

stopVoiceInput: () => {
  set({ voiceInputActive: false })
}
```

### 4. Empty State Integration

**Current:** 大段文字 + 多个操作按钮

**New:** 大熊猫吉祥物 + 简洁提示

**State Integration:**
```typescript
// Detect empty state
const { activeSession, sessionHistory } = useAppShellStore()
const isEmpty = !activeSession && sessionHistory.length === 0

// Render
{isEmpty && (
  <div className="empty-state">
    <img src="/panda-mascot.svg" alt="Claude mascot" />
    <h2>Start a conversation</h2>
    <p>Send a message to begin</p>
  </div>
)}
```

**No new state needed** — empty state is derived from existing `activeSession` and `sessionHistory`.

## Build Order (Recommended)

### Phase 1: State Preparation (1-2 days)
1. **Audit appShellStore** — 标记要移除的状态
2. **Add new state** — `navigationHistory`, `sidebarCollapsed`, `searchQuery`, `autoAcceptEnabled`, `voiceInputActive`
3. **Add new actions** — `goBack`, `goForward`, `pushNavigation`, `setSearchQuery`, `setSidebarCollapsed`, `setAutoAcceptEnabled`, `startVoiceInput`, `stopVoiceInput`
4. **Remove approval/review state** — Comment out (不删除) `pendingProposal`, `executionRecord`, presets 相关代码
5. **Update derived ViewModels** — `getDesktopWorkflow()` 不再返回 tray/approval 数据

### Phase 2: Layout Refactor (1 day)
1. **AppShell.tsx** — 移除 RightPanel/BottomPanel 引用，简化布局
2. **Rename/Archive components** — 将 `RightPanel.tsx`, `BottomPanel.tsx` 移动到 `_archived/` 文件夹
3. **Update CSS** — 移除 `.app-shell__drawer`, `.app-shell__bottom` 样式

### Phase 3: TopToolbar Rewrite (2-3 days)
1. **Window controls** — 集成 Tauri window API (minimize, maximize, close)
2. **Navigation buttons** — 前进后退逻辑 (goBack, goForward)
3. **Three-mode tabs** — Chat/Cowork/Code 切换 UI
4. **Remove model selector** — 移动到 LeftSidebar Customize
5. **Visual polish** — 对齐官方设计 (间距、字体、颜色)

### Phase 4: LeftSidebar Rewrite (3-4 days)
1. **Top actions** — New session, Search, Customize 按钮
2. **Search functionality** — 实现搜索逻辑和 UI
3. **Customize menu** — 集成 theme, keybindings, model selector
4. **Projects list** — 保留现有逻辑，调整样式
5. **Sessions list** — 保留现有逻辑，调整样式
6. **Visual polish** — 对齐官方设计

### Phase 5: CenterWorkspace Refactor (2-3 days)
1. **Remove inline cards** — 删除 InlineApprovalSummary, InlineWorkflowStatusSummary, InlineReviewSummary
2. **Simplify Transcript** — 纯净对话流，移除审批/审查事件渲染
3. **Enhance Composer** — 添加 Auto accept toggle, Model selector, Voice input button
4. **Empty state** — 添加大熊猫吉祥物 SVG 和简洁文案
5. **Visual polish** — 对齐官方设计

### Phase 6: Visual Polish (2-3 days)
1. **Theme alignment** — 浅色主题优先，线性图标，圆角卡片
2. **Typography** — 字体大小、行高、间距对齐官方
3. **Colors** — 柔和分隔线，accent colors
4. **Animations** — 平滑过渡，微交互
5. **Responsive** — 确保不同窗口尺寸下的表现

**Total Estimated Time: 11-16 days**

## Tauri Backend (No Changes Required)

**Rust commands remain unchanged:**
- `select_project_directory`
- `list_recent_projects`
- `create_session`
- `load_session`
- `list_sessions`
- `update_session_activity`
- `save_recovery_snapshot`
- `load_recovery_snapshot`

**Why no backend changes:**
- UI 重构不改变数据模型
- 服务层 API 保持稳定
- Tauri invoke 调用签名不变
- 审批流移除是 UI 层决策，后端仍支持命令执行

## Testing Strategy

### Unit Tests (Component Level)
```typescript
// Test store actions
describe('appShellStore', () => {
  it('should create project session', async () => {
    const { createProjectSession, activeSession } = useAppShellStore.getState()
    await createProjectSession()
    expect(activeSession).toBeDefined()
  })
  
  it('should navigate back', () => {
    const { pushNavigation, goBack, navigationIndex } = useAppShellStore.getState()
    pushNavigation('project-home')
    pushNavigation('project-sessions')
    goBack()
    expect(navigationIndex).toBe(0)
  })
  
  it('should search sessions', () => {
    const { setSearchQuery, searchResults } = useAppShellStore.getState()
    setSearchQuery('test')
    expect(searchResults.length).toBeGreaterThan(0)
  })
})

// Test component rendering
describe('LeftSidebar', () => {
  it('should render projects list', () => {
    render(<LeftSidebar />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
  
  it('should render search input', () => {
    render(<LeftSidebar />)
    expect(screen.getByPlaceholderText('Search sessions')).toBeInTheDocument()
  })
})
```

### Integration Tests (E2E with Playwright)
```typescript
// Existing E2E tests need updates
test('should create new session', async ({ page }) => {
  // Click "New session" in LeftSidebar (new location)
  await page.click('[data-testid="new-session-button"]')
  
  // Verify session created
  await expect(page.locator('.conversation-transcript')).toBeVisible()
})

test('should navigate back and forward', async ({ page }) => {
  await page.click('[data-testid="project-home"]')
  await page.click('[data-testid="project-sessions"]')
  await page.click('[data-testid="nav-back"]')
  
  // Verify navigation
  await expect(page.locator('[data-testid="project-home"]')).toBeVisible()
})

test('should search sessions', async ({ page }) => {
  await page.fill('[data-testid="search-input"]', 'test')
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
})
```

### Visual Regression Tests
```typescript
// Capture screenshots for visual comparison
test('TopToolbar matches official design', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.toolbar')).toHaveScreenshot('toolbar.png')
})

test('LeftSidebar matches official design', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.sidebar')).toHaveScreenshot('sidebar.png')
})

test('Empty state matches official design', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.empty-state')).toHaveScreenshot('empty-state.png')
})
```

## Migration Risks & Mitigations

### Risk 1: State Management Complexity
**Risk:** 移除大量状态可能破坏现有功能
**Mitigation:** 
- 分阶段移除，每次移除后运行 E2E 测试
- 先 comment out 而非直接删除，验证无影响后再删除
- 保留 git 分支，随时回滚
- 使用 TypeScript 类型检查捕获引用错误

### Risk 2: Component Coupling
**Risk:** 组件间依赖可能导致重构困难
**Mitigation:**
- 先重构 AppShell 布局，再重写子组件
- 使用 feature flags 控制新旧 UI 切换
- 保留旧组件文件在 `_archived/` 直到新组件验证完成
- 逐个组件迁移，每个组件完成后验证功能

### Risk 3: Service Layer Breaking Changes
**Risk:** 误改服务层 API 导致 Tauri 调用失败
**Mitigation:**
- **不修改服务层** — 只修改 UI 组件和 store
- 运行现有 E2E 测试验证服务调用
- 使用 TypeScript 确保类型安全
- Code review 重点检查服务层调用

### Risk 4: Visual Inconsistency
**Risk:** 新 UI 与官方设计不一致
**Mitigation:**
- 使用官方 v2.1.88 源码作为参考
- 截图对比工具验证视觉一致性
- 设计 review 阶段确认对齐
- 使用 Storybook 隔离组件开发

### Risk 5: Performance Regression
**Risk:** 新 UI 渲染性能下降
**Mitigation:**
- 使用 React DevTools Profiler 监控渲染性能
- 使用 selector 优化 Zustand 订阅
- 虚拟化长列表 (sessions, projects)
- Memoize 昂贵的计算和组件

## Performance Considerations

### Zustand Store Optimization
```typescript
// Use selectors to prevent unnecessary re-renders
const activeSession = useAppShellStore((state) => state.activeSession)

// Instead of
const { activeSession, /* ... 50 other fields */ } = useAppShellStore()
```

### Component Memoization
```typescript
// Memoize expensive components
const SessionRow = React.memo(({ session }) => {
  // ...
})

// Memoize derived data
const sortedSessions = useMemo(() => {
  return sessionHistory.sort((a, b) => 
    Number(b.lastActivityAt) - Number(a.lastActivityAt)
  )
}, [sessionHistory])
```

### Lazy Loading
```typescript
// Lazy load heavy components
const Customize = React.lazy(() => import('./Customize'))

// Render with Suspense
<Suspense fallback={<Spinner />}>
  <Customize />
</Suspense>
```

### Virtual Scrolling
```typescript
// For long session lists
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={sessionHistory.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <SessionRow 
      key={sessionHistory[index].id}
      session={sessionHistory[index]} 
      style={style}
    />
  )}
</FixedSizeList>
```

## Accessibility (WCAG Compliance)

### Keyboard Navigation
```typescript
// Ensure all interactive elements are keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="New session"
  tabIndex={0}
>
  New session
</button>
```

### Screen Reader Support
```typescript
// Use semantic HTML and ARIA labels
<nav aria-label="Projects">
  <ul role="list">
    {projects.map(project => (
      <li key={project.id} role="listitem">
        <button aria-label={`Open ${project.name}`}>
          {project.name}
        </button>
      </li>
    ))}
  </ul>
</nav>
```

### Focus Management
```typescript
// Manage focus after navigation
useEffect(() => {
  if (activeSession) {
    document.getElementById('prompt-input')?.focus()
  }
}, [activeSession])
```

### Color Contrast
```css
/* Ensure WCAG AA compliance (4.5:1 for normal text) */
.button-primary {
  background: #0066cc; /* Contrast ratio: 4.52:1 on white */
  color: #ffffff;
}

.text-secondary {
  color: #666666; /* Contrast ratio: 5.74:1 on white */
}
```

## Summary

新 UI 完全复刻官方体验，但保留现有架构优势：

**保留 (Preserve):**
- Zustand 状态管理模式
- Tauri 服务层 API
- React 组件数据流
- E2E 测试框架
- 核心业务逻辑

**重构 (Refactor):**
- AppShell 布局结构
- CenterWorkspace 对话流
- State 结构调整

**重写 (Rewrite):**
- TopToolbar 极简顶栏
- LeftSidebar 新结构

**移除 (Remove):**
- RightPanel 右侧抽屉
- BottomPanel 底部托盘
- 审批流 UI
- 审查面板 UI

**集成策略：**
1. UI 层完全重构，服务层零改动
2. 状态管理保留模式，调整结构
3. 数据流不变：UI → store → service → Tauri
4. 分阶段构建，每阶段验证功能完整性

**构建顺序：**
State Preparation (1-2d) → Layout Refactor (1d) → TopToolbar (2-3d) → LeftSidebar (3-4d) → CenterWorkspace (2-3d) → Visual Polish (2-3d)

**Total: 11-16 days**

**风险控制：**
- 分支开发，随时回滚
- TypeScript 类型检查
- E2E 测试覆盖
- 视觉回归测试
- 逐步迁移，不破坏现有功能

这种集成方式最大化复用现有架构，最小化风险，确保新 UI 快速交付且质量可控。
