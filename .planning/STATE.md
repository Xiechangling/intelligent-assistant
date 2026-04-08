# Project State

**Last Updated:** 2026-04-08  
**Current Milestone:** v2.2 官方体验对齐  
**Milestone Status:** in-progress

---

## Active Milestone: v2.2

**Goal:** 将桌面应用从"控制台化"布局全面对齐到官方"内容优先、轻量 chrome"的单流式对话架构

**Timeline:** 12-17 days  
**Progress:** 3/5 phases (60%)

### Phase Status

| Phase | Status | Progress | Started | Completed |
|-------|--------|----------|---------|-----------|
| Phase 1: 顶栏简化与视觉基础 | completed | 2/2 | 2026-04-08 | 2026-04-08 |
| Phase 2: 中央工作区单流化 | completed | 3/3 | 2026-04-08 | 2026-04-08 |
| Phase 3: 左侧栏导航化与键盘交互 | completed | 4/4 | 2026-04-08 | 2026-04-08 |
| Phase 4: 辅助面板抽屉化与组件样式对齐 | pending | 0/7 | - | - |
| Phase 5: 主题系统增强 | pending | 0/5 | - | - |

### Requirements Status

**Total:** 15 requirements  
**Completed:** 7 (REQ-01, REQ-03, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11)  
**In Progress:** 0  
**Pending:** 8

---

## Previous Milestone: v2.1.88

**Status:** shipped  
**Completed:** 2026-04-08  
**Phases:** 6/6 complete  
**Plans:** 20/20 complete  
**Verification:** passed (21/21 requirements satisfied)

**Archived to:** `.planning/milestones/v2.1.88-*`

---

## Repository Status

**Branch:** master  
**Last Commit:** c967d64 - docs: update STATE and ROADMAP for Phase 3 completion  
**Tag:** v2.1.88  
**Build Status:** ✓ passing  
**Test Status:** ✓ E2E tests created (21/22 existing + new keyboard-navigation tests)

**Uncommitted Changes:** None

---

## Decisions

### Phase 1 Decisions

**Design System Foundation (Plan 01-01):**
- Use outline instead of box-shadow for focus rings (better accessibility compliance)
- 8px spacing base aligns with official design system (1 character unit ≈ 8px)
- KeyboardShortcutHint auto-detects OS for platform-specific symbols (⌘ vs Ctrl)

**Toolbar Simplification (Plan 01-02):**
- Toolbar height reduced to 48px (from 56px) for lightweight chrome feel
- Project picker moved to sidebar (Phase 3), session info moved to session header (Phase 2)
- Context and Settings merged into single settings button
- Breadcrumb shows only last path segment with 200px max-width

### Phase 2 Decisions

**Inline Card Tray Linkage (Plan 02-01):**
- Use zustand store methods (setBottomPanelExpanded, setBottomPanelTab) for state management
- Add visual expand hints (ChevronDown icon + text) to guide user interaction
- Different click behaviors per card type (approval auto-shows, status/review switch tabs)

**Session Header Simplification (Plan 02-02):**
- Remove metadata grid (workspace, model, last activity, session state) to reduce visual clutter
- Move StatusChip to header right side for prominent visibility
- Keep eyebrow, title, and activity summary for essential context
- Use flexbox single-row layout for cleaner structure

**E2E Test Updates (Plan 02-03):**
- Update all status chip selectors to match new header location
- Update inline card selectors to match new component structure
- Fix text expectations to match actual component output
- Defer Phase 1 mode switcher test to out-of-scope

### Phase 3 Decisions

**Left Sidebar Navigation (Plan 03-01):**
- Remove brand area completely for minimal design
- Remove expand/collapse logic - lists always visible
- Move project picker from topbar to sidebar top with ctrl+o hint

**Global Keybindings (Plan 03-02):**
- Use window keydown listener for global shortcuts
- Support macOS Option key mapping (†/ø/´ characters)
- Make keybindings configurable via settings panel

**Input History (Plan 03-03):**
- Use localStorage for persistence (max 50 entries)
- Filter sensitive data (api_key, password, email patterns)
- Save draft when navigating, restore with ↓

---

## Next Steps

1. **Phase 4 Planning:** 创建 Phase 4 详细计划（辅助面板抽屉化与组件样式对齐）
2. **Phase 4 Execution:** 执行 Phase 4 计划
3. **Phase 4 Verification:** 验证 Phase 4 交付物

---

## Known Issues

**Deferred from Phase 2:**
- 1 E2E test failing: "blocks mode switching while approval is pending" (approval-flow.spec.ts:71)
- Test expects Project/Conversation mode switcher buttons removed in Phase 1
- Documented in `.planning/phases/02-center-workspace-single-stream/deferred-items.md`
- Requires decision: remove test, update test, or re-implement mode switching
- Current pass rate: 21/22 (95.5%)

---

## Blockers

None - Phase 2 complete, ready for Phase 3 planning.

---

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Completed |
|-------|------|----------|-------|-------|-----------|
| 01 | 01 | 5min | 4 | 2 | 2026-04-08T12:30:00Z |
| 01 | 02 | 8min | 3 | 2 | 2026-04-08T12:38:00Z |
| 02 | 01 | 15min | 3 | 2 | 2026-04-08T20:45:00Z |
| 02 | 02 | 10min | 2 | 2 | 2026-04-08T20:50:00Z |
| 02 | 03 | 25min | 4 | 3 | 2026-04-08T21:00:00Z |
| 03 | 01 | 15min | 3 | 3 | 2026-04-08T13:10:00Z |
| 03 | 02 | 12min | 3 | 4 | 2026-04-08T13:12:00Z |
| 03 | 03 | 10min | 3 | 2 | 2026-04-08T13:14:00Z |
| 03 | 04 | 8min | 3 | 1 | 2026-04-08T13:16:00Z |

---

## Notes

- v2.2 Phase 1 完成（视觉基础设施 + 轻量 chrome 顶栏）
- v2.2 Phase 2 完成（中央工作区单流化 + 内联卡片交互）
- v2.2 Phase 3 完成（左侧栏导航化 + 全局快捷键 + 输入历史）
- 4 个官方颜色 token 已添加
- 间距系统统一为 8px 基数
- Focus ring 增强（outline 替代 box-shadow）
- KeyboardShortcutHint 组件已创建
- 顶栏简化为 3 元素布局（48px 高度）
- Session header 简化为单行布局（移除 metadata grid）
- 内联卡片可点击展开底部托盘（带视觉提示）
- 左侧栏无品牌区和展开/折叠按钮
- 项目选择器移至左侧栏顶部
- 全局快捷键系统（ctrl+t/o/e + macOS Option 映射）
- 输入历史导航（↑/↓ + localStorage 持久化）
- E2E 测试更新完成（21/22 通过，95.5% 通过率）
- 新增 keyboard-navigation.spec.ts（11 个测试）
- 准备进入 Phase 4 规划阶段

---

*State tracking for GSD workflow*
