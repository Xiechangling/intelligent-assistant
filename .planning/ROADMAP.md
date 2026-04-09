# Roadmap: v2.3 官方 Claude Code Desktop UI 完全复刻

**Milestone:** v2.3
**Created:** 2026-04-08
**Status:** Active
**Granularity:** Standard

## Phases

- [x] **Phase 7: 技术准备与基础组件** - 添加语音输入库，创建新 UI 组件基础设施
- [x] **Phase 8: 核心布局重构** - 实现极简顶栏、左侧栏重构、中央区域纯净化
- [x] **Phase 9: 增强交互功能** - 实现三模式切换、导航、搜索、增强输入框
- [ ] **Phase 10: 视觉对齐与打磨** - 对齐官方视觉语言、空状态设计、细节动画

## Phase Details

### Phase 7: 技术准备与基础组件
**Goal**: 添加必需依赖，创建新 UI 组件的基础设施，验证技术可行性
**Depends on**: Nothing (first phase of v2.3)
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04
**Success Criteria** (what must be TRUE):
  1. 用户可以通过语音输入按钮触发语音识别（Web Speech API 集成验证）
  2. 用户可以拖拽文件到输入框区域添加附件（Tauri drag-drop API 验证）
  3. ModeTabs 组件可以渲染三个模式标签（Chat/Cowork/Code）
  4. VoiceInput 组件可以显示语音输入按钮并响应点击
  5. AttachmentList 组件可以显示附件列表并支持删除操作
**Plans**: 5 plans in 2 waves

Plans:
- [x] 07-01-PLAN.md — 安装 react-speech-recognition 依赖
- [x] 07-02-PLAN.md — 调整 appShellStore 状态结构
- [x] 07-03-PLAN.md — 创建 VoiceInput 组件
- [x] 07-04-PLAN.md — 创建 ModeTabs 组件
- [x] 07-05-PLAN.md — 创建 AttachmentList 组件和扩展 attachmentService

### Phase 8: 核心布局重构
**Goal**: 实现官方 UI 的核心布局结构，移除旧功能，建立新的信息架构
**Depends on**: Phase 7
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, REMOVE-01, REMOVE-02, REMOVE-03, REMOVE-04, REMOVE-05
**Success Criteria** (what must be TRUE):
  1. 用户看到极简顶栏（窗口控制 + 前进后退 + 三模式标签），不再有旧的顶部工具栏
  2. 用户看到重构后的左侧栏（顶部操作区 + Projects 列表 + Sessions 列表），固定宽度 360px
  3. 用户看到纯净的中央对话区域，右侧抽屉、底部托盘、审批面板、审查面板已完全移除
  4. 用户调整窗口大小时，左侧栏保持固定宽度，中央区域自适应
**Plans**: 7 plans in 4 waves

Plans:
- [ ] 08-01-PLAN.md — 清理 appShellStore 状态，移除审批/审查状态，添加导航历史
- [ ] 08-02-PLAN.md — 归档 RightPanel 和 BottomPanel 组件
- [ ] 08-03-PLAN.md — 更新 AppShell 移除旧面板，简化为两列布局
- [ ] 08-04-PLAN.md — 重写 TopToolbar（窗口控制 + 导航 + 三模式标签）
- [ ] 08-05-PLAN.md — 重写 LeftSidebar（顶部操作区 + 列表）
- [ ] 08-06-PLAN.md — 清理 CenterWorkspace，增强 Composer
- [ ] 08-07-PLAN.md — 人工验证所有布局重构成果

### Phase 9: 增强交互功能
**Goal**: 实现官方 UI 的核心交互功能，包括三模式切换、导航、搜索、增强输入框
**Depends on**: Phase 8
**Requirements**: INTERACT-01, INTERACT-02, INTERACT-03, INTERACT-04, INTERACT-05, INTERACT-06, INTERACT-07, INTERACT-08, CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04
**Success Criteria** (what must be TRUE):
  1. 用户可以点击 Chat/Cowork/Code 标签切换模式，或使用 Ctrl+1/2/3 快捷键
  2. 用户可以点击 New session 按钮创建新会话，或使用 Ctrl+N 快捷键
  3. 用户可以点击 Search 按钮搜索会话标题和内容，或使用 Ctrl+F 快捷键
  4. 用户可以点击 Customize 菜单访问主题切换、设置、关于
  5. 用户可以使用前进后退按钮或 Alt+Left/Right 快捷键浏览会话历史
  6. 用户可以在 Projects 列表中选择 "All" 或具体项目进行筛选
  7. 用户可以在 Sessions 列表中看到按日期分组的会话（Today/Yesterday/Last 7 days）
  8. 用户可以在增强输入框中看到附件按钮、Auto accept edits 开关、模型选择器、语音输入按钮
**Plans**: 7 plans in 6 waves
**UI hint**: yes

Plans:
- [ ] 09-01-PLAN.md — 安装内容渲染依赖，创建 Markdown 和代码高亮组件
- [ ] 09-02-PLAN.md — 实现会话日期分组和时间戳显示
- [ ] 09-03-PLAN.md — 实现全局搜索和快捷键系统
- [ ] 09-04-PLAN.md — 实现 Customize 菜单和主题切换
- [ ] 09-05-PLAN.md — 增强输入框，集成语音输入和模型选择器
- [ ] 09-06-PLAN.md — 实现三模式切换和导航快捷键
- [ ] 09-07-PLAN.md — 人工验证所有交互功能

### Phase 10: 视觉对齐与打磨
**Goal**: 对齐官方视觉语言，完成空状态设计、细节动画、视觉一致性
**Depends on**: Phase 9
**Requirements**: VISUAL-01, VISUAL-02, VISUAL-03, VISUAL-04, VISUAL-05, VISUAL-06, TECH-05
**Success Criteria** (what must be TRUE):
  1. 用户看到浅色主题优化后的界面（接近白色背景，柔和分隔线）
  2. 用户看到统一的线性图标（lucide-react，2px 描边，24x24 网格）
  3. 用户看到圆角卡片（border-radius: 24px）应用到所有消息卡片
  4. 用户在无会话时看到大熊猫吉祥物 + 欢迎文案的空状态设计
  5. 用户在界面交互时看到流畅的动画过渡（200ms ease-out）
**Plans**: 7 plans in 5 waves
**UI hint**: yes

Plans:
- [x] 10-01-PLAN.md — 优化浅色主题（接近白色背景，柔和分隔线）
- [x] 10-02-PLAN.md — 统一图标（lucide-react，2px 描边，统一尺寸）
- [x] 10-03-PLAN.md — 统一圆角（24px 卡片圆角）
- [x] 10-04-PLAN.md — 统一动画过渡（200ms ease-out）
- [x] 10-05-PLAN.md — 创建空状态设计（大熊猫吉祥物 + 欢迎文案）
- [x] 10-06-PLAN.md — 更新 E2E 测试（Page Object Model + data-testid）
- [ ] 10-07-PLAN.md — 人工验证所有视觉对齐需求

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. 技术准备与基础组件 | 5/5 | Complete | 2026-04-08 |
| 8. 核心布局重构 | 7/7 | Complete | 2026-04-09 |
| 9. 增强交互功能 | 7/7 | Complete | 2026-04-09 |
| 10. 视觉对齐与打磨 | 6/7 | In Progress | - |

---
*Last updated: 2026-04-08*
