---
status: pending
scope: v1-mvp-quick
source: [V1-UAT.zh-CN.md]
started: 2026-03-30T00:00:00Z
updated: 2026-03-30T00:00:00Z
---

# v1 快速验收清单（10 分钟版）

当你只想先快速确认 v1 是否基本可用时，先走这一版。

## 快速步骤

### 1. 构建
expected: `npm run build` 成功。
result: [pending]

### 2. 启动应用
expected: `npm run tauri:dev` 能正常打开桌面应用。
result: [pending]

### 3. 选择项目并创建会话
expected: 在 project mode 下选择项目并成功创建新的 session。
result: [pending]

### 4. 发送 coding task
expected: 中心工作区显示 staged assistant progress 与流式响应。
result: [pending]

### 5. 检查审批卡
expected: 审批 UI 清楚展示 command、project path 与 working directory。
result: [pending]

### 6. 先 Reject 一次
expected: Reject 后不会开始执行，并且 timeline 中记录 rejection。
result: [pending]

### 7. 再 Approve 一次
expected: Approve 后开始执行，并在 BottomPanel 中看到输出。
result: [pending]

### 8. 检查 review surface
expected: 执行完成后，可以查看 changed files 与 diff preview。
result: [pending]

### 9. 保存一个 preset
expected: 在 Settings 中能保存当前配置为 preset。
result: [pending]

### 10. 切换一个 workflow capability
expected: 在 Settings 中能切换一个 skill/workflow capability 的启用状态。
result: [pending]

## Quick Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0
blocked: 0
