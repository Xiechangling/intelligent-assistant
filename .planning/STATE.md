# Project State: v2.3 官方 Claude Code Desktop UI 完全复刻

**Last updated:** 2026-04-08
**Milestone:** v2.3
**Status:** Planning

## Project Reference

**Core value:** 100% 复刻官方 Claude Code Desktop 的视觉、布局、交互和信息架构，打造高保真的官方体验

**Current focus:** Phase 8 - 核心布局重构

## Current Position

**Phase:** 9 / 10
**Plan:** 0 / 7 (Planning)
**Status:** Phase 8 complete, starting Phase 9

**Progress:**
```
[████████████░░░░░░░░] 60% (2/4 phases)
```

**Phase breakdown:**
- Phase 7: 技术准备与基础组件 - Complete (5/5 plans)
- Phase 8: 核心布局重构 - Complete (7/7 plans, verified)
- Phase 9: 增强交互功能 - Planning
- Phase 10: 视觉对齐与打磨 - Not started

## Performance Metrics

**Requirements:**
- Total: 30 requirements
- Mapped: 30/30 (100%)
- Delivered: 10/30 (33%)

**Phases:**
- Total: 4 phases
- Complete: 1/4 (25%)
- In progress: 1/4 (25%)

**Plans:**
- Total: 12 (Phase 7 + Phase 8)
- Complete: 12
- In progress: 0

**Test coverage:**
- E2E tests: TBD
- Passing: TBD

## Accumulated Context

### Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| 保持现有技术栈，仅添加 react-speech-recognition | 最小化变更，最大化复用，避免技术债务 | 2026-04-08 |
| 采用渐进式 UI 重构策略（4 阶段） | 降低回归风险，确保每个阶段可独立验证 | 2026-04-08 |
| 移除审批流和审查面板 UI | 对齐官方极简体验，保留后端能力 | 2026-04-08 |
| 从 Phase 7 开始编号 | 延续 v2.2 里程碑的阶段编号（v2.2 结束于 Phase 5） | 2026-04-08 |
| 使用 CSS Modules 统一样式方法论 | 避免全局样式冲突，提升可维护性 | 2026-04-08 |
| 添加 TypeScript 声明文件支持 react-speech-recognition | 解决类型安全问题，提升开发体验 | 2026-04-08 |
| 归档旧面板而非删除 | 保留 git 历史，便于未来参考 | 2026-04-09 |
| 两列 Grid 布局（360px + 1fr） | 简化布局，对齐官方设计 | 2026-04-09 |
| 导航历史由 appShellStore 管理 | 集中状态管理，支持前进后退 | 2026-04-09 |
| 窗口控制集成到 TopToolbar | 原生桌面体验，使用 Tauri API | 2026-04-09 |
| Search 和 Customize 按钮为 Phase 9 预留 | 分阶段实现，避免范围蔓延 | 2026-04-09 |

### Active TODOs

- [ ] 开始 Phase 9 规划（增强交互功能）
- [ ] 实现三模式切换（Chat/Cowork/Code）
- [ ] 实现全局搜索和快捷键系统
- [ ] 实现 Customize 菜单
- [ ] 增强输入框集成语音和模型选择器
- [ ] 实现导航快捷键（Alt+Left/Right）

### Known Blockers

无当前阻塞项。

### Recent Changes

- 2026-04-09: 完成 Phase 8 验证（4/4 must-haves 通过）
- 2026-04-09: 完成 Phase 8 Wave 4 人工验证（Plan 08-07）
- 2026-04-09: 完成 Phase 8 Wave 1-3（Plans 08-01 到 08-06）
- 2026-04-09: 清理 appShellStore 移除审批/审查状态，添加导航历史
- 2026-04-09: 归档 RightPanel 和 BottomPanel 到 _archived 目录
- 2026-04-09: 简化 AppShell 为两列 Grid 布局（360px + 1fr）
- 2026-04-09: 重写 TopToolbar 集成 WindowControls 和 NavigationButtons
- 2026-04-09: 重写 LeftSidebar 添加 SidebarTopActions 组件
- 2026-04-09: 清理 CenterWorkspace 移除内联审批/审查卡片
- 2026-04-09: 修复 TypeScript 编译错误（类型导入、getDesktopWorkflow 实现）
- 2026-04-09: 创建 Phase 8 SUMMARY.md，7 个原子提交完成
- 2026-04-08: 完成 Phase 7 所有 5 个计划（07-01 到 07-05）
- 2026-04-08: 安装 react-speech-recognition 4.0.1
- 2026-04-08: 扩展 appShellStore 添加 currentMode, voiceInputActive, attachments 状态
- 2026-04-08: 创建 VoiceInput, ModeTabs, AttachmentList 组件
- 2026-04-08: 扩展 attachmentService 添加 useDragDrop hook
- 2026-04-08: 创建 v2.3 路线图，定义 4 个阶段，映射 30 个需求
- 2026-04-08: 完成技术栈研究，确认现有能力满足需求
- 2026-04-08: 初始化 STATE.md 和 ROADMAP.md

## Session Continuity

### What Just Happened

完成了 Phase 8 Wave 1-3 的所有 6 个计划：
- 清理了 appShellStore 移除审批/审查状态，添加导航历史管理
- 归档了 RightPanel 和 BottomPanel 到 _archived 目录
- 简化了 AppShell 为两列 Grid 布局（360px 左侧栏 + 自适应中央区域）
- 重写了 TopToolbar 集成窗口控制和导航按钮
- 重写了 LeftSidebar 添加顶部操作区（New session/Search/Customize）
- 清理了 CenterWorkspace 移除内联审批/审查卡片
- 修复了所有 TypeScript 编译错误
- 创建了 Phase 8 SUMMARY.md

所有组件使用 CSS Modules，TypeScript 编译通过，7 个原子提交已完成。

### What's Next

1. 执行 Phase 8 Plan 08-07：人工验证布局重构成果
2. 启动开发服务器：`npm run dev`
3. 验证窗口控制、导航按钮、两列布局是否正常工作
4. 完成验证后开始 Phase 9 规划（增强交互功能）

### Context for Next Session

**如果继续 v2.3 工作：**
- Phase 7 和 Phase 8 Wave 1-3 已完成
- 下一步是 Phase 8 Wave 4：人工验证（Plan 08-07）
- 布局已简化为两列设计，旧面板已归档
- 所有新组件使用 CSS Modules 统一样式方法论

**如果需要验证 Phase 8 成果：**
- SUMMARY.md 文件已创建在 `.planning/phases/08-core-layout-refactor/08-SUMMARY.md`
- 7 个原子提交：fd150d5, c99e971, 4813dfe, 1bef3e0, 2e87fc4, 828c94e, c893895
- TypeScript 编译通过，构建成功
- 需要运行 `npm run dev` 进行功能验证

## Previous Milestone: v2.2

**Status:** shipped
**Completed:** 2026-04-08
**Phases:** 5/5 complete (Phase 1-5)
**Plans:** 19/19 complete
**Verification:** passed (15/15 requirements satisfied)

**Key deliverables:**
- 轻量 chrome 顶栏（48px，3 元素）
- 单流式对话 + 内联卡片
- 纯导航左侧栏
- 抽屉式右侧面板
- 主题系统（light/dark/auto）
- 全局快捷键 + 输入历史

**Archived to:** `.planning/milestones/v2.2-*`

---
*This file is the project's working memory. Update it after every significant change.*
