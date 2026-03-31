# Phase 2: Session Persistence & Recovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 02-session-persistence-recovery
**Areas discussed:** Session persistence and recovery

---

## Session History Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 按项目聚合的会话列表 | 每个项目下有自己的历史会话、最近会话、可恢复会话 | |
| 全局统一会话列表 + 项目筛选 | 所有会话放一起，再按项目过滤 | ✓ |
| 双入口 | 默认按项目看，同时提供全局历史入口 | |
| 其他 | 自定义组织方式 | |

**User's choice:** 全局统一会话列表 + 项目筛选
**Notes:** 用户更偏向统一浏览和后续按项目过滤。

---

## Session History Default View

| Option | Description | Selected |
|--------|-------------|----------|
| 全部会话 + 默认按最近排序 | 打开即可看到所有历史会话，再按项目筛选 | ✓ |
| 默认先过滤到当前项目 | 首次进入先只看当前项目会话 | |
| 记住上次筛选条件 | 沿用上次项目或筛选器 | |
| 其他 | 自定义默认行为 | |

**User's choice:** 全部会话 + 默认按最近排序
**Notes:** 默认视角应该是全局的，先看全部再筛选。

---

## Session Resume Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 直接恢复到该会话并继续对话 | 最符合 resume 预期，路径最短 | ✓ |
| 先进入只读详情，再手动继续 | 更稳妥但多一步 | |
| 默认克隆为新会话继续 | 保留原会话不变，新内容进入新会话 | |
| 其他 | 自定义恢复方式 | |

**User's choice:** 直接恢复到该会话并继续对话
**Notes:** 用户希望恢复流程尽量直接、低摩擦。

---

## Restored Session Context

| Option | Description | Selected |
|--------|-------------|----------|
| 项目 + 模型 + 最近活动状态 | 满足当前需求，范围清晰 | ✓ |
| 项目 + 模型 + 完整 UI 状态 | 包含筛选器、面板展开等更完整界面状态 | |
| 只恢复项目和会话内容 | 最轻量，但状态感较弱 | |
| 其他 | 自定义恢复范围 | |

**User's choice:** 项目 + 模型 + 最近活动状态
**Notes:** 当前阶段不追求完整 UI 状态恢复。

---

## Additional Guidance

**User's choice:** 参考主流 Agent 会话模式
**Notes:** 用户表示当前对这部分要求不高，允许后续研究和参考主流 Agent 产品的常见 session 模式。

## Claude's Discretion

- 会话状态文案和轻量状态展示形式
- 项目筛选控件和空状态的具体交互
- 基于主流 Agent 产品模式补齐未明确细节

## Deferred Ideas

- 会话列表项展示字段
- “最近活动状态”的精确定义
- 新建会话入口与默认继承行为
