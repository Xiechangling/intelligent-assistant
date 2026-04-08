# Intelligent Assistant

## What This Is

Intelligent Assistant is a shipped Windows-first desktop application that turns the Claude Code workflow into a polished local GUI experience for a single power user. The shipped milestone combines project workspace management, model switching, durable sessions, real streaming assistant conversations, approval/output/review workflow surfaces, and Claude Code Desktop-inspired shell alignment inside one local-first Tauri product.

## Core Value

Make Claude Code-style local coding workflows significantly easier to configure, control, and reuse from a desktop interface without losing the power of project-aware agent execution.

## Current Milestone: v2.3 官方 Claude Code Desktop UI 完全复刻

**Goal:** 100% 复刻官方 Claude Code Desktop 的视觉、布局、交互和信息架构，打造高保真的官方体验。

**Target features:**
- 极简顶栏：窗口控制 + 前进后退 + Chat/Cowork/Code 三模式标签
- 左侧栏重构：New session/Search/Customize 顶部操作 + Projects/Sessions 列表
- 中央区域纯净化：单一对话流 + 底部增强输入框（附件/Auto accept/模型/语音）
- 空状态设计：大熊猫吉祥物
- 视觉语言对齐：浅色主题、线性图标、圆角卡片、柔和分隔线
- 移除额外功能：审批流、审查面板、底部托盘、右侧抽屉
- 保留核心：主题切换集成到 Customize 菜单

## Previous Milestones

**v2.2 官方体验对齐** (2026-04-08):
- 5 phases complete, 19 plans complete
- 15/15 requirements delivered
- 49/54 E2E tests passing (90.7%)
- Delivered: 轻量 chrome 顶栏、单流式对话、导航化侧栏、抽屉面板、主题系统、全局快捷键

**v2.1.88 桌面基础** (2026-04-08):
- 6 phases complete, 20 plans complete, milestone audit passed
- Validation baseline: startup E2E 5/5, approval E2E 5/5, review E2E 5/5, status E2E 1/1, build passed
- Product baseline: Windows-first, single-user, local-first Claude Code desktop workbench with project/session/approval/review cohesion

## Requirements

### Validated

**v2.2 官方体验对齐:**
- [x] REQ-01 至 REQ-15: 顶栏简化、单流化、导航化、抽屉面板、主题系统、快捷键等 — validated in v2.2

**v2.1.88 桌面基础:**
- [x] Local project selection, recent project switching, and active project visibility — validated in v2.1.88
- [x] Desktop model selection and future-default model switching from the GUI — validated in v2.1.88
- [x] Durable sessions, recovery, history, and model-aware metadata — validated in v2.1.88
- [x] Dual-mode assistant interaction with true streaming responses and project-aware task flow — validated in v2.1.88
- [x] Approval gating, execution visibility, and review-ready desktop workflow — validated in v2.1.88
- [x] Presets and workflow capability configuration from the GUI — validated in v2.1.88

### Active (v2.3)

待定义 - 将在 REQUIREMENTS.md 中详细列出

### Out of Scope

- Team collaboration and multi-user shared workspaces — the shipped milestone is intentionally optimized for a single self-user workflow.
- Cloud sync and plugin marketplace features — these remain deferred until a future milestone explicitly reopens them.
- Generalized ecosystem/platform expansion before the Windows-first workflow is taken further.

## Context

The shipped milestone solved the original terminal-friction problem by moving startup, project selection, model control, session continuity, streaming interaction, approval review, and changed-file inspection into one cohesive desktop shell. The current codebase is now a brownfield Tauri + React + Rust desktop app with shared Zustand workflow state, native-backed project/credential/session services, and Playwright-backed UI verification for the main user flows.

## Constraints

- **Platform:** Windows-first desktop delivery remains the current baseline.
- **Scope:** Single-user productivity remains the design center.
- **UX:** Polished desktop UI is still product value, not optional chrome.
- **Architecture:** Hybrid local desktop shell + native Rust services + Claude API remains the validated direction.
- **Security:** Local-first access model with explicit approval boundaries and OS-backed credential storage remains mandatory.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a desktop GUI rather than extend terminal usage | Main pain was CLI friction around startup, configuration, and visibility | ✓ Validated in v2.1.88 |
| Optimize MVP for a single self-user on Windows first | Initial adoption target is the project creator, not teams | ✓ Validated in v2.1.88 |
| Use a hybrid architecture combining local orchestration with Claude API control | Best fit for Claude Code power plus richer desktop interaction | ✓ Validated in v2.1.88 |
| Treat project management, model switching, session continuity, and approval/review surfaces as core capabilities | These were the highest-friction parts of the original workflow | ✓ Validated in v2.1.88 |
| Use one shared shell store for chooser, session, tray, and workflow state | Keeps cross-surface desktop state coherent | ✓ Validated in v2.1.88 |
| Keep review in the lifecycle tray and settings/presets in the right panel | Preserves center-workspace-first hierarchy | ✓ Validated in v2.1.88 |

## Evolution

This document now reflects a shipped brownfield baseline.

- `v2.1.88` is archived in `.planning/milestones/`.
- The next milestone should begin with fresh requirement definition rather than continuing to mutate the shipped MVP requirement set.
- Future milestone work should evolve this file by adding new Active requirements and updating Current State after the next shipping cycle.

---
*Last updated: 2026-04-08 after v2.3 milestone initialization*
