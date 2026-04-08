# Project Research Summary

**Project:** Intelligent Assistant — 官方 Claude Code Desktop 体验对齐
**Domain:** Desktop AI agent application (Windows-first, local-first)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Executive Summary

当前实现是一个功能完整的桌面应用（基于 v2.1.88 源码），但在 UI/UX 层面呈现"控制台化"特征，与主流 AI agent 桌面体验存在结构性差异。官方 Claude Code Desktop 采用"内容优先、轻量 chrome"的单流式对话架构，而当前实现采用"多块拼装、五区域平权"的控制台布局。核心差异不在功能缺失，而在信息架构和视觉层级的重新分配。

推荐的对齐路径是**渐进式重构**：保持 Zustand 状态管理（与官方 createStore 功能等价），重点调整 UI 层组件结构。优先简化顶栏（从控制中心改为轻量 chrome）、单流化中央工作区（从多块拼装改为对话流 + 内联卡片）、导航化左侧栏（从状态树改为纯导航列表）。视觉设计系统方面，官方使用终端 UI（Ink），当前使用 Web 技术栈，应保留桌面 GUI 优势（圆角/阴影/动画），仅对齐颜色语义化和间距比例。

关键风险是**交互习惯变化**和**功能入口迁移**。缓解策略是分阶段重构（先独立性强的顶栏/左侧栏，再复杂的中央工作区），保留所有功能入口（只调整位置不删除），并通过内联卡片 + 底部托盘双轨模式平滑过渡审批/review 交互。

## Key Findings

### UI Layout Patterns

**当前架构特征：** 控制台化布局，5 区域平权（顶栏 60-80px、左侧栏 280px、中央工作区、右侧面板常驻、底部托盘按需），顶栏承载 6+ 控制元素，中央工作区采用多块拼装（chooser/session/recovery 独立块）。

**主流模式特征：** 内容优先布局，对话流为中心（占 70%+ 视觉权重），chrome 最小化（顶栏 32-48px，仅面包屑 + 模型选择器 + 设置入口），左侧栏纯导航列表（项目/会话选择器），辅助面板按需展开（抽屉式）。

**关键差异：**
- **顶栏职责：** 当前是控制中心（6+ 元素），主流是轻量 chrome（2-3 元素）
- **中央布局：** 当前是多块拼装，主流是单流式对话
- **审批/review：** 当前仅在底部托盘，主流是内联卡片 + 托盘双轨
- **视觉权重：** 当前 5 区域平权，主流中央 70%+

**对齐建议：**
1. **顶栏简化（高优先级）：** 移除 3 行文本栈，简化为面包屑 + 模型选择器 + 设置入口，高度降至 48px
2. **中央单流化（高优先级）：** 合并 chooser 到左侧栏，将 approval/review 提升为内联卡片，统一对话流布局
3. **左侧栏导航化（中优先级）：** 移除品牌区和展开/折叠逻辑，简化为纯导航列表
4. **辅助面板抽屉化（低优先级）：** 右侧面板默认关闭，按需展开

### Visual Design System

**官方设计系统：** 基于终端 UI（Ink + Yoga Flexbox），使用主题驱动颜色系统（6 种主题）、字符单位间距（1 字符 ≈ 8-12px）、等宽字体、无圆角/阴影/平滑动画（终端限制）。

**当前设计系统：** 基于 Web 技术栈（React + CSS），使用 CSS 变量颜色系统、像素间距、正文+等宽混合字体、完整圆角/阴影/动画系统。

**根本性差异：** 官方是终端 UI，当前是 Web UI，渲染技术不可对齐。但颜色语义化、间距比例、主题切换机制可对齐。

**可对齐的设计元素：**
- **颜色语义化：** 新增官方 token（`--color-permission: #b1b9f9`, `--color-inactive: #999999`, `--color-subtle: #505050`）
- **间距比例：** 统一为 8px 基数（`--space-1: 8px`, `--space-2: 16px`, `--space-3: 24px`）
- **主题切换：** 支持 dark/light/daltonized 主题（当前仅 dark）

**保留的桌面优势：**
- 圆角系统（10-24px）
- 阴影系统（增强视觉层次）
- CSS 动画（160ms ease 过渡）
- Grid + Flexbox 混合布局

**迁移策略：** 渐进式对齐（阶段 1 颜色语义化、阶段 2 间距标准化、阶段 3 组件样式对齐），保留桌面 GUI 优势。

### Interaction Model

**官方交互模式：** 键盘优先导航（ctrl+t/o/e 全局快捷键，macOS Option 键特殊字符映射），轻量级 hover 提示（原生 `title` 属性），声明式 focus 管理（`useDeclaredCursor`），最小化动画（状态即时切换），多层次状态反馈（accent/warning/danger/review 色调）。

**当前实现对比：**
- ✅ 已对齐：模型选择器（下拉菜单）、按钮 hover（`title` 属性）、状态芯片色调、单击交互
- ❌ 缺失：全局快捷键系统、快捷键提示组件、macOS Option 键映射、输入框历史导航（↑/↓）、声明式 focus 管理

**需要新增的交互：**
1. **全局快捷键系统（高优先级）：** 实现 `useGlobalKeybindings` hook，注册 ctrl+t/o/e 快捷键
2. **Focus ring 样式（高优先级）：** 定义 `:focus-visible` 样式
3. **快捷键提示组件（中优先级）：** 创建 `KeyboardShortcutHint` 组件
4. **输入框历史导航（中优先级）：** 实现 ↑/↓ 历史导航

**实施路线图：**
- Phase 1: CSS 基础设施（focus ring、状态色调、hover 样式）
- Phase 2: 键盘交互系统（全局快捷键、输入框导航、macOS 映射）
- Phase 3: Focus 管理系统（声明式 focus、focus trap）
- Phase 4: 状态反馈优化（LoadingState 组件、状态切换连续性）

### Architecture Approach

**官方架构：** 单一全局状态 + Context Provider + useSyncExternalStore，扁平化组件结构，单向数据流，无路由层（单页面条件渲染），Tauri invoke + 全局状态。

**当前架构：** Zustand 状态管理，扁平化组件结构，单向数据流，无路由层，Tauri invoke + Zustand。

**架构差异总结：** 官方使用自定义 Store（~35 行代码），当前使用 Zustand。两者在功能上等价（都基于订阅模式），Zustand 更成熟（devtools/persist/immer middleware）。

**结论：不需要大规模重构**
- 状态管理理念一致（单一全局状态 + 订阅模式）
- 组件组织模式相似（扁平化，无深层嵌套）
- 数据流模式相同（单向数据流）
- Zustand 的优势（更成熟生态、更好 TypeScript 支持）

**需要调整的细节：**
1. **组件层级调整：** 将四分区布局改为 `FullscreenLayout` 单流式布局
2. **状态字段对齐：** 保持当前字段结构，调整 UI 层渲染逻辑
3. **布局组件重构：** 新增 `FullscreenLayout`、`ScrollBox`、`VirtualMessageList`、`PromptInputFooter`

**推荐方案：** Phase 1 Only（保持 Zustand，调整组件结构），不进行 Phase 2（迁移到自定义 Store）。

## Implications for Roadmap

基于研究，建议将官方体验对齐工作分为 5 个阶段，优先处理高影响、低风险的 UI 层调整，延后可选的架构迁移。

### Phase 1: 顶栏简化与视觉基础
**Rationale:** 顶栏是用户视觉焦点，简化顶栏可立即提升"产品感"。同时建立视觉基础设施（颜色/间距 token、focus ring、快捷键提示组件）为后续阶段铺路。独立性强，风险低。

**Delivers:**
- 轻量 chrome 顶栏（48px 高度，面包屑 + 模型选择器 + 设置入口）
- 官方颜色语义化 token（`--color-permission`, `--color-inactive`, `--color-subtle`）
- 统一间距系统（8px 基数）
- Focus ring 样式
- `KeyboardShortcutHint` 组件

**Addresses:**
- UI-PATTERNS.md: 顶栏从控制中心简化为轻量 chrome
- VISUAL-DESIGN.md: 颜色语义化、间距标准化
- INTERACTION-MODEL.md: Focus ring 样式、快捷键提示组件

**Avoids:**
- 避免一次性大改导致的回归风险
- 避免功能入口丢失（会话信息移到 session header，项目选择器移到左侧栏）

### Phase 2: 中央工作区单流化
**Rationale:** 中央工作区是核心交互区域，单流化对话体验是对齐官方的关键。将 approval/review 提升为内联卡片，与底部托盘形成双轨模式，平滑过渡用户习惯。依赖 Phase 1 的视觉基础设施。

**Delivers:**
- 单流式对话布局（`FullscreenLayout` + `ScrollBox`）
- 内联卡片组件（`InlineApprovalCard`, `InlineReviewCard`, `InlineStatusCard`）
- 简化 session header（轻量 header，移除冗余网格）
- 合并 chooser 到左侧栏（项目/会话选择在侧边栏完成）
- 内联卡片 + 底部托盘联动逻辑

**Uses:**
- Phase 1 的颜色/间距 token
- Phase 1 的 `KeyboardShortcutHint` 组件
- 当前 Zustand 状态管理（无需重构）

**Implements:**
- ARCHITECTURE.md: `FullscreenLayout` 单流式布局
- UI-PATTERNS.md: 对话流为中心，审批/review 内联卡片

**Avoids:**
- 避免功能入口丢失（保留底部托盘作为详情视图）
- 避免交互习惯突变（内联卡片 + 托盘双轨过渡）

### Phase 3: 左侧栏导航化与键盘交互
**Rationale:** 左侧栏导航化简化信息架构，键盘交互系统提升效率。两者独立性强，可并行开发。依赖 Phase 1 的快捷键提示组件。

**Delivers:**
- 纯导航列表左侧栏（移除品牌区、展开/折叠逻辑）
- 全局快捷键系统（`useGlobalKeybindings` hook，ctrl+t/o/e）
- 输入框历史导航（↑/↓）
- macOS Option 键映射（†/π/ø）
- 键盘导航 E2E 测试

**Addresses:**
- UI-PATTERNS.md: 左侧栏从状态树改为纯导航列表
- INTERACTION-MODEL.md: 全局快捷键系统、输入框历史导航

**Avoids:**
- 避免快捷键冲突（使用 `e.preventDefault()` 并提供配置）
- 避免 macOS 特殊字符兼容性问题（提供配置选项禁用）

### Phase 4: 辅助面板抽屉化与组件样式对齐
**Rationale:** 辅助面板抽屉化释放中央工作区空间，组件样式对齐提升视觉一致性。优先级较低，可在核心体验对齐后进行。

**Delivers:**
- 右侧面板按需展开（默认关闭，`width: 0`）
- 移除右侧面板标签页切换（通过不同入口打开不同视图）
- 逐个组件对齐官方视觉风格（对话消息、输入框、按钮优先）
- 声明式 focus 管理（`useFocusManagement` hook）
- `LoadingState` 组件

**Addresses:**
- UI-PATTERNS.md: 辅助面板按需展开
- VISUAL-DESIGN.md: 组件样式对齐
- INTERACTION-MODEL.md: 声明式 focus 管理、LoadingState 组件

**Avoids:**
- 避免过度简化（保留圆角/阴影/动画等桌面优势）

### Phase 5: 主题系统增强（可选）
**Rationale:** 主题切换是增强功能，非核心体验对齐。可根据用户反馈决定是否实施。

**Delivers:**
- 多主题切换（dark/light/daltonized）
- 主题持久化
- 主题切换 UI

**Addresses:**
- VISUAL-DESIGN.md: 主题系统增强

**Avoids:**
- 避免颜色对比度不足（使用官方验证过的颜色值）

### Phase Ordering Rationale

1. **Phase 1 优先：** 顶栏简化立即提升产品感，视觉基础设施为后续阶段铺路，独立性强风险低
2. **Phase 2 次之：** 中央工作区是核心交互区域，依赖 Phase 1 的视觉基础设施，内联卡片 + 托盘双轨平滑过渡
3. **Phase 3 并行：** 左侧栏和键盘交互独立性强，可与 Phase 2 并行开发
4. **Phase 4 延后：** 辅助面板和组件样式对齐优先级较低，可在核心体验对齐后进行
5. **Phase 5 可选：** 主题切换是增强功能，根据用户反馈决定是否实施

**依赖关系：**
- Phase 2 依赖 Phase 1（视觉 token、快捷键提示组件）
- Phase 3 依赖 Phase 1（快捷键提示组件）
- Phase 4 依赖 Phase 1-3（视觉基础设施、布局结构）
- Phase 5 独立（可随时实施）

**如何避免研究中的 pitfalls：**
- **功能入口丢失：** 所有功能保留，只调整位置（会话信息移到 session header，项目选择器移到左侧栏）
- **交互习惯突变：** 渐进式迁移，内联卡片 + 托盘双轨过渡
- **实施复杂度：** 先独立性强的区域（顶栏/左侧栏），再复杂的区域（中央工作区）
- **快捷键冲突：** 使用 `e.preventDefault()` 并提供配置
- **Focus trap 可访问性：** 遵循 ARIA 最佳实践

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2（中央工作区单流化）：** 虚拟化列表性能优化（大量消息渲染），内联卡片与底部托盘联动逻辑复杂度
- **Phase 3（键盘交互）：** macOS Option 键特殊字符映射兼容性，快捷键冲突检测机制

**Phases with standard patterns (skip research-phase):**
- **Phase 1（顶栏简化）：** 标准 React 组件重构，CSS token 定义
- **Phase 4（辅助面板抽屉化）：** 标准抽屉式面板实现
- **Phase 5（主题系统）：** 标准 CSS 变量主题切换

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| UI Layout Patterns | MEDIUM | 基于主流 AI agent 应用通用模式和当前源码分析，未获取 2026 年最新官方文档 |
| Visual Design System | HIGH | 直接从官方 v2.1.88 源码提取 RGB 值和设计 token |
| Interaction Model | HIGH | 直接从官方 v2.1.88 源码分析快捷键和交互模式 |
| Architecture | HIGH | 直接对比官方和当前源码，架构差异明确 |

**Overall confidence:** HIGH

研究基于官方 Claude Code Desktop v2.1.88 源码直接分析，置信度高。UI Layout Patterns 部分因 web search 未返回 2026 年最新官方文档，基于训练数据和通用模式推断，置信度中等。

### Gaps to Address

- **官方 Claude Code Desktop 最新 UI 规范：** 需要获取 Anthropic 官方设计文档（如果存在）。缓解：基于 v2.1.88 源码分析已足够指导实施，可在实施过程中根据官方更新调整。

- **2026 年主流 AI agent 桌面应用 UI 趋势：** web search 未返回结果，需要补充调研。缓解：基于训练数据和行业通用实践已覆盖主流模式，可在实施前进行原型验证。

- **用户习惯数据：** 当前用户对现有布局的使用习惯和痛点未知。缓解：渐进式迁移，保留所有功能入口，收集用户反馈后调整。

- **虚拟化列表性能影响：** 单流式布局对大量消息的渲染性能影响需要验证。缓解：Phase 2 实施时进行性能测试，必要时引入虚拟化列表（官方使用 `VirtualMessageList`）。

- **字符单位换算比例：** 1 字符应对应多少像素（建议 8px，需验证不同屏幕 DPI 下的表现）。缓解：Phase 1 实施时进行视觉验证，必要时调整换算比例。

## Sources

### Primary (HIGH confidence)
- **官方源码 v2.1.88** — `claude-code-source-code-v2.1.88/src/`
  - `state/store.ts` — 状态管理架构
  - `components/FullscreenLayout.tsx` — 布局模式
  - `hooks/useGlobalKeybindings.tsx` — 键盘交互
  - `utils/theme.ts` — 颜色系统
  - `ink/styles.ts` — 布局系统
- **当前实现源码** — `src/app/`
  - `layout/*.tsx` — 当前布局组件
  - `state/appShellStore.ts` — 当前状态管理
  - `styles/*.css` — 当前设计 tokens

### Secondary (MEDIUM confidence)
- **主流 AI agent 应用模式** — 基于训练数据和通用实践
  - ChatGPT Desktop: 左侧栏会话列表 + 中央对话流 + 轻量顶栏
  - Claude.ai Web: 左侧栏会话历史 + 中央对话流 + 最小 chrome
  - Cursor: VS Code 布局 + 侧边栏 chat 面板
  - GitHub Copilot Chat: VS Code 侧边栏 chat 面板

### Tertiary (LOW confidence)
- **2026 年 UI 趋势** — web search 未返回结果，需补充调研

---
*Research completed: 2026-04-08*
*Ready for roadmap: yes*
