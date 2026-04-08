# Requirements: v2.3 官方 Claude Code Desktop UI 完全复刻

**Milestone:** v2.3
**Created:** 2026-04-08
**Status:** Active

## v1 Requirements

### 布局结构 (Layout)

- [ ] **LAYOUT-01**: 极简顶栏 - 窗口控制（最小化/最大化/关闭）+ 前进后退按钮 + Chat/Cowork/Code 三模式标签
- [ ] **LAYOUT-02**: 左侧栏重构 - 顶部操作区（New session/Search/Customize）+ Projects 列表 + Sessions 列表
- [ ] **LAYOUT-03**: 中央区域纯净化 - 单一对话流布局，移除右侧抽屉、底部托盘、审批面板、审查面板
- [ ] **LAYOUT-04**: 响应式布局 - 左侧栏固定宽度（360px），中央区域自适应

### 交互功能 (Interaction)

- [ ] **INTERACT-01**: 三模式切换 - Chat/Cowork/Code 标签点击切换，快捷键 Ctrl+1/2/3
- [ ] **INTERACT-02**: New session 按钮 - 创建新会话，快捷键 Ctrl+N
- [ ] **INTERACT-03**: Search 功能 - 搜索会话标题和内容，快捷键 Ctrl+F
- [ ] **INTERACT-04**: Customize 菜单 - 集成主题切换、设置、关于
- [ ] **INTERACT-05**: 前进后退导航 - 浏览器风格的会话历史导航，快捷键 Alt+Left/Right
- [ ] **INTERACT-06**: Projects 列表 - "All" 筛选 + 具体项目列表，带搜索和筛选图标
- [ ] **INTERACT-07**: Sessions 列表 - 按时间倒序，日期分组（Today/Yesterday/Last 7 days）
- [ ] **INTERACT-08**: 增强输入框 - 附件按钮 + Auto accept edits 开关 + 模型选择器 + 语音输入按钮

### 视觉设计 (Visual)

- [ ] **VISUAL-01**: 浅色主题优化 - 接近白色背景，柔和分隔线
- [ ] **VISUAL-02**: 线性图标统一 - 使用 lucide-react，2px 描边，24x24 网格
- [ ] **VISUAL-03**: 圆角卡片 - border-radius: 24px，统一应用到消息卡片
- [ ] **VISUAL-04**: 空状态设计 - 大熊猫吉祥物 + 欢迎文案（无快速操作卡片）
- [ ] **VISUAL-05**: 柔和分隔线 - rgba(255, 255, 255, 0.05) 或类似颜色
- [ ] **VISUAL-06**: 动画过渡 - 使用 CSS transitions，200ms ease-out

### 内容组织 (Content)

- [ ] **CONTENT-01**: 日期分组 - Sessions 列表按日期分组显示
- [ ] **CONTENT-02**: Project 筛选 - "All" 显示所有会话，选择项目后筛选
- [ ] **CONTENT-03**: 模型选择器位置 - 从顶栏移至输入框右侧
- [ ] **CONTENT-04**: 会话标题 - 自动生成或用户自定义

### 技术基础 (Technical)

- [ ] **TECH-01**: 语音输入支持 - 集成 react-speech-recognition，支持 Web Speech API
- [ ] **TECH-02**: 文件附件处理 - 使用 Tauri drag-drop API，支持拖拽和点击选择
- [ ] **TECH-03**: 状态管理调整 - 移除审批/审查状态，新增导航/搜索/语音状态
- [ ] **TECH-04**: CSS 方法论统一 - 使用 CSS Variables + CSS Modules，移除旧样式
- [ ] **TECH-05**: E2E 测试更新 - 使用 Page Object Model + 稳定 data-testid

### 功能移除 (Removal)

- [ ] **REMOVE-01**: 移除右侧抽屉 - 设置功能集成到 Customize 菜单
- [ ] **REMOVE-02**: 移除底部托盘 - 审批流和审查面板完全移除
- [ ] **REMOVE-03**: 移除审批流 UI - 不再显示审批面板（后端保留，UI 移除）
- [ ] **REMOVE-04**: 移除审查面板 - 不再显示代码审查界面
- [ ] **REMOVE-05**: 移除快速操作卡片 - 空状态仅显示吉祥物

## Future Requirements

待定 - 可能包括：
- 语音输入高级功能（实时转录显示、置信度提示）
- 更多主题变体（daltonized、high contrast）
- 复杂动画（引入 framer-motion）
- 虚拟滚动优化（大量会话时）

## Out of Scope

明确不在 v2.3 范围内：
- 审批流功能恢复（已决定移除）
- 代码审查功能恢复（已决定移除）
- 多窗口支持
- 云同步功能
- 插件系统

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 8 | Pending |
| LAYOUT-02 | Phase 8 | Pending |
| LAYOUT-03 | Phase 8 | Pending |
| LAYOUT-04 | Phase 8 | Pending |
| INTERACT-01 | Phase 9 | Pending |
| INTERACT-02 | Phase 9 | Pending |
| INTERACT-03 | Phase 9 | Pending |
| INTERACT-04 | Phase 9 | Pending |
| INTERACT-05 | Phase 9 | Pending |
| INTERACT-06 | Phase 9 | Pending |
| INTERACT-07 | Phase 9 | Pending |
| INTERACT-08 | Phase 9 | Pending |
| VISUAL-01 | Phase 10 | Pending |
| VISUAL-02 | Phase 10 | Pending |
| VISUAL-03 | Phase 10 | Pending |
| VISUAL-04 | Phase 10 | Pending |
| VISUAL-05 | Phase 10 | Pending |
| VISUAL-06 | Phase 10 | Pending |
| CONTENT-01 | Phase 9 | Pending |
| CONTENT-02 | Phase 9 | Pending |
| CONTENT-03 | Phase 9 | Pending |
| CONTENT-04 | Phase 9 | Pending |
| TECH-01 | Phase 7 | Pending |
| TECH-02 | Phase 7 | Pending |
| TECH-03 | Phase 7 | Pending |
| TECH-04 | Phase 7 | Pending |
| TECH-05 | Phase 10 | Pending |
| REMOVE-01 | Phase 8 | Pending |
| REMOVE-02 | Phase 8 | Pending |
| REMOVE-03 | Phase 8 | Pending |
| REMOVE-04 | Phase 8 | Pending |
| REMOVE-05 | Phase 8 | Pending |

---
*Last updated: 2026-04-08*
