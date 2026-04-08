# 官方 Claude Code Desktop 视觉设计系统研究

**项目:** Intelligent Assistant v2.2 官方体验对齐
**研究日期:** 2026-04-08
**置信度:** HIGH

## 执行摘要

官方 Claude Code Desktop 使用基于终端的视觉设计系统，核心是 **主题驱动的颜色系统** + **Flexbox 布局** + **字符单位间距**。与当前桌面应用的 CSS-based 设计系统存在根本性差异：官方使用 Ink (React for CLI) 渲染终端 UI，而当前应用使用 Web 技术栈。

**关键发现:**
- 官方设计系统是 **终端 UI 系统**，不是传统 Web 设计系统
- 颜色通过主题系统管理（6 种主题：dark/light/daltonized/ansi）
- 间距使用 **字符单位**（padding/margin 以字符数计）
- 无传统圆角/阴影概念（终端限制）
- 布局基于 Yoga Flexbox 引擎

## 官方设计 Tokens

### 颜色系统 (Dark Theme)

官方使用语义化颜色键，通过主题解析为 RGB 值：

| Token Key | RGB Value | 用途 | 当前对应 |
|-----------|-----------|------|---------|
| `text` | rgb(255,255,255) | 主文本 | --text-primary |
| `inactive` | rgb(153,153,153) | 次要文本 | --text-secondary |
| `subtle` | rgb(80,80,80) | 三级文本 | --text-tertiary |
| `claude` | rgb(215,119,87) | Claude 品牌色 | --accent |
| `permission` | rgb(177,185,249) | 权限/交互色 | --accent-strong |
| `suggestion` | rgb(177,185,249) | 建议/链接色 | --accent-strong |
| `success` | rgb(78,186,101) | 成功状态 | 无 |
| `error` | rgb(255,107,128) | 错误状态 | --danger |
| `warning` | rgb(255,193,7) | 警告状态 | --warning |
| `promptBorder` | rgb(136,136,136) | 边框色 | --border-subtle |
| `userMessageBackground` | rgb(55,55,55) | 用户消息背景 | 无 |
| `selectionBg` | rgb(38,79,120) | 选中背景 | 无 |

**Shimmer 变体（动画/高亮）:**
- `claudeShimmer`: rgb(235,159,127)
- `permissionShimmer`: rgb(207,215,255)
- `promptBorderShimmer`: rgb(166,166,166)
- `inactiveShimmer`: rgb(193,193,193)
- `warningShimmer`: rgb(255,223,57)

### 间距系统

官方使用 **字符单位** 而非像素：

| 用途 | 官方值 | 当前值 | 差异 |
|------|--------|--------|------|
| Pane 顶部间距 | `paddingTop={1}` | 20px | 终端 vs 像素 |
| Pane 水平间距 | `paddingX={2}` | 24px | 终端 vs 像素 |
| 组件间距 | `gap={1-3}` | 8-16px | 终端 vs 像素 |
| 边框宽度 | 1 字符 | 1px | 终端 vs 像素 |

**换算关系（近似）:**
- 1 字符单位 ≈ 8-12px（取决于终端字体大小）
- 官方不使用固定像素值

### 字体系统

官方使用 **等宽字体**（终端限制）：

```typescript
// 代码字体（唯一字体）
font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace
```

**当前系统:**
```css
font-family: Inter, "Segoe UI", sans-serif;  /* 正文 */
font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;  /* 代码 */
```

**差异:** 官方全部使用等宽字体，当前区分正文/代码字体。

### 圆角系统

**官方:** 无圆角概念（终端 UI 使用 ASCII 边框字符）

**当前系统:**
```css
--radius-sm: 10px → 12px
--radius-md: 14px → 16px
--radius-lg: 18px → 24px
```

**迁移策略:** 保留当前圆角系统（桌面 GUI 优势）。

### 阴影系统

**官方:** 无阴影（终端限制）

**当前系统:**
```css
box-shadow: 
  inset 0 1px 0 rgba(255,255,255,0.03),
  0 20px 48px rgba(0,0,0,0.18);
```

**迁移策略:** 保留当前阴影系统（桌面 GUI 优势）。

### 边框系统

**官方边框样式:**
```typescript
borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic'
```

使用 Unicode 边框字符（如 `┌─┐│└┘`）。

**当前系统:**
```css
border: 1px solid rgba(255,255,255,0.055);
```

**差异:** 官方使用 ASCII 艺术边框，当前使用标准 CSS 边框。

### 动效系统

**官方:** 基于 shimmer 颜色变体实现"闪烁"效果（终端限制）

**当前系统:**
```css
transition: 
  background-color 160ms ease,
  border-color 160ms ease,
  transform 160ms ease,
  opacity 160ms ease;
```

**差异:** 官方无平滑过渡动画，当前有完整 CSS 动画系统。

## 布局系统对比

### 官方布局（Yoga Flexbox）

```typescript
<Box 
  flexDirection="column"
  paddingX={2}
  paddingTop={1}
  gap={1}
  borderStyle="round"
  borderColor="permission"
>
  {children}
</Box>
```

**特点:**
- 基于 Yoga 布局引擎（Facebook 的 Flexbox 实现）
- 所有尺寸以字符为单位
- 支持 flexbox 所有属性
- 无 Grid 布局

### 当前布局（CSS Grid + Flexbox）

```css
.app-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) var(--drawer-width);
  grid-template-rows: 56px minmax(0, 1fr) auto;
}
```

**特点:**
- CSS Grid 主布局
- Flexbox 组件布局
- 像素/百分比混合单位
- 响应式断点

## 设计差异分析

### 根本性差异

| 维度 | 官方 Claude Code Desktop | 当前桌面应用 | 可对齐性 |
|------|-------------------------|-------------|---------|
| **渲染技术** | 终端 UI (Ink) | Web UI (React + CSS) | ❌ 不可对齐 |
| **颜色系统** | 主题驱动 RGB | CSS 变量 | ✅ 可对齐 |
| **间距单位** | 字符单位 | 像素 | ⚠️ 需换算 |
| **字体** | 等宽字体 | 正文+等宽 | ⚠️ 部分对齐 |
| **圆角** | 无 | 有 | ❌ 保留当前 |
| **阴影** | 无 | 有 | ❌ 保留当前 |
| **动画** | 无平滑过渡 | CSS 过渡 | ❌ 保留当前 |
| **布局** | Flexbox only | Grid + Flexbox | ⚠️ 部分对齐 |

### 可对齐的设计元素

#### 1. 颜色语义化

**官方模式:**
```typescript
<ThemedText color="permission">交互元素</ThemedText>
<ThemedText color="inactive">次要文本</ThemedText>
<ThemedBox borderColor="promptBorder">容器</ThemedBox>
```

**迁移到当前:**
```css
/* 新增语义化颜色变量 */
--color-permission: #b1b9f9;  /* 对应 permission */
--color-inactive: #999999;     /* 对应 inactive */
--color-subtle: #505050;       /* 对应 subtle */
```

#### 2. 间距比例

**官方比例（字符单位）:**
- 小间距: 1 字符
- 中间距: 2 字符
- 大间距: 3 字符

**换算到当前（假设 1 字符 = 8px）:**
```css
--space-xs: 8px;   /* 1 字符 */
--space-sm: 16px;  /* 2 字符 */
--space-md: 24px;  /* 3 字符 */
--space-lg: 32px;  /* 4 字符 */
```

#### 3. 主题切换机制

**官方实现:**
```typescript
const [themeName, setTheme] = useTheme();
const theme = getTheme(themeName);  // 解析为 RGB 值
```

**当前可增强:**
```typescript
// 支持 dark/light/daltonized 主题切换
// 当前仅支持 dark
```

## Token 迁移策略

### 策略 A: 渐进式对齐（推荐）

**阶段 1: 颜色语义化（低风险）**
```css
/* 新增官方语义化 token */
:root {
  /* 官方颜色映射 */
  --color-claude: #d77757;
  --color-permission: #b1b9f9;
  --color-suggestion: #b1b9f9;
  --color-inactive: #999999;
  --color-subtle: #505050;
  
  /* 保留当前 token，逐步迁移 */
  --accent: var(--color-permission);
  --text-secondary: var(--color-inactive);
  --text-tertiary: var(--color-subtle);
}
```

**阶段 2: 间距标准化（中风险）**
```css
/* 统一间距比例 */
:root {
  --space-1: 8px;   /* 1 字符 */
  --space-2: 16px;  /* 2 字符 */
  --space-3: 24px;  /* 3 字符 */
  --space-4: 32px;  /* 4 字符 */
  --space-5: 40px;  /* 5 字符 */
  --space-6: 48px;  /* 6 字符 */
}
```

**阶段 3: 组件样式对齐（高风险）**
- 逐个组件对齐视觉风格
- 保留桌面 GUI 优势（圆角/阴影）
- 测试每个组件变更

### 策略 B: 一次性替换（不推荐）

**风险:**
- 破坏现有 UI 一致性
- 大量回归测试
- 用户体验突变

**适用场景:**
- 全新项目
- 重大版本升级

## 需要新增的 Tokens

### 颜色 Tokens

```css
/* 官方语义化颜色（当前缺失） */
--color-claude: #d77757;
--color-permission: #b1b9f9;
--color-permission-shimmer: #cfd7ff;
--color-suggestion: #b1b9f9;
--color-inactive: #999999;
--color-inactive-shimmer: #c1c1c1;
--color-subtle: #505050;
--color-prompt-border: #888888;
--color-prompt-border-shimmer: #a6a6a6;

/* 消息背景色（当前缺失） */
--color-user-message-bg: #373737;
--color-user-message-bg-hover: #464646;
--color-selection-bg: #264f78;
--color-bash-message-bg: #413c41;
```

### 间距 Tokens（已有，需调整）

```css
/* 当前 */
--space-1: 6px;  /* 调整为 8px */
--space-2: 10px; /* 调整为 16px */
--space-3: 14px; /* 调整为 24px */
--space-4: 18px; /* 调整为 32px */
```

### 字体 Tokens（已有，需调整）

```css
/* 考虑全局使用等宽字体（可选） */
font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
```

## 需要废弃的 Tokens

### 无需废弃

当前所有 tokens 均有价值，建议 **保留并增强**：

1. **保留圆角系统** - 桌面 GUI 优势
2. **保留阴影系统** - 增强视觉层次
3. **保留动画系统** - 提升交互体验
4. **保留 Grid 布局** - 复杂布局需求

### 可选优化

```css
/* 简化过于复杂的渐变 */
/* 当前 */
background: radial-gradient(...), linear-gradient(...);

/* 简化为 */
background: linear-gradient(180deg, #151920 0%, #101216 100%);
```

## 迁移路线图

### Phase 1: 颜色对齐（1-2 天）

**目标:** 新增官方语义化颜色 tokens

**任务:**
1. 在 `app-shell.css` 新增官方颜色变量
2. 创建颜色映射文档
3. 不修改现有组件（向后兼容）

**验证:**
- 所有现有 UI 无变化
- 新变量可用于新组件

### Phase 2: 间距标准化（2-3 天）

**目标:** 统一间距比例为 8px 基数

**任务:**
1. 调整 `--space-*` 变量值
2. 更新所有使用间距的组件
3. 视觉回归测试

**验证:**
- 间距比例一致
- 无布局错位

### Phase 3: 组件样式对齐（1-2 周）

**目标:** 逐个组件对齐官方视觉风格

**优先级:**
1. **高优先级:** 对话消息、输入框、按钮
2. **中优先级:** 侧边栏、顶栏、抽屉
3. **低优先级:** 设置面板、状态指示器

**每个组件:**
1. 对比官方视觉
2. 调整颜色/间距
3. 保留圆角/阴影
4. 测试交互

### Phase 4: 主题系统增强（可选）

**目标:** 支持多主题切换

**任务:**
1. 实现 light/dark 主题切换
2. 支持 daltonized（色盲友好）主题
3. 主题持久化

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| **间距调整破坏布局** | 高 | 渐进式迁移，每次调整后回归测试 |
| **颜色对比度不足** | 中 | 使用官方验证过的颜色值 |
| **用户体验突变** | 中 | 分阶段发布，收集反馈 |
| **开发成本高** | 低 | 优先对齐核心组件 |

## 技术实现建议

### 1. 创建颜色映射层

```typescript
// src/design-system/colors.ts
export const officialColors = {
  claude: '#d77757',
  permission: '#b1b9f9',
  inactive: '#999999',
  // ...
} as const;

export const colorMapping = {
  '--accent': officialColors.permission,
  '--text-secondary': officialColors.inactive,
  // ...
};
```

### 2. 间距工具函数

```typescript
// src/design-system/spacing.ts
const CHAR_UNIT = 8; // 1 字符 = 8px

export const charToPixel = (chars: number) => `${chars * CHAR_UNIT}px`;

// 使用
padding: charToPixel(2); // 16px
```

### 3. 主题切换 Hook

```typescript
// src/hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return [theme, setTheme] as const;
};
```

## 置信度评估

| 领域 | 置信度 | 原因 |
|------|--------|------|
| **颜色系统** | HIGH | 直接从源码提取 RGB 值 |
| **间距系统** | HIGH | 源码明确使用字符单位 |
| **字体系统** | HIGH | 源码明确字体栈 |
| **圆角/阴影** | HIGH | 终端 UI 无此概念 |
| **动画系统** | MEDIUM | 仅发现 shimmer 变体 |
| **布局系统** | HIGH | Yoga Flexbox 引擎 |

## 开放问题

1. **字符单位换算比例** - 1 字符应对应多少像素？
   - 建议: 8px（常见终端字体大小）
   - 需验证: 不同屏幕 DPI 下的表现

2. **等宽字体全局应用** - 是否全局使用等宽字体？
   - 建议: 保留当前正文字体，仅代码区域使用等宽
   - 原因: 桌面 GUI 可读性优势

3. **主题切换优先级** - 是否需要立即支持 light 主题？
   - 建议: Phase 4 可选功能
   - 原因: 当前用户习惯 dark 主题

## 参考资源

### 源码文件

- `claude-code-source-code-v2.1.88/src/utils/theme.ts` - 主题定义
- `claude-code-source-code-v2.1.88/src/ink/styles.ts` - 布局系统
- `claude-code-source-code-v2.1.88/src/components/design-system/` - 组件系统

### 当前实现

- `src/styles/app-shell.css` - 当前设计 tokens
- `src/app/layout/` - 当前布局组件

---

**最后更新:** 2026-04-08
**研究者:** GSD Project Researcher
**审核状态:** 待审核
