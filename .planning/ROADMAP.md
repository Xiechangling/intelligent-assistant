# Roadmap: v2.2 官方 Claude Code Desktop 体验对齐

**Milestone:** v2.2  
**Status:** completed  
**Goal:** 将桌面应用从"控制台化"布局全面对齐到官方"内容优先、轻量 chrome"的单流式对话架构  
**Timeline:** 12 days  
**Created:** 2026-04-08  
**Completed:** 2026-04-08

---

## Overview

基于 v2.1.88 功能完整的桌面应用，进行 UI/UX 层面的全面对齐。核心差异不在功能缺失，而在信息架构和视觉层级的重新分配。采用渐进式重构策略：保持 Zustand 状态管理，重点调整 UI 层组件结构。

**关键策略：**
- 保持所有功能入口（只调整位置不删除）
- 内联卡片 + 托盘双轨平滑过渡
- 先独立性强的区域（顶栏/左侧栏），再复杂的区域（中央工作区）
- 保留桌面 GUI 优势（圆角/阴影/动画）

---

## Phases

### Phase 1: 顶栏简化与视觉基础 ✅
**Duration:** 2-3 days  
**Priority:** HIGH  
**Status:** completed

**Goal:** 顶栏简化立即提升产品感，建立视觉基础设施为后续阶段铺路

**Requirements:**
- REQ-01: 顶栏简化为轻量 Chrome（48px，3 个元素）
- REQ-05: 官方颜色语义化（permission/inactive/subtle/success）
- REQ-06: 间距标准化（8px 基数）
- REQ-07: 保留桌面 GUI 优势（圆角/阴影/动画）
- REQ-09: Focus Ring 样式
- REQ-11: 快捷键提示组件

**Plans:** 2 plans
- [x] 01-01-PLAN.md — 建立视觉基础设施（颜色 token、间距系统、focus ring、KeyboardShortcutHint）
- [x] 01-02-PLAN.md — 简化顶栏为轻量 chrome（48px，3 元素布局）

**Success Criteria:**
- 顶栏高度 48px，仅 3 个元素
- 新增 4 个官方颜色 token
- 所有间距为 8px 倍数
- 所有可聚焦元素有 focus ring
- E2E 测试通过

**Dependencies:** 无

---

### Phase 2: 中央工作区单流化 ✅
**Duration:** 4-5 days  
**Priority:** HIGH  
**Status:** completed

**Goal:** 单流式对话体验是对齐官方的关键，内联卡片 + 托盘双轨平滑过渡

**Requirements:**
- REQ-02: 中央工作区单流化
- REQ-13: 内联卡片组件（approval/review/status）
- REQ-14: 虚拟化消息列表（可选）

**Plans:** 3 plans
- [x] 02-01-PLAN.md — 内联卡片与底部托盘联动（approval/review/status 内联卡片 + 点击展开托盘）
- [x] 02-02-PLAN.md — 简化 session header（移除元数据网格，状态芯片移至 header）
- [x] 02-03-PLAN.md — 修复 E2E 测试（更新状态芯片定位器）

**Success Criteria:**
- 对话流占中央工作区 70%+ 视觉权重
- approval/review 在对话流中显示为内联卡片
- 点击内联卡片展开底部托盘详情
- chooser 移至左侧栏
- E2E 测试通过（approval-flow, review-flow）

**Dependencies:** Phase 1（视觉 token、快捷键提示组件）

---

### Phase 3: 左侧栏导航化与键盘交互 ✅
**Duration:** 3-4 days  
**Priority:** MEDIUM  
**Status:** completed

**Goal:** 左侧栏导航化简化信息架构，键盘交互系统提升效率

**Requirements:**
- REQ-03: 左侧栏导航化
- REQ-08: 全局快捷键系统（ctrl+t/o/e）
- REQ-10: 输入框历史导航（↑/↓）

**Plans:** 4 plans
- [x] 03-01-PLAN.md — 左侧栏导航化（移除品牌区、展开/折叠，项目选择器移至顶部）
- [x] 03-02-PLAN.md — 全局快捷键系统（useGlobalKeybindings hook，ctrl+t/o/e，macOS Option 映射）
- [x] 03-03-PLAN.md — 输入框历史导航（↑/↓，localStorage 持久化）
- [x] 03-04-PLAN.md — 键盘导航 E2E 测试

**Success Criteria:**
- 左侧栏无品牌区和展开/折叠按钮
- 项目选择器在左侧栏顶部
- ctrl+t/o/e 快捷键工作
- macOS Option 键映射工作
- 输入历史导航（↑/↓）工作
- 历史持久化到 localStorage
- E2E 测试通过（keyboard-navigation）

**Dependencies:** Phase 1（视觉 token、快捷键提示组件）

**Success Criteria:**
- 左侧栏仅包含项目列表 + 会话历史
- ctrl+t 新建会话，ctrl+o 打开项目，ctrl+e 打开设置
- 输入框 ↑/↓ 加载历史
- macOS Option 键映射工作
- E2E 测试通过

**Dependencies:** Phase 1（快捷键提示组件）


---

### Phase 4: 辅助面板抽屉化与组件样式对齐 ✅
**Duration:** 3 days  
**Priority:** LOW  
**Status:** completed

**Goal:** 辅助面板抽屉化释放中央工作区空间，组件样式对齐提升视觉一致性

**Requirements:**
- REQ-04: 右侧面板抽屉化（从固定宽度改为抽屉式，支持拖拽调整宽度，默认关闭）
- REQ-12: 组件样式对齐（按钮、输入框、卡片、列表项等组件样式与官方一致）
- REQ-14: 底部托盘细化（完善）
- REQ-15: 设置面板组织（分组、搜索、快捷键提示）

**Plans:** 5 plans
- [x] 04-01-PLAN.md — 右侧面板抽屉化（默认关闭，拖拽调整宽度，Esc 关闭）
- [x] 04-02-PLAN.md — 底部托盘细化（流畅动画，z-index 层级，视觉细节）
- [x] 04-03-PLAN.md — 组件样式对齐（按钮、输入框、卡片、列表项）
- [x] 04-04-PLAN.md — 设置面板组织（搜索、分组、快捷键提示）
- [x] 04-05-PLAN.md — E2E 测试（抽屉行为、设置搜索、组件样式）

**Success Criteria:**
- 右侧面板默认关闭，支持拖拽调整宽度（300-600px）
- 底部托盘展开/折叠流畅，z-index 层级正确
- 所有组件样式对齐官方设计（按钮 36px 高度，输入框 36px 高度，卡片 14px 圆角）
- 设置面板支持搜索过滤，分为 4 个组（Connection/Workspace/Keyboard/Capabilities）
- 快捷键提示显示在设置面板中
- E2E 测试通过（48/49，98% 通过率）

**Dependencies:** Phase 1-3（视觉基础设施、布局结构）

---

### Phase 5: 主题系统增强 ✅
**Duration:** 2 days  
**Priority:** LOW  
**Status:** completed

**Goal:** 多主题切换是增强功能，提升可访问性

**Requirements:**
- REQ-09: 主题系统增强（light/dark/auto 三种模式，系统主题跟随，主题切换动画）

**Plans:** 5 plans
- [x] 05-01-PLAN.md — 核心主题系统（状态管理、CSS 变量、系统检测）
- [x] 05-02-PLAN.md — 主题选择器 UI（设置面板 Appearance 组）
- [x] 05-03-PLAN.md — 主题切换 E2E 测试
- [x] 05-04-PLAN.md — 修复剩余 E2E 测试失败
- [x] 05-05-PLAN.md — 最终里程碑验证

**Success Criteria:**
- 支持 3 种主题切换（light/dark/auto）
- 主题持久化工作（localStorage）
- Auto 模式跟随系统主题（prefers-color-scheme）
- 主题切换无闪烁（200ms 平滑过渡）
- 主题选择器在设置面板 Appearance 组
- E2E 测试通过（54 tests, 100% pass rate）
- 所有 15 个 v2.2 需求完成验证

**Dependencies:** 无（可随时实施）

---

## Milestone Success Criteria

里程碑完成标准：

1. **UI 布局对齐 ✓**
   - 顶栏 48px，3 个元素
   - 中央工作区单流式对话，70%+ 视觉权重
   - 左侧栏纯导航列表
   - 右侧面板按需展开

2. **视觉设计对齐 ✓**
   - 新增 4 个官方颜色 token
   - 统一 8px 间距基数
   - 保留圆角/阴影/动画

3. **交互模式对齐 ✓**
   - 全局快捷键系统（ctrl+t/o/e）
   - Focus ring 样式
   - 输入框历史导航（↑/↓）

4. **主题系统增强 ✓**
   - 支持 dark/light/daltonized 主题切换

5. **E2E 验证 ✓**
   - 所有现有测试通过
   - 新增布局/交互/主题测试通过

---

## Progress Tracking

**Overall Progress:** 5/5 phases (100%)

| Phase | Status | Progress | Completed |
|-------|--------|----------|-----------|
| Phase 1: 顶栏简化与视觉基础 | completed | 2/2 | 2026-04-08 |
| Phase 2: 中央工作区单流化 | completed | 3/3 | 2026-04-08 |
| Phase 3: 左侧栏导航化与键盘交互 | completed | 4/4 | 2026-04-08 |
| Phase 4: 辅助面板抽屉化与组件样式对齐 | completed | 5/5 | 2026-04-08 |
| Phase 5: 主题系统增强 | completed | 5/5 | 2026-04-08 |

---

## Risk Management

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| 功能入口丢失 | HIGH | MEDIUM | 所有功能保留，只调整位置 | 🟢 Mitigated |
| 交互习惯突变 | MEDIUM | MEDIUM | 内联卡片 + 托盘双轨过渡 | 🟢 Mitigated |
| 虚拟化列表性能 | MEDIUM | LOW | Phase 2 性能测试，必要时引入 | 🟡 Monitoring |
| 快捷键冲突 | LOW | LOW | `e.preventDefault()` + 配置 | 🟢 Mitigated |
| Focus trap 可访问性 | LOW | LOW | 遵循 ARIA 最佳实践 | 🟢 Mitigated |

---

## Research References

- `.planning/research/UI-PATTERNS.md` — 布局模式分析
- `.planning/research/VISUAL-DESIGN.md` — 颜色/间距/字体系统
- `.planning/research/INTERACTION-MODEL.md` — 交互模式对比
- `.planning/research/ARCHITECTURE.md` — 架构对比
- `.planning/research/SUMMARY.md` — 研究汇总和实施路线图

---

*Last updated: 2026-04-08*
