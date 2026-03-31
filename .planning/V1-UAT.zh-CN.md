---
status: pending
scope: v1-mvp
source: [ROADMAP.md, REQUIREMENTS.md, STATE.md]
started: 2026-03-30T00:00:00Z
updated: 2026-03-30T00:00:00Z
---

# v1 验收清单（完整版）

## 0. 启动与构建

### 1. 验证构建成功
expected: 运行 `npm run build` 后，TypeScript 与 Vite 构建均成功，无报错。
result: [pending]

### 2. 验证桌面应用可启动
expected: 运行 `npm run tauri:dev` 后，桌面应用正常打开，无白屏、无启动级错误。
result: [pending]

## 1. Desktop Shell & Project Foundation

### 3. 验证顶层模式切换
expected: 顶部工具栏可以在 **Project** 与 **Conversation** 两种模式之间切换，中心工作区会随之变化。
result: [pending]

### 4. 验证项目选择与可见性
expected: 选择项目后，工具栏、侧边栏、右侧上下文区域都能正确显示当前项目上下文。
result: [pending]

### 5. 验证模型选择
expected: 在工具栏切换模型后，当前生效模型显示同步更新，且不会破坏会话流程。
result: [pending]

### 6. 验证凭据状态可见
expected: 用户能在 shell 或设置/上下文面板中看到 credential 状态，而不是隐藏状态。
result: [pending]

## 2. Session Persistence & Recovery

### 7. 验证项目会话创建
expected: 在已选择项目的情况下，点击 **New Session** 能创建一个绑定到该项目的会话，并立即成为当前 active session。
result: [pending]

### 8. 验证会话历史与恢复
expected: 新建会话会出现在历史列表中，并且可以从中心区域或侧边栏恢复，恢复后项目/模型/最近活动信息正确。
result: [pending]

### 9. 验证重启恢复
expected: 重启应用后，最近一次会话快照会被恢复，transcript 与 recent activity 不丢失。
result: [pending]

## 3. Conversational Coding Workflow

### 10. 验证纯对话模式聊天流程
expected: 在 conversation mode 下，用户可以创建或继续一个纯聊天会话，并在当前会话中看到流式 assistant 回复。
result: [pending]

### 11. 验证项目模式编码对话流程
expected: 在 project mode 下，中心区域展示编码任务导向的对话界面，包含 staged workflow 标记与 assistant 输出。
result: [pending]

### 12. 验证 transcript 持久化与 recent activity 更新
expected: 发送 prompt 后，会话 transcript 与 recent activity 会被更新并保存，而不是丢失状态。
result: [pending]

## 4. Safe Execution & Visibility

### 13. 验证审批卡详情
expected: 对于需要审批的 project task，执行前会显示审批卡，并清楚展示 command、project path 与 working directory。
result: [pending]

### 14. 验证 Reject 路径
expected: 点击 Reject 后，不会进入执行流程，transcript 中会记录 rejection 事件，且不会开始输出 execution output。
result: [pending]

### 15. 验证 Approve & Run 路径
expected: 点击 Approve 后开始执行，底部面板能展示执行输出，界面状态同步变化。
result: [pending]

### 16. 验证执行状态同步
expected: Toolbar、RightPanel、BottomPanel 与 transcript 在执行过程中以及执行完成后保持一致。
result: [pending]

## 5. Review, Skills & Workflow Polish

### 17. 验证 review-ready 指示
expected: 执行完成后，会话中出现 review-ready 指示，并暴露 changed files review 界面入口。
result: [pending]

### 18. 验证 changed files 列表
expected: 用户可以在桌面 UI 中查看与 assistant 操作相关联的 changed files 列表。
result: [pending]

### 19. 验证 diff preview
expected: 选中某个 changed file 后，可以在 review surface 中预览对应 diff，而无需离开当前 shell。
result: [pending]

### 20. 验证 preset 保存与应用
expected: 用户可以从 GUI 中保存当前配置为 preset，并且之后重新应用该 preset。
result: [pending]

### 21. 验证 workflow capability 开关
expected: 用户可以在 GUI 中启用/禁用 skills 或 workflow capability，并立刻看到状态变化。
result: [pending]

## 6. 端到端 MVP 闭环

### 22. 验证端到端桌面工作流
expected: 整条流程可跑通：启动应用 → 选择项目 → 创建 session → 发送 coding task → 审批命令 → 批准执行 → 查看输出 → 查看 changed files/diff → 保存 preset。
result: [pending]

## Summary

total: 22
passed: 0
issues: 0
pending: 22
skipped: 0
blocked: 0

## Notes

- 当前实现使用本地优先的模拟 assistant / execution / review 数据，用于验证桌面产品壳层与交互闭环。
- 本次 UAT 的重点是：UX 是否闭环、状态是否同步、会话是否可恢复、review/preset/skills 是否可操作，而不是验证真实文件系统代码改动。
