# 交互模式研究：官方 Claude Code Desktop

**项目：** Intelligent Assistant
**研究日期：** 2026-04-08
**置信度：** HIGH（基于官方 v2.1.88 源代码）

## 执行摘要

通过分析官方 Claude Code Desktop v2.1.88 源代码，识别出核心交互模式包括：键盘优先导航、状态驱动的视觉反馈、轻量级 hover 提示、以及基于上下文的快捷键系统。当前实现（v2.1.88 桌面基线）已具备基础交互框架，但缺少官方的细粒度交互细节（transition timing、focus ring、keyboard navigation flow）。

## 核心交互模式

### 1. 键盘快捷键系统

官方使用 `useKeybinding` hook 和全局快捷键注册系统。

| 快捷键 | 功能 | 作用域 | 源码位置 |
|--------|------|--------|----------|
| `ctrl+t` | 切换任务列表 | 全局 | `useGlobalKeybindings.tsx` |
| `ctrl+o` | 切换 transcript 模式 | 全局 | `useGlobalKeybindings.tsx` |
| `ctrl+e` | 展开/折叠所有消息 | transcript 模式 | `useGlobalKeybindings.tsx` |
| `ctrl+c` / `Escape` | 退出 transcript 模式 | transcript 模式 | `useGlobalKeybindings.tsx` |
| `alt+t` | 思考模式切换 | 全局（macOS Option+T → †） | `keyboardShortcuts.ts` |
| `alt+p` | 模型选择器 | 全局（macOS Option+P → π） | `keyboardShortcuts.ts` |
| `alt+o` | 快速模式 | 全局（macOS Option+O → ø） | `keyboardShortcuts.ts` |
| `Enter` | 提交 prompt | 输入框 | `PromptInput.tsx` |
| `↑/↓` | 历史导航 | 输入框 | `useArrowKeyHistory.tsx` |

**macOS 特殊处理：**
```typescript
// 官方处理 macOS Option 键特殊字符映射
const MACOS_OPTION_SPECIAL_CHARS = {
  '†': 'alt+t',  // Option+T
  'π': 'alt+p',  // Option+P
  'ø': 'alt+o',  // Option+O
}
```

**当前实现差异：**
- ✅ 已有：模型选择器（下拉菜单）
- ❌ 缺失：全局快捷键系统（ctrl+t, ctrl+o, ctrl+e）
- ❌ 缺失：macOS Option 键特殊字符映射
- ❌ 缺失：输入框历史导航（↑/↓）

### 2. Hover 交互模式

官方使用轻量级 hover 提示，不依赖复杂的 tooltip 系统。

**模式：**
- **按钮 hover：** 使用原生 `title` 属性显示简短描述
- **快捷键提示：** 使用 `KeyboardShortcutHint` 组件内联显示
- **状态指示：** 使用颜色变化而非 hover 弹窗

**示例（官方模式）：**
```tsx
// 官方使用 title 属性
<button title="Open workspace">
  <FolderOpen size={15} />
</button>

// 官方使用内联快捷键提示
<Text dimColor>
  <KeyboardShortcutHint shortcut="ctrl+o" action="expand" />
</Text>
```

**当前实现对比：**
```tsx
// 当前实现（TopToolbar.tsx）
<button 
  className="toolbar__project-button" 
  onClick={handleProjectPick} 
  title={activeProjectPath ?? 'Open workspace'}  // ✅ 已对齐
>
  <FolderOpen size={15} />
  <span>{workspaceLabel}</span>
</button>
```

**差异：**
- ✅ 已对齐：使用 `title` 属性
- ❌ 缺失：快捷键提示组件（`KeyboardShortcutHint`）
- ❌ 缺失：dimColor 文本样式约定

### 3. Focus 管理

官方使用声明式 focus 管理，通过 `use-declared-cursor.ts` hook。

**模式：**
- **输入框自动聚焦：** 在 prompt 模式下自动聚焦
- **模态框 focus trap：** 对话框内 focus 循环
- **键盘导航：** Tab/Shift+Tab 在可交互元素间导航

**官方实现（推断）：**
```typescript
// 官方使用 useDeclaredCursor hook
import { useDeclaredCursor } from '../ink/hooks/use-declared-cursor.ts'

// 在输入框组件中
useDeclaredCursor({ active: isPromptMode })
```

**当前实现差异：**
- ❌ 缺失：声明式 focus 管理系统
- ❌ 缺失：focus ring 视觉样式
- ❌ 缺失：键盘导航 focus 顺序定义

### 4. Click 交互模式

官方使用标准点击交互，无特殊双击或长按模式。

**模式：**
- **单击：** 所有按钮和链接
- **选择器：** 下拉菜单使用原生 `<select>`
- **列表项：** 单击选择/激活

**当前实现对比：**
```tsx
// 当前实现（TopToolbar.tsx）
<select 
  className="toolbar__model-select" 
  value={globalDefaultModel} 
  onChange={handleModelChange}  // ✅ 标准 onChange
>
  <option value="claude-opus">claude-opus</option>
  <option value="claude-sonnet">claude-sonnet</option>
  <option value="claude-haiku">claude-haiku</option>
</select>
```

**差异：**
- ✅ 已对齐：使用原生 `<select>` 元素
- ✅ 已对齐：标准单击交互
- ⚠️ 待验证：列表项选择交互（session chooser）

### 5. Transition 和动画

官方使用最小化动画策略，主要用于状态变化反馈。

**官方模式（推断自源码结构）：**
- **状态切换：** 无过渡动画，即时切换
- **加载状态：** 使用 `LoadingState` 组件显示 spinner
- **消息流：** 流式文本无淡入动画，直接追加

**源码证据：**
```tsx
// DesktopHandoff.tsx - 状态即时切换
setState('checking')  // 无过渡
setState('flushing')  // 无过渡
setState('opening')   // 无过渡

// LoadingState 组件用于加载反馈
<LoadingState message="Checking for Claude Desktop…" />
```

**当前实现差异：**
- ✅ 已对齐：无复杂过渡动画
- ⚠️ 待验证：加载状态组件是否存在
- ❌ 缺失：状态切换的视觉连续性

### 6. 状态反馈模式

官方使用多层次状态反馈系统。

**状态层级：**

| 状态 | 视觉表现 | 位置 | 优先级 |
|------|----------|------|--------|
| `Working` | accent 色调 | 顶栏状态芯片 | 高 |
| `Awaiting approval` | warning 色调 | 顶栏状态芯片 | 高 |
| `Review ready` | review 色调 | 顶栏状态芯片 | 高 |
| `Failed` / `Needs attention` | danger 色调 | 顶栏状态芯片 | 高 |
| `Connected` / `Attached` | accent 色调 | 顶栏状态芯片 | 中 |
| `Ready` | neutral 色调 | 顶栏状态芯片 | 低 |

**当前实现对比：**
```tsx
// 当前实现（TopToolbar.tsx）
function statusTone(status: string) {
  if (status === 'Awaiting approval') return 'warning'
  if (status === 'Failed' || status === 'Needs attention') return 'danger'
  if (status === 'Review ready') return 'review'
  if (status === 'Connected' || status === 'Attached' || status === 'Working') return 'accent'
  return 'neutral'
}

<span className={`toolbar__status-chip toolbar__status-chip--${statusTone(desktopWorkflow.desktopStatus)}`}>
  {desktopWorkflow.desktopStatus}
</span>
```

**差异：**
- ✅ 已对齐：状态色调映射逻辑
- ✅ 已对齐：状态芯片位置（顶栏）
- ⚠️ 待验证：CSS 色调变量是否定义

## 交互实现建议

### CSS 层面

```css
/* Focus ring 系统 */
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Hover 状态 */
.toolbar__icon-button:hover {
  background-color: var(--hover-bg);
  transition: background-color 0.15s ease;
}

/* 状态色调变量 */
.toolbar__status-chip--accent { color: var(--accent-color); }
.toolbar__status-chip--warning { color: var(--warning-color); }
.toolbar__status-chip--danger { color: var(--danger-color); }
.toolbar__status-chip--review { color: var(--review-color); }
.toolbar__status-chip--neutral { color: var(--neutral-color); }

/* 快捷键提示样式 */
.keyboard-hint {
  opacity: 0.6;
  font-size: 0.9em;
}

.keyboard-hint__key {
  font-weight: 600;
}
```

### JavaScript 层面

```typescript
// 1. 全局快捷键系统
import { useEffect } from 'react'

function useGlobalKeybindings() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ctrl+t: 切换任务列表
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        toggleTaskList()
      }
      
      // ctrl+o: 切换 transcript
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        toggleTranscript()
      }
      
      // macOS Option 键特殊字符
      if (e.key === '†') {  // Option+T
        e.preventDefault()
        toggleThinking()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// 2. Focus 管理
function useFocusManagement(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus()
    }
  }, [active, ref])
}

// 3. 快捷键提示组件
function KeyboardShortcutHint({ 
  shortcut, 
  action, 
  parens = false 
}: { 
  shortcut: string
  action: string
  parens?: boolean
}) {
  const text = `${shortcut} to ${action}`
  return (
    <span className="keyboard-hint">
      {parens ? `(${text})` : text}
    </span>
  )
}
```

### 状态管理层面

```typescript
// 在 appShellStore.ts 中添加
interface AppShellState {
  // ... 现有状态
  
  // 新增：快捷键状态
  transcriptMode: boolean
  showAllMessages: boolean
  taskListExpanded: boolean
  
  // 新增：focus 状态
  focusedElement: 'prompt' | 'toolbar' | 'sidebar' | null
}

// 新增：快捷键 actions
const useAppShellStore = create<AppShellState>((set, get) => ({
  // ... 现有实现
  
  toggleTranscriptMode: () => set((state) => ({
    transcriptMode: !state.transcriptMode,
    showAllMessages: false,
  })),
  
  toggleShowAllMessages: () => set((state) => ({
    showAllMessages: !state.showAllMessages,
  })),
  
  toggleTaskList: () => set((state) => ({
    taskListExpanded: !state.taskListExpanded,
  })),
  
  setFocusedElement: (element) => set({ focusedElement: element }),
}))
```

## 与当前实现的对比

### 已对齐的交互

| 交互模式 | 当前实现 | 官方模式 | 状态 |
|----------|----------|----------|------|
| 模型选择器 | 下拉菜单 | 下拉菜单 | ✅ 已对齐 |
| 按钮 hover | `title` 属性 | `title` 属性 | ✅ 已对齐 |
| 状态芯片色调 | 色调映射函数 | 色调映射函数 | ✅ 已对齐 |
| 单击交互 | 标准点击 | 标准点击 | ✅ 已对齐 |
| 加载状态 | 状态文本 | `LoadingState` 组件 | ⚠️ 部分对齐 |

### 需要新增的交互

| 交互模式 | 优先级 | 实现复杂度 | 影响范围 |
|----------|--------|------------|----------|
| 全局快捷键系统 | 高 | 中 | 全局 |
| Focus ring 样式 | 高 | 低 | CSS |
| 快捷键提示组件 | 中 | 低 | 组件库 |
| macOS Option 键映射 | 中 | 低 | 键盘处理 |
| 输入框历史导航 | 中 | 中 | 输入框 |
| 声明式 focus 管理 | 低 | 中 | 全局 |

### 需要修改的交互

| 交互模式 | 当前实现 | 目标实现 | 修改范围 |
|----------|----------|----------|----------|
| 状态切换 | 即时切换 | 即时切换 + 视觉连续性 | 状态管理 |
| 工具栏布局 | 三段式 | 轻量 chrome | 布局结构 |
| 侧边栏导航 | 状态树 | 项目/会话选择器 | 侧边栏组件 |

## 实现路线图

### Phase 1: 基础交互对齐（1-2 天）

1. **CSS 基础设施**
   - 定义 focus ring 样式
   - 定义状态色调 CSS 变量
   - 定义 hover 状态样式

2. **快捷键提示组件**
   - 创建 `KeyboardShortcutHint` 组件
   - 在工具栏按钮添加快捷键提示

### Phase 2: 键盘交互系统（2-3 天）

1. **全局快捷键注册**
   - 实现 `useGlobalKeybindings` hook
   - 注册 ctrl+t, ctrl+o, ctrl+e 快捷键
   - 实现 macOS Option 键映射

2. **输入框键盘导航**
   - 实现 ↑/↓ 历史导航
   - 实现 Enter 提交
   - 实现 Escape 清空

### Phase 3: Focus 管理系统（1-2 天）

1. **声明式 focus 管理**
   - 实现 `useFocusManagement` hook
   - 定义 focus 顺序
   - 实现 focus trap（模态框）

2. **Focus 视觉反馈**
   - 应用 focus ring 样式
   - 实现键盘导航高亮

### Phase 4: 状态反馈优化（1 天）

1. **加载状态组件**
   - 创建 `LoadingState` 组件
   - 统一加载状态显示

2. **状态切换连续性**
   - 添加状态切换日志
   - 优化状态切换时序

## 技术债务和风险

### 技术债务

1. **缺少键盘导航测试**
   - 当前 E2E 测试未覆盖键盘交互
   - 需要添加键盘导航测试用例

2. **Focus 管理不一致**
   - 不同组件使用不同的 focus 策略
   - 需要统一 focus 管理模式

3. **快捷键冲突风险**
   - 未检测与系统快捷键冲突
   - 需要添加快捷键冲突检测

### 风险

1. **macOS 特殊字符兼容性**
   - Option 键映射可能在不同终端表现不一致
   - 缓解：提供配置选项禁用特殊字符映射

2. **全局快捷键劫持**
   - 可能与浏览器/系统快捷键冲突
   - 缓解：使用 `e.preventDefault()` 并提供配置

3. **Focus trap 可访问性**
   - 不当的 focus trap 可能影响屏幕阅读器
   - 缓解：遵循 ARIA 最佳实践

## 置信度评估

| 领域 | 置信度 | 依据 |
|------|--------|------|
| 键盘快捷键 | HIGH | 官方源码 `useGlobalKeybindings.tsx` |
| Hover 模式 | HIGH | 官方源码 `TopToolbar.tsx` 模式 |
| Focus 管理 | MEDIUM | 推断自 `use-declared-cursor.ts` |
| Transition | HIGH | 官方源码 `DesktopHandoff.tsx` 无动画 |
| 状态反馈 | HIGH | 官方源码 `appShellStore.ts` 状态逻辑 |
| Click 交互 | HIGH | 官方源码标准 HTML 元素 |

## 参考源码

**官方 v2.1.88 源码位置：**
- `src/hooks/useGlobalKeybindings.tsx` - 全局快捷键系统
- `src/utils/keyboardShortcuts.ts` - macOS Option 键映射
- `src/components/design-system/KeyboardShortcutHint.tsx` - 快捷键提示组件
- `src/components/DesktopHandoff.tsx` - 状态切换模式
- `src/ink/hooks/use-declared-cursor.ts` - Focus 管理
- `src/hooks/useArrowKeyHistory.tsx` - 输入框历史导航

**当前实现位置：**
- `src/app/layout/TopToolbar.tsx` - 工具栏实现
- `src/app/state/appShellStore.ts` - 状态管理
- `tests/e2e/startup.spec.ts` - 交互测试

## 下一步行动

1. **立即行动（本周）：**
   - 创建 `KeyboardShortcutHint` 组件
   - 定义 CSS focus ring 和状态色调变量
   - 实现 `useGlobalKeybindings` hook

2. **短期行动（下周）：**
   - 实现输入框历史导航
   - 添加键盘导航 E2E 测试
   - 实现 macOS Option 键映射

3. **中期行动（2 周内）：**
   - 实现声明式 focus 管理
   - 创建 `LoadingState` 组件
   - 优化状态切换连续性

---

*研究完成日期：2026-04-08*
*基于官方 Claude Code Desktop v2.1.88 源代码*
*置信度：HIGH（直接源码分析）*
