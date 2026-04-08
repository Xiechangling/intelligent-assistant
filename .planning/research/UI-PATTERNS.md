# UI Layout Patterns: 官方体验对齐

**Domain:** Desktop AI agent application UI/IA alignment
**Researched:** 2026-04-08
**Overall confidence:** MEDIUM

## Executive Summary

当前实现是一个功能完整的桌面应用，但 UI 架构呈现"控制台化"特征：顶栏承载过多控制元素、左侧栏混合导航与状态、中央工作区采用多块拼装布局。主流 AI agent 桌面体验（如 ChatGPT Desktop、Claude.ai web、Cursor 等）普遍采用"内容优先、轻量 chrome"的单流式对话架构。

对齐目标是将当前的"工具感"界面重构为"产品感"界面：
- 顶栏从控制中心简化为轻量 chrome（面包屑 + 最小控制）
- 左侧栏从状态树改为纯导航选择器（项目/会话列表）
- 中央工作区从多块拼装改为单流式对话体验
- 右侧/底部面板收敛为按需展开的辅助抽屉

核心差异不在功能缺失，而在信息架构和视觉层级的重新分配。

## Key Findings

**当前架构特征：** 控制台化布局，5 区域平权，状态与控制混合
**主流模式特征：** 内容优先布局，对话流为中心，chrome 最小化
**关键差异：** 信息架构层级、视觉权重分配、交互模式（多块 vs 单流）

## 1. 官方/主流 UI 布局模式

### 1.1 五大区域职责（主流模式）

基于主流 AI agent 桌面应用（ChatGPT Desktop、Claude.ai web、Cursor、GitHub Copilot Chat）的共性模式：

| 区域 | 职责 | 内容 | 视觉权重 |
|------|------|------|---------|
| **顶栏 (Top Chrome)** | 轻量导航 + 最小控制 | 面包屑（当前上下文）、模型选择器、设置入口 | 最小化（32-48px） |
| **左侧栏 (Left Sidebar)** | 导航选择器 | 项目列表、会话历史、新建入口 | 窄栏（240-280px），可折叠 |
| **中央工作区 (Center Workspace)** | 对话流 | 单流式消息列表 + 底部输入框 | 主要内容区（flex-grow） |
| **右侧面板 (Right Panel)** | 辅助信息 | 上下文详情、设置面板（按需展开） | 抽屉式（0 或 320-400px） |
| **底部托盘 (Bottom Tray)** | 工作流辅助 | 审批/输出/review（按需展开） | 抽屉式（0 或 200-400px） |

### 1.2 信息架构原则

**主流模式的核心原则：**

1. **对话流为中心** — 中央工作区占据 70%+ 视觉权重，其他区域为辅助
2. **Chrome 最小化** — 顶栏只保留必要导航，不承载状态展示
3. **按需展开** — 辅助面板默认隐藏，需要时才展开（不占用常驻空间）
4. **单流式体验** — 对话、审批、review 在同一垂直流中展开，避免多块并列
5. **渐进式披露** — 复杂信息通过层级展开，不在顶层平铺

### 1.3 布局模式（Flexbox 层级）

```
<div class="app-shell">                          // 100vh, flex column
  <header class="top-chrome">                    // height: 48px, flex: none
    <nav>面包屑 + 模型选择器</nav>
    <actions>设置入口</actions>
  </header>
  
  <div class="main-container">                   // flex: 1, flex row
    <aside class="left-sidebar">                 // width: 260px, flex: none
      <section>项目列表</section>
      <section>会话历史</section>
    </aside>
    
    <main class="center-workspace">              // flex: 1 (占据剩余空间)
      <div class="conversation-flow">            // 单流式滚动容器
        <messages />                             // 消息列表
        <inline-approval />                      // 内联审批卡片
        <inline-review />                        // 内联 review 卡片
      </div>
      <footer class="composer">                  // 固定底部
        <textarea />
        <actions />
      </footer>
    </main>
    
    <aside class="right-panel" data-open={bool}> // width: 0 或 360px
      <tabs>Context | Settings</tabs>
      <content />
    </aside>
  </div>
  
  <div class="bottom-tray" data-expanded={bool}> // height: 0 或 300px
    <tabs>Approval | Output | Review</tabs>
    <content />
  </div>
</div>
```

**关键特征：**
- 顶栏不参与 flex-grow，固定高度
- 左侧栏固定宽度，可通过 `width: 0` 折叠
- 中央工作区 `flex: 1`，占据所有剩余空间
- 右侧/底部面板通过 `data-open` 控制 0/固定宽度切换

## 2. 当前实现分析

### 2.1 当前布局结构

基于源码分析（`src/app/layout/*.tsx`）：

| 文件 | 职责 | 当前特征 |
|------|------|---------|
| `TopToolbar.tsx` | 顶栏 | **控制中心化**：项目选择器、会话信息、模型选择器、状态芯片、设置入口全部平铺 |
| `LeftSidebar.tsx` | 左侧栏 | **状态导航混合**：品牌区 + 项目列表 + 会话列表，展开/折叠状态 |
| `CenterWorkspace.tsx` | 中央工作区 | **多块拼装**：chooser、session surface、recovery callout、empty state 等多个独立块 |
| `RightPanel.tsx` | 右侧面板 | **标签页式**：Context/Settings 两个标签页，常驻展开 |
| `BottomPanel.tsx` | 底部托盘 | **三标签页**：Approval/Output/Review，按需展开 |

### 2.2 当前信息架构

```
TopToolbar (控制中心)
├── 左侧：项目选择器按钮
├── 中央：会话上下文栈（3 行文本）
└── 右侧：模型选择器 + 状态芯片 + Context 按钮 + Settings 按钮

LeftSidebar (状态导航树)
├── 品牌区（Claude Desktop + 模式说明）
├── Workspaces 区（展开/折叠 + 项目列表）
└── Recent sessions 区（展开/折叠 + 会话列表）

CenterWorkspace (多块拼装)
├── 启动状态：recovery callout / no workspace / chooser
├── 会话状态：session header + inline cards + transcript + composer
└── 错误状态：error banner / recovery failed

RightPanel (常驻标签页)
├── Context 标签：workspace context + session info + approval summary
└── Settings 标签：credentials + presets + skill toggles

BottomPanel (按需托盘)
├── Approval 标签：approval grid + actions
├── Output 标签：log viewer
└── Review 标签：file list + diff viewer
```

### 2.3 关键差异点

| 维度 | 当前实现 | 主流模式 | 差异性质 |
|------|---------|---------|---------|
| **顶栏职责** | 控制中心（6+ 元素） | 轻量 chrome（2-3 元素） | 结构性差异 |
| **顶栏高度** | ~60-80px（3 行文本栈） | 32-48px（单行） | 视觉差异 |
| **左侧栏内容** | 品牌 + 状态 + 导航 | 纯导航列表 | 结构性差异 |
| **中央布局** | 多块拼装（chooser/session/recovery 独立块） | 单流式对话 | 结构性差异 |
| **审批展示** | 底部托盘独立标签页 | 内联卡片 + 托盘双轨 | 交互差异 |
| **Review 展示** | 底部托盘独立标签页 | 内联卡片 + 托盘双轨 | 交互差异 |
| **右侧面板** | 常驻展开（标签页切换） | 按需展开（抽屉式） | 交互差异 |
| **视觉权重** | 5 区域平权 | 中央 70%+ | 结构性差异 |

## 3. 对齐建议

### 3.1 需要重构的区域

#### 3.1.1 TopToolbar（高优先级）

**当前问题：**
- 承载过多控制元素（项目选择器、会话信息栈、模型选择器、状态芯片、设置入口）
- 3 行文本栈占用过多垂直空间
- 视觉上像"控制台"而非"产品"

**对齐方案：**
```tsx
// 简化为轻量 chrome
<header className="top-chrome">
  <nav className="breadcrumb">
    <ProjectBadge />  // 当前项目名（小徽章）
    <Separator />
    <SessionTitle />  // 当前会话标题（可点击展开 chooser）
  </nav>
  <div className="actions">
    <ModelSelector />  // 下拉选择器
    <IconButton icon="settings" />  // 打开右侧设置抽屉
  </div>
</header>
```

**重构范围：**
- 移除中央的 3 行文本栈（会话信息移到 session header）
- 移除左侧的项目选择器按钮（项目切换移到左侧栏）
- 移除状态芯片（状态移到 session header 或内联卡片）
- 移除 Context 按钮（合并到 settings）

#### 3.1.2 LeftSidebar（中优先级）

**当前问题：**
- 品牌区占用空间（"Claude Desktop" + 模式说明）
- 展开/折叠状态增加交互复杂度
- 视觉上像"功能树"而非"导航列表"

**对齐方案：**
```tsx
<aside className="left-sidebar">
  <header>
    <h2>Workspaces</h2>
    <IconButton icon="folder-open" onClick={pickProject} />
  </header>
  <ul className="project-list">
    {projects.map(p => <ProjectItem key={p.path} project={p} />)}
  </ul>
  
  <header>
    <h2>Recent Sessions</h2>
  </header>
  <ul className="session-list">
    {sessions.map(s => <SessionItem key={s.id} session={s} />)}
  </ul>
  
  <footer>
    <Button onClick={createNewSession}>New Session</Button>
  </footer>
</aside>
```

**重构范围：**
- 移除品牌区（产品名移到 about 或 settings）
- 移除展开/折叠逻辑（默认全部展开，列表自然滚动）
- 简化项目/会话条目样式（减少层级）

#### 3.1.3 CenterWorkspace（高优先级）

**当前问题：**
- 多块拼装：chooser、session、recovery、empty state 等独立块
- 每个块有独立的 header/footer/actions
- 视觉上像"仪表盘"而非"对话流"

**对齐方案：**
```tsx
<main className="center-workspace">
  {/* 启动状态：内联提示卡片 */}
  {startupState === 'no-workspace' && <NoWorkspaceCard />}
  {startupState === 'recovery-available' && <RecoveryCard />}
  
  {/* 会话状态：单流式对话 */}
  {activeSession && (
    <>
      <SessionHeader />  // 轻量 header（标题 + 状态）
      <div className="conversation-flow">
        <Messages />
        {pendingApproval && <InlineApprovalCard />}
        {executionRecord && <InlineStatusCard />}
        {reviewReady && <InlineReviewCard />}
      </div>
      <Composer />  // 固定底部
    </>
  )}
</main>
```

**重构范围：**
- 合并 chooser 到左侧栏（项目/会话选择在侧边栏完成）
- 简化 session header（移除冗余元数据网格）
- 将 recovery callout 改为内联卡片
- 将 approval/review 从底部托盘提升为内联卡片（保留托盘作为详情视图）

#### 3.1.4 RightPanel（低优先级）

**当前问题：**
- 常驻展开占用空间
- Context/Settings 标签页切换增加交互成本

**对齐方案：**
```tsx
<aside className="right-panel" data-open={rightPanelOpen}>
  <header>
    <h2>{rightPanelView === 'context' ? 'Context' : 'Settings'}</h2>
    <IconButton icon="x" onClick={closePanel} />
  </header>
  <div className="panel-content">
    {rightPanelView === 'context' && <ContextView />}
    {rightPanelView === 'settings' && <SettingsView />}
  </div>
</aside>
```

**重构范围：**
- 默认关闭（`data-open={false}`，`width: 0`）
- 移除标签页切换（通过不同入口打开不同视图）
- 添加关闭按钮

#### 3.1.5 BottomPanel（低优先级）

**当前问题：**
- 三标签页切换复杂
- 与中央工作区的内联卡片职责重叠

**对齐方案：**
- 保留底部托盘作为"详情视图"
- 主要交互在内联卡片完成（approve/reject/open review）
- 托盘用于查看完整输出/diff

**重构范围：**
- 简化标签页逻辑（自动切换到相关标签）
- 与内联卡片联动（点击内联卡片的"查看详情"展开托盘）

### 3.2 可以保留的区域

| 区域 | 保留理由 | 需要调整 |
|------|---------|---------|
| **BottomPanel 结构** | 三标签页架构合理（Approval/Output/Review 是独立关注点） | 简化样式，与内联卡片联动 |
| **RightPanel 内容** | Context/Settings 内容完整 | 改为按需展开，移除标签页 |
| **Composer** | 输入框 + 附件 + 快捷键提示完整 | 简化样式，对齐主流输入框 |
| **SessionHeader** | 会话元数据展示合理 | 简化为轻量 header，移除冗余网格 |

### 3.3 视觉 Token 对齐

| Token | 当前实现 | 主流模式 | 建议 |
|-------|---------|---------|------|
| **顶栏高度** | ~60-80px | 32-48px | 简化为单行 |
| **左侧栏宽度** | ~280px | 240-260px | 略微收窄 |
| **圆角** | 混合（4px/8px） | 统一（6-8px） | 统一为 8px |
| **间距** | 混合（8px/12px/16px） | 统一（12px/16px/24px） | 统一为 4 的倍数 |
| **阴影** | 较重 | 轻量 | 减轻阴影强度 |
| **字体大小** | 混合 | 统一（14px base） | 统一基准字号 |
| **颜色层级** | 多层级 | 3-4 层级 | 简化为 bg/surface/border/text |

## 4. 实施路径

### 4.1 Phase 1: 顶栏简化（高优先级）

**目标：** 将顶栏从控制中心简化为轻量 chrome

**任务：**
1. 移除中央的 3 行文本栈
2. 简化为面包屑 + 模型选择器 + 设置入口
3. 调整高度为 48px

**影响范围：**
- `TopToolbar.tsx` 重构
- 相关样式文件

### 4.2 Phase 2: 中央工作区单流化（高优先级）

**目标：** 将多块拼装改为单流式对话体验

**任务：**
1. 合并 chooser 到左侧栏
2. 简化 session header
3. 将 approval/review 提升为内联卡片
4. 统一对话流布局

**影响范围：**
- `CenterWorkspace.tsx` 重构
- 新增内联卡片组件
- 与 `BottomPanel.tsx` 联动逻辑

### 4.3 Phase 3: 左侧栏导航化（中优先级）

**目标：** 将左侧栏从状态树改为纯导航列表

**任务：**
1. 移除品牌区
2. 移除展开/折叠逻辑
3. 简化项目/会话条目样式

**影响范围：**
- `LeftSidebar.tsx` 重构
- 相关样式文件

### 4.4 Phase 4: 辅助面板抽屉化（低优先级）

**目标：** 将右侧面板改为按需展开

**任务：**
1. 默认关闭右侧面板
2. 移除标签页切换
3. 添加关闭按钮

**影响范围：**
- `RightPanel.tsx` 调整
- 打开/关闭逻辑

### 4.5 Phase 5: 视觉 Token 统一（低优先级）

**目标：** 统一间距/圆角/阴影/字体

**任务：**
1. 定义设计 token 系统
2. 全局替换样式变量
3. 统一组件样式

**影响范围：**
- 全局样式文件
- 所有组件样式

## 5. 风险与注意事项

### 5.1 功能保留风险

**风险：** 简化布局可能导致功能入口丢失

**缓解：**
- 顶栏简化后，会话信息移到 session header（不丢失）
- 项目选择器移到左侧栏（更符合导航逻辑）
- 状态芯片移到 session header 或内联卡片（更贴近上下文）

### 5.2 交互习惯变化

**风险：** 用户已习惯当前布局

**缓解：**
- 渐进式迁移（先简化顶栏，再调整中央工作区）
- 保留核心功能入口（只调整位置，不删除）
- 提供迁移指南

### 5.3 实施复杂度

**风险：** 中央工作区重构涉及多个状态分支

**缓解：**
- 先重构顶栏和左侧栏（独立性强）
- 中央工作区分阶段重构（先内联卡片，再合并 chooser）
- 保留底部托盘作为过渡（避免一次性大改）

## 6. 成功标准

### 6.1 结构性指标

- [ ] 顶栏高度 ≤ 48px
- [ ] 顶栏元素 ≤ 5 个
- [ ] 左侧栏无品牌区
- [ ] 左侧栏无展开/折叠逻辑
- [ ] 中央工作区为单流式布局
- [ ] 审批/review 有内联卡片展示
- [ ] 右侧面板默认关闭

### 6.2 视觉指标

- [ ] 中央工作区占据 70%+ 视觉权重
- [ ] 圆角统一为 8px
- [ ] 间距统一为 4 的倍数
- [ ] 阴影轻量化
- [ ] 字体大小统一（14px base）

### 6.3 交互指标

- [ ] 项目切换在左侧栏完成
- [ ] 会话切换在左侧栏完成
- [ ] 审批操作在内联卡片完成
- [ ] Review 操作在内联卡片完成
- [ ] 设置面板按需展开

## 7. 参考资源

### 7.1 主流模式参考

由于 web search 未返回具体结果，以下基于训练数据和通用 AI agent 桌面应用模式：

- **ChatGPT Desktop:** 左侧栏会话列表 + 中央对话流 + 轻量顶栏
- **Claude.ai Web:** 左侧栏会话历史 + 中央对话流 + 最小 chrome
- **Cursor:** VS Code 布局 + 侧边栏 chat 面板
- **GitHub Copilot Chat:** VS Code 侧边栏 chat 面板

### 7.2 设计系统参考

- **Radix UI:** 现代 React 组件库，轻量设计 token
- **Shadcn/ui:** 基于 Radix 的组件系统，主流 AI 应用常用
- **Tailwind CSS:** 实用优先的设计 token 系统

### 7.3 当前实现参考

- `src/app/layout/*.tsx` — 当前布局组件
- `src/app/state/appShellStore.ts` — 状态管理
- `src/app/styles/*.css` — 当前样式系统

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| 主流模式特征 | MEDIUM | 基于训练数据和通用模式，未获取 2026 年最新官方文档 |
| 当前实现分析 | HIGH | 基于源码直接分析 |
| 差异点识别 | HIGH | 结构性差异明确 |
| 对齐方案 | MEDIUM | 方案合理但需实际验证 |

## Gaps to Address

- **官方 Claude Code Desktop 最新 UI 规范** — 需要获取 Anthropic 官方设计文档（如果存在）
- **2026 年主流 AI agent 桌面应用 UI 趋势** — web search 未返回结果，需要补充调研
- **用户习惯数据** — 当前用户对现有布局的使用习惯和痛点未知
- **性能影响** — 单流式布局对大量消息的渲染性能影响需要验证

---

**注：** 本文档基于当前实现源码分析和主流 AI agent 桌面应用的通用模式。由于 web search 未返回 2026 年最新的官方文档，部分结论基于训练数据和行业通用实践。建议在实施前补充以下调研：

1. 获取 Anthropic 官方 Claude Desktop 设计规范（如果公开）
2. 调研 2026 年主流 AI agent 桌面应用的最新 UI 趋势
3. 收集当前用户对现有布局的反馈和痛点
4. 进行原型验证和 A/B 测试
