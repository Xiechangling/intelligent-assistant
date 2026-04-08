# Architecture Patterns

**Domain:** 官方 Claude Code Desktop 体验对齐
**Researched:** 2026-04-08

## Recommended Architecture

官方 Claude Code Desktop 采用 **单一全局状态 + Context Provider + useSyncExternalStore** 的架构模式，与当前 Zustand 实现在理念上相似，但在具体实现细节上有差异。

### 核心架构对比

| 层面 | 官方架构 | 当前架构 | 差异程度 |
|------|---------|---------|---------|
| 状态管理 | 自定义 Store + useSyncExternalStore | Zustand | 低 - 理念相同 |
| 组件组织 | 扁平化 + Context 注入 | 扁平化 + 直接导入 | 低 |
| 数据流 | 单向数据流 (setState → listeners) | 单向数据流 (set → subscribers) | 无 |
| 路由模式 | 无路由 - 单页面条件渲染 | 无路由 - 单页面条件渲染 | 无 |
| 服务层 | Tauri invoke + 全局状态 | Tauri invoke + Zustand | 低 |

### Component Boundaries

官方架构的组件边界：

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `App.tsx` | 顶层 Provider 容器 (FpsMetrics, Stats, AppState) | AppStateProvider |
| `AppStateProvider` | 全局状态注入 + 设置监听 | createStore, MailboxProvider, VoiceProvider |
| `FullscreenLayout` | 布局容器 (scrollable + bottom + overlay + modal) | ScrollBox, Messages, PromptInput |
| `Messages` | 消息列表渲染 | AppState (via useAppState) |
| `PromptInput` | 用户输入 + 附件管理 | AppState (via useSetAppState) |
| Native Services | Tauri 后端服务 (project/credential/session) | Frontend via invoke |

当前架构的组件边界：

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `App.tsx` | Tauri 应用入口 | Sidebar, TopToolbar, Workspace, LifecycleTray |
| `Sidebar` | 左侧导航 (项目/会话选择) | appShellStore (useAppShellStore) |
| `TopToolbar` | 顶栏控制 (项目/模型/状态) | appShellStore (useAppShellStore) |
| `Workspace` | 中央工作区 (对话/输出) | appShellStore (useAppShellStore) |
| `LifecycleTray` | 底部托盘 (审批/输出/审查) | appShellStore (useAppShellStore) |
| Native Services | Tauri 后端服务 | Frontend via invoke |

### Data Flow

**官方数据流：**

```
User Action → Component (useSetAppState)
           ↓
       setState(updater)
           ↓
    onChange callback (optional)
           ↓
    Notify all listeners
           ↓
Components re-render (useSyncExternalStore)
```

**当前数据流：**

```
User Action → Component (useAppShellStore)
           ↓
       set(updater) / direct methods
           ↓
    Zustand internal notify
           ↓
Components re-render (Zustand subscription)
```

**关键差异：** 官方使用 `useSyncExternalStore` (React 18 标准 API)，当前使用 Zustand 内置订阅机制。两者在功能上等价，但官方更接近 React 原生模式。

## 状态管理对比分析

### 官方状态管理 (AppState + createStore)

**核心实现：**

```typescript
// src/state/store.ts
export function createStore<T>(
  initialState: T,
  onChange?: OnChange<T>,
): Store<T> {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,
    setState: (updater: (prev: T) => T) => {
      const prev = state
      const next = updater(prev)
      if (Object.is(next, prev)) return
      state = next
      onChange?.({ newState: next, oldState: prev })
      for (const listener of listeners) listener()
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
```

**使用模式：**

```typescript
// 组件中使用
const verbose = useAppState(s => s.verbose)
const model = useAppState(s => s.mainLoopModel)
const setAppState = useSetAppState()

// 更新状态
setAppState(prev => ({ ...prev, verbose: true }))
```

**特点：**
- 轻量级自定义实现 (~35 行代码)
- 使用 `useSyncExternalStore` 订阅
- 支持 `onChange` 回调用于副作用
- 严格的 selector 模式 (必须返回子属性，不能返回整个 state)
- Context Provider 注入，避免全局单例

### 当前状态管理 (Zustand)

**核心实现：**

```typescript
// src/app/state/appShellStore.ts
export const useAppShellStore = create<AppShellState>((set, get) => ({
  mode: 'conversation',
  activeProjectPath: null,
  // ... 50+ 个状态字段
  
  setMode: (mode) => set({ mode }),
  setActiveProject: (project) => set((state) => ({
    activeProjectPath: project?.path,
    // ... 复杂的派生逻辑
  })),
  submitPrompt: async () => {
    const state = get()
    // ... 复杂的异步逻辑
  },
  // ... 30+ 个方法
}))
```

**使用模式：**

```typescript
// 组件中使用
const { mode, activeProjectPath, setMode } = useAppShellStore()

// 或选择性订阅
const mode = useAppShellStore(state => state.mode)
```

**特点：**
- 成熟的第三方库 (Zustand)
- 内置订阅机制
- 支持方法和状态混合定义
- 全局单例模式
- 更灵活的 API (可以直接解构)

### 架构差异总结

| 维度 | 官方 | 当前 | 影响 |
|------|------|------|------|
| **实现方式** | 自定义 Store | Zustand | 低 - 功能等价 |
| **订阅机制** | useSyncExternalStore | Zustand 内置 | 低 - 都是 React 18+ 兼容 |
| **状态结构** | 扁平化大对象 (~100+ 字段) | 扁平化大对象 (~50+ 字段) | 无 |
| **方法定义** | 外部定义 (services) | 内联定义 (store 内) | 中 - 组织方式不同 |
| **Context 注入** | 是 (AppStateProvider) | 否 (全局单例) | 低 - 单用户场景无影响 |
| **onChange 钩子** | 内置支持 | 需要 middleware | 低 - 当前未使用 |

## 是否需要架构层面的重构？

### 结论：**不需要大规模重构**

**理由：**

1. **状态管理理念一致**
   - 官方和当前都采用单一全局状态 + 订阅模式
   - Zustand 本质上是 `createStore` 的增强版，核心机制相同
   - 两者都支持 selector 优化和细粒度订阅

2. **组件组织模式相似**
   - 都是扁平化组件结构，无深层嵌套
   - 都通过状态管理库连接组件，而非 props drilling
   - 都采用单页面条件渲染，无路由层

3. **数据流模式相同**
   - 单向数据流：Action → State Update → Re-render
   - 异步操作都在 action 层处理
   - 都支持派生状态和计算属性

4. **Zustand 的优势**
   - 更成熟的生态和社区支持
   - 内置 devtools、persist、immer 等 middleware
   - 更好的 TypeScript 支持
   - 更灵活的 API (支持直接解构)

### 需要调整的细节

虽然不需要重构状态管理，但以下细节需要调整以对齐官方体验：

#### 1. 组件层级调整

**官方模式：**
```
App (Providers)
└── FullscreenLayout
    ├── ScrollBox (scrollable: Messages)
    ├── PromptInput (bottom)
    ├── PermissionRequest (overlay)
    └── Modal (slash commands)
```

**当前模式：**
```
App
├── Sidebar (左侧)
├── TopToolbar (顶部)
├── Workspace (中央)
└── LifecycleTray (底部)
```

**调整方向：** 将当前的四分区布局改为官方的 `FullscreenLayout` 单流式布局。

#### 2. 状态字段对齐

官方 AppState 的关键字段：

```typescript
type AppState = {
  // 核心状态
  mainLoopModel: ModelSetting
  verbose: boolean
  statusLineText: string | undefined
  
  // 视图状态
  expandedView: 'none' | 'tasks' | 'teammates'
  viewSelectionMode: 'none' | 'selecting-agent' | 'viewing-agent'
  footerSelection: FooterItem | null
  
  // 权限上下文
  toolPermissionContext: ToolPermissionContext
  
  // 任务和团队
  tasks: { [taskId: string]: TaskState }
  foregroundedTaskId?: string
  viewingAgentTaskId?: string
  
  // 插件和 MCP
  mcp: { clients, tools, commands, resources }
  plugins: { enabled, disabled, commands, errors }
  
  // 提示建议
  promptSuggestion: { text, promptId, shownAt, acceptedAt }
  speculation: SpeculationState
}
```

当前 appShellStore 的关键字段：

```typescript
type AppShellState = {
  // 模式和项目
  mode: AppMode
  activeProjectPath: string | null
  activeSession: SessionDetail | null
  
  // 模型和会话
  globalDefaultModel: ModelId
  activeSessionModelOverride: ModelId | null
  
  // UI 状态
  rightPanelOpen: boolean
  bottomPanelExpanded: boolean
  
  // 工作流状态
  pendingProposal: CommandProposal | null
  executionRecord: ExecutionRecord | null
  
  // 方法 (30+ 个)
  setMode, setActiveProject, submitPrompt, ...
}
```

**差异：**
- 官方更关注 **任务/团队/插件** 的状态管理
- 当前更关注 **会话/执行/审查** 的工作流状态
- 官方将方法定义在外部 services，当前内联在 store

**调整方向：** 保持当前字段结构，但调整 UI 层的渲染逻辑以匹配官方体验。

#### 3. 布局组件重构

**需要新增的组件：**

| 组件 | 职责 | 参考官方 |
|------|------|---------|
| `FullscreenLayout` | 单流式布局容器 | `src/components/FullscreenLayout.tsx` |
| `ScrollBox` | 虚拟滚动容器 | `src/ink/components/ScrollBox.tsx` |
| `VirtualMessageList` | 消息虚拟化渲染 | `src/components/VirtualMessageList.tsx` |
| `PromptInputFooter` | 底部输入区 (pills + suggestions) | `src/components/PromptInput/PromptInputFooter.tsx` |

**需要调整的组件：**

| 当前组件 | 调整方向 |
|---------|---------|
| `Sidebar` | 改为轻量级会话选择器 (Cmd+K 弹窗) |
| `TopToolbar` | 简化为内容中心的轻量 chrome |
| `Workspace` | 改为单流式消息列表 + 输入框 |
| `LifecycleTray` | 收敛为底部 pills (approval/review) |

## 迁移路径建议

### Phase 1: 保持 Zustand，调整组件结构

**目标：** 在不改变状态管理的前提下，重构 UI 层以匹配官方布局。

**步骤：**
1. 创建 `FullscreenLayout` 组件，接收 `scrollable` 和 `bottom` props
2. 将 `Workspace` 改为消息列表 + ScrollBox
3. 将 `LifecycleTray` 改为 `PromptInputFooter` (pills 模式)
4. 将 `Sidebar` 改为 Cmd+K 触发的会话选择器
5. 简化 `TopToolbar` 为轻量 chrome

**优势：**
- 风险低，状态管理不变
- 可以逐步迁移，不影响现有功能
- 保留 Zustand 的 devtools 和 middleware

### Phase 2: (可选) 迁移到自定义 Store

**目标：** 完全对齐官方架构，使用 `createStore` + `useSyncExternalStore`。

**步骤：**
1. 实现 `createStore` (参考官方 `src/state/store.ts`)
2. 创建 `AppStateProvider` 包装器
3. 将 `useAppShellStore` 改为 `useAppState` + `useSetAppState`
4. 迁移状态字段和方法

**优势：**
- 完全对齐官方架构
- 减少依赖 (移除 Zustand)
- 更接近 React 原生模式

**劣势：**
- 迁移成本高
- 失去 Zustand 的 devtools 和 middleware
- 需要重新实现持久化等功能

### 推荐方案：**Phase 1 Only**

**理由：**
1. **Zustand 和官方 Store 在功能上等价**，迁移收益低
2. **UI 层调整是体验对齐的关键**，状态管理不是瓶颈
3. **保持 Zustand 可以利用其生态**，降低维护成本
4. **单用户场景下 Context 注入无实际优势**

## Patterns to Follow

### Pattern 1: Selector-Based Subscription

**What:** 使用 selector 函数订阅状态切片，避免不必要的重渲染。

**When:** 组件只需要部分状态时。

**Example (官方模式):**
```typescript
// 只订阅 verbose 字段
const verbose = useAppState(s => s.verbose)

// 订阅多个独立字段
const verbose = useAppState(s => s.verbose)
const model = useAppState(s => s.mainLoopModel)
```

**Example (当前模式 - 保持):**
```typescript
// Zustand 支持相同模式
const verbose = useAppShellStore(s => s.verbose)
const model = useAppShellStore(s => s.globalDefaultModel)
```

### Pattern 2: Stable Setter Reference

**What:** 使用稳定的 setter 引用，避免 useEffect 依赖变化。

**When:** 组件只需要更新状态，不需要读取状态时。

**Example (官方模式):**
```typescript
const setAppState = useSetAppState() // 稳定引用

useEffect(() => {
  setAppState(prev => ({ ...prev, verbose: true }))
}, [setAppState]) // 依赖永远不变
```

**Example (当前模式 - 保持):**
```typescript
const setMode = useAppShellStore(s => s.setMode) // 稳定引用

useEffect(() => {
  setMode('project')
}, [setMode]) // 依赖永远不变
```

### Pattern 3: Derived State in Selectors

**What:** 在 selector 中计算派生状态，而非存储在 state 中。

**When:** 状态可以从其他字段计算得出时。

**Example (官方模式):**
```typescript
// 官方在 store 外定义 getter 函数
function getDesktopWorkflow(state: AppState): DesktopWorkflowViewModel {
  return {
    startupState: deriveStartupState(state),
    desktopStatus: deriveDesktopStatus(state),
    trayMode: deriveTrayMode(state),
  }
}

// 组件中使用
const workflow = useAppState(getDesktopWorkflow)
```

**Example (当前模式 - 保持):**
```typescript
// 当前在 store 内定义 getter 方法
export const useAppShellStore = create<AppShellState>((set, get) => ({
  // ... state fields
  
  getDesktopWorkflow: () => buildDesktopWorkflow(get()),
  getDesktopStatus: () => deriveDesktopStatus(get()),
}))

// 组件中使用
const workflow = useAppShellStore(s => s.getDesktopWorkflow())
```

**差异：** 官方将 getter 定义在外部，当前定义在 store 内。两者功能相同，当前模式更紧凑。

### Pattern 4: Single-Flow Layout

**What:** 使用单流式布局，消息和输入在同一垂直流中。

**When:** 构建对话式 UI 时。

**Example (官方模式):**
```typescript
<FullscreenLayout
  scrollable={<Messages />}
  bottom={<PromptInput />}
  overlay={<PermissionRequest />}
  modal={<SlashCommandDialog />}
/>
```

**当前需要调整：** 将四分区布局改为单流式。

## Anti-Patterns to Avoid

### Anti-Pattern 1: Props Drilling

**What:** 通过多层组件传递 props。

**Why bad:** 增加组件耦合，难以维护。

**Instead:** 使用状态管理库直接订阅。

```typescript
// ❌ Bad
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>

// ✅ Good
<Parent>
  <Child>
    <GrandChild /> {/* 内部使用 useAppShellStore */}
  </Child>
</Parent>
```

### Anti-Pattern 2: 在 Selector 中返回新对象

**What:** 每次渲染都创建新对象。

**Why bad:** 导致不必要的重渲染 (Object.is 总是返回 false)。

**Instead:** 返回已存在的对象引用。

```typescript
// ❌ Bad
const data = useAppState(s => ({ 
  mode: s.mode, 
  path: s.activeProjectPath 
}))

// ✅ Good
const mode = useAppState(s => s.mode)
const path = useAppState(s => s.activeProjectPath)

// ✅ Also Good (如果 state 中已有这个对象)
const session = useAppState(s => s.activeSession)
```

### Anti-Pattern 3: 全局状态存储 UI 临时状态

**What:** 将组件内部的 UI 状态 (如 hover, focus) 存储在全局 state。

**Why bad:** 污染全局状态，增加复杂度。

**Instead:** 使用 useState 管理组件内部状态。

```typescript
// ❌ Bad
const isHovered = useAppState(s => s.sidebarHovered)
const setAppState = useSetAppState()
<div onMouseEnter={() => setAppState(prev => ({ ...prev, sidebarHovered: true }))}>

// ✅ Good
const [isHovered, setIsHovered] = useState(false)
<div onMouseEnter={() => setIsHovered(true)}>
```

### Anti-Pattern 4: 多个独立的 Store

**What:** 为不同功能创建多个独立的 store。

**Why bad:** 增加状态同步复杂度，难以追踪数据流。

**Instead:** 使用单一 store，通过命名空间组织。

```typescript
// ❌ Bad
const useProjectStore = create(...)
const useSessionStore = create(...)
const useUIStore = create(...)

// ✅ Good
const useAppShellStore = create({
  // Project namespace
  activeProjectPath: null,
  recentProjects: [],
  
  // Session namespace
  activeSession: null,
  sessionHistory: [],
  
  // UI namespace
  rightPanelOpen: false,
  bottomPanelExpanded: false,
})
```

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **状态管理性能** | 无影响 (单用户) | 无影响 (单用户) | 无影响 (单用户) |
| **组件渲染性能** | Selector 优化足够 | 需要虚拟化列表 | 需要虚拟化 + 懒加载 |
| **会话历史存储** | 本地文件足够 | 需要分页加载 | 需要数据库 + 索引 |
| **实时同步** | 不需要 | 不需要 | 不需要 (本地优先) |

**注：** 当前产品定位是单用户桌面应用，扩展性考虑主要在于单个用户的长期使用 (大量会话历史)，而非多用户并发。

## Sources

- 官方源码分析：`claude-code-source-code-v2.1.88/src/state/`
- 官方组件分析：`claude-code-source-code-v2.1.88/src/components/`
- 当前实现：`src/app/state/appShellStore.ts`
- React 18 文档：useSyncExternalStore API
- Zustand 文档：https://github.com/pmndrs/zustand
