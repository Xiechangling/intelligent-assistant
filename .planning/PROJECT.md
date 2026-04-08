# Intelligent Assistant

## What This Is

Intelligent Assistant is a shipped Windows-first desktop application that turns the Claude Code workflow into a polished local GUI experience for a single power user. The shipped milestone combines project workspace management, model switching, durable sessions, real streaming assistant conversations, approval/output/review workflow surfaces, and Claude Code Desktop-inspired shell alignment inside one local-first Tauri product.

## Core Value

Make Claude Code-style local coding workflows significantly easier to configure, control, and reuse from a desktop interface without losing the power of project-aware agent execution.

## Current Milestone: v2.2 官方体验对齐

**Goal:** 将当前桌面应用的 UI/IA/交互全面对齐到官方 Claude Code Desktop 客户端体验，消除"自制工具感"，达到高拟真度。

**Target features:**
- 顶栏去控制台化，改为内容中心的轻量 chrome
- 左侧栏从状态导航树改为官方风格的项目/会话选择器
- 中央工作区从多块拼装改为官方单流式对话体验
- 右侧抽屉和底部托盘收敛为官方风格的轻量辅助面板
- 整体视觉 token（间距/颜色/字体/圆角/阴影）对齐官方设计系统
- 交互模式对齐官方行为（hover/focus/transition/快捷键）

## Previous Milestone

- **Shipped milestone:** `v2.1.88` on 2026-04-08
- **Delivery status:** 6 phases complete, 20 plans complete, milestone audit passed
- **Validation baseline:** startup E2E 5/5, approval E2E 5/5, review E2E 5/5, status E2E 1/1, build passed
- **Product baseline:** Windows-first, single-user, local-first Claude Code desktop workbench with project/session/approval/review cohesion

## Requirements

### Validated

- [x] Local project selection, recent project switching, and active project visibility — validated in v2.1.88
- [x] Desktop model selection and future-default model switching from the GUI — validated in v2.1.88
- [x] Durable sessions, recovery, history, and model-aware metadata — validated in v2.1.88
- [x] Dual-mode assistant interaction with true streaming responses and project-aware task flow — validated in v2.1.88
- [x] Approval gating, execution visibility, and review-ready desktop workflow — validated in v2.1.88
- [x] Presets and workflow capability configuration from the GUI — validated in v2.1.88
- [x] Phase 6 desktop alignment requirements `PH6-01` through `PH6-07` — validated in v2.1.88

### Active

- None. Define the next milestone requirements with `/gsd-new-milestone` before reopening active scope.

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
*Last updated: 2026-04-08 after v2.1.88 milestone completion*
