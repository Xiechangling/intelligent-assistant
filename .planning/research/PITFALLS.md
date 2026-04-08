# Domain Pitfalls: 官方 Claude Code Desktop UI 完全复刻

**Domain:** Large-scale UI refactoring on existing stable desktop application
**Researched:** 2026-04-08
**Context:** Tauri + React + Zustand desktop app, 100% UI rewrite while preserving backend

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major production issues.

### Pitfall 1: Big-Bang Refactoring Without Incremental Strategy
**What goes wrong:** Attempting to refactor all UI components at once (顶栏、左侧栏、中央区域、输入框) in a single phase leads to:
- Massive merge conflicts if multiple developers work in parallel
- Inability to test incrementally, discovering issues only at the end
- No rollback path if critical bugs emerge
- Extended period where the app is non-functional
- Loss of working baseline for comparison

**Why it happens:** Pressure to deliver the complete visual transformation quickly, underestimating the complexity of maintaining functionality during transition.

**Consequences:**
- 2-4 week periods where the app doesn't build or run
- E2E test suite completely broken, losing validation safety net
- Critical bugs discovered too late to fix without major rework
- User workflows broken with no way to revert

**Prevention:**
- **Strangler fig pattern:** Implement new UI components alongside old ones, controlled by feature flags
- **Component-by-component migration:** Refactor in this order:
  1. 顶栏 (least dependencies)
  2. 左侧栏 (moderate dependencies)
  3. 输入框 (high integration with backend)
  4. 中央对话区 (highest complexity)
- **Feature flags for each major component:** `ENABLE_NEW_TOPBAR`, `ENABLE_NEW_SIDEBAR`, etc.
- **Maintain dual rendering paths:** Old and new components coexist until migration complete
- **Daily build validation:** Ensure app remains functional after each day's work

**Detection:**
- Build failures lasting more than 4 hours
- E2E test pass rate drops below 50%
- Unable to demonstrate working features to stakeholders
- Git branches diverging by >1000 lines without merge

**Stage to address:** Planning phase - define incremental migration strategy before any code changes

---

### Pitfall 2: Breaking Zustand State Management During UI Refactoring
**What goes wrong:** UI refactoring inadvertently breaks state synchronization:
- Removing components that consume state without updating store structure
- Changing state shape without updating all consumers
- Breaking IPC communication between React frontend and Rust backend
- Creating race conditions with async state updates
- Losing state persistence (sessions, preferences) due to schema changes

**Why it happens:** Focus on visual changes without mapping state dependencies; assuming UI and state are decoupled when they're tightly coupled in practice.

**Consequences:**
- Sessions fail to load or save
- Project selection breaks
- Model switching doesn't persist
- Approval workflow state lost mid-execution
- User preferences reset on restart

**Prevention:**
- **State dependency audit before refactoring:**
  ```bash
  # Find all Zustand store usages
  grep -r "useShellStore\|useSessionStore\|useProjectStore" src/
  ```
- **Create state migration layer:** If state shape changes, implement migration functions
- **Test state persistence:** Add E2E tests that verify state survives app restart
- **Document state contracts:** Create `STATE_CONTRACTS.md` listing all store shapes and their consumers
- **Incremental state refactoring:** Change state shape only after all UI consumers updated
- **IPC serialization validation:** Ensure all state passed to Rust backend remains serializable (no functions, circular refs)

**Detection:**
- Console errors: "Cannot read property X of undefined"
- State resets unexpectedly during navigation
- Tauri invoke calls failing with serialization errors
- E2E tests failing on session recovery or project switching

**Stage to address:** Planning phase (audit) + Implementation phase (migration layer) + Testing phase (persistence tests)

---

### Pitfall 3: Removing Approval Flow Without Alternative Safety Mechanism
**What goes wrong:** The current system has approval gating for impactful commands. Removing the approval UI (审批流、审查面板) without implementing alternative safety mechanisms exposes users to:
- Accidental destructive operations (file deletion, git reset)
- No visibility into what commands will execute before they run
- Loss of audit trail for executed commands
- No way to review command output after execution

**Why it happens:** Treating approval UI as "extra chrome" rather than core safety feature; assuming users will be careful without guardrails.

**Consequences:**
- User accidentally approves destructive command, loses work
- No way to review what happened after command execution
- Compliance issues if audit trail is required
- User trust erosion after first accidental data loss

**Prevention:**
- **Implement inline approval in new UI:** Instead of separate panel, show approval prompt in conversation flow
- **Preserve command preview:** Show full command text before execution
- **Maintain execution history:** Store command logs even without review panel
- **Add undo/rollback for destructive operations:** Git operations should be revertable
- **Dangerous command confirmation:** Extra confirmation for `rm -rf`, `git reset --hard`, etc.
- **Auto-accept with safeguards:** If implementing auto-accept toggle, add:
  - Whitelist of safe commands (read-only operations)
  - Blacklist of dangerous commands that always require approval
  - Visual indicator when auto-accept is enabled

**Detection:**
- User reports: "I didn't mean to delete that file"
- No way to see what commands were executed in a session
- Destructive operations execute without any confirmation
- Audit logs missing command execution details

**Stage to address:** Planning phase (design alternative approval UX) + Implementation phase (inline approval) + Testing phase (destructive operation safeguards)

---

### Pitfall 4: CSS Specificity Wars and Style Conflicts
**What goes wrong:** Adding new design system CSS alongside existing styles creates:
- Specificity conflicts where old styles override new ones
- Inconsistent visual appearance (some components use old styles, some new)
- CSS bloat as both old and new styles load simultaneously
- Broken layouts due to conflicting box models or positioning
- Theme switching breaks because new components don't respect theme variables

**Why it happens:** Not removing old CSS before adding new; using different CSS methodologies (CSS modules vs inline styles vs global CSS); not establishing clear CSS architecture.

**Consequences:**
- Visual bugs that are hard to debug (styles applied from unexpected sources)
- Bundle size increases by 30-50% due to duplicate styles
- Theme switching only works for old components, not new ones
- Responsive layouts break at certain breakpoints
- Accessibility issues (contrast ratios, focus indicators) due to style conflicts

**Prevention:**
- **CSS audit before refactoring:**
  ```bash
  # Find all CSS files and their sizes
  find src/ -name "*.css" -o -name "*.scss" | xargs wc -l
  ```
- **Establish single CSS methodology:** Choose CSS Modules or CSS-in-JS, not both
- **Create design tokens file:** `src/styles/tokens.css` with all colors, spacing, typography
- **Remove old CSS as components migrate:** Delete old component CSS when new component ships
- **Use CSS layers for isolation:** `@layer legacy {}` and `@layer new {}` to control cascade
- **Scoped component styles:** Ensure each component's styles don't leak globally
- **Theme variable mapping:** Map old theme variables to new ones during transition

**Detection:**
- Styles don't match design mockups
- DevTools shows 5+ CSS rules overriding each other
- Bundle size increases significantly (check with `npm run build`)
- Theme switching partially works
- Focus indicators disappear on some components

**Stage to address:** Planning phase (CSS methodology decision) + Implementation phase (incremental CSS removal) + Testing phase (visual regression tests)

---

### Pitfall 5: E2E Test Suite Collapse During Refactoring
**What goes wrong:** UI refactoring breaks all Playwright tests because:
- Test selectors (data-testid, CSS selectors) no longer match new components
- Test flow assumptions break (e.g., approval panel location changes)
- New components render asynchronously, causing timing issues
- Tests fail intermittently due to race conditions
- Test maintenance becomes overwhelming, team stops running tests

**Why it happens:** Tests written against old UI structure; selectors coupled to implementation details; no test refactoring strategy alongside UI refactoring.

**Consequences:**
- E2E test pass rate drops from 90% to 10%
- Team loses confidence in tests, stops running them
- Regressions slip into production undetected
- Manual testing burden increases 10x
- No automated validation that refactoring preserves functionality

**Prevention:**
- **Stable test selectors:** Use `data-testid` attributes that survive UI refactoring
  ```tsx
  // Good: survives refactoring
  <button data-testid="new-session-btn">New Session</button>
  
  // Bad: breaks when CSS changes
  <button className="sidebar-action-primary">New Session</button>
  ```
- **Page Object Model (POM):** Centralize selectors in page classes
  ```typescript
  // tests/pages/SidebarPage.ts
  class SidebarPage {
    get newSessionButton() { return page.getByTestId('new-session-btn'); }
  }
  ```
- **Update tests incrementally:** Refactor tests alongside UI components, not after
- **Feature flag tests:** Write tests that work with both old and new UI
  ```typescript
  if (process.env.ENABLE_NEW_SIDEBAR) {
    await page.getByTestId('new-sidebar-session-btn').click();
  } else {
    await page.getByTestId('old-sidebar-session-btn').click();
  }
  ```
- **Visual regression tests:** Add Playwright screenshot comparison for visual changes
- **Test refactoring phase:** Allocate 20% of implementation time to test updates

**Detection:**
- E2E test pass rate drops below 70%
- Tests fail with "element not found" errors
- Tests timeout waiting for elements that never appear
- Flaky tests that pass/fail randomly
- Team skips running E2E tests before commits

**Stage to address:** Planning phase (POM setup, stable selectors) + Implementation phase (incremental test updates) + Testing phase (visual regression)

---

## Moderate Pitfalls

Issues that cause delays or require rework but don't break the product.

### Pitfall 6: Voice Input Integration Without Browser Compatibility Strategy
**What goes wrong:** Adding Web Speech API for voice input without considering:
- Browser/platform compatibility (WebView2 on Windows, WebKit on macOS)
- Microphone permission handling in Tauri
- Fallback UI when voice input unavailable
- Network dependency for speech recognition
- Language/accent recognition accuracy

**Prevention:**
- **Feature detection:** Check `'webkitSpeechRecognition' in window` before showing voice button
- **Graceful degradation:** Hide voice button if API unavailable
- **Permission handling:** Request microphone permission with clear explanation
- **Offline fallback:** Show error message if network required but unavailable
- **Testing on target platform:** Verify on Windows WebView2 specifically

**Detection:**
- Voice button visible but non-functional
- Microphone permission denied without explanation
- Voice input works in dev (Chrome) but not production (Tauri)

**Stage to address:** Implementation phase (feature detection) + Testing phase (cross-platform validation)

---

### Pitfall 7: File Attachment Drag-Drop Breaking Existing Functionality
**What goes wrong:** Adding drag-drop file attachment to input box interferes with:
- Existing text drag-drop in conversation area
- Browser's default drag-drop behavior
- Drag-drop for project file tree (if added later)
- Touch device compatibility

**Prevention:**
- **Event scope limitation:** Only handle drag events on input box, not globally
  ```typescript
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Don't let event bubble
    // Only process if dropped on input area
    if (!inputRef.current?.contains(e.target)) return;
  };
  ```
- **File type validation:** Check `e.dataTransfer.files` before processing
- **Visual feedback:** Show drop zone highlight only when dragging files
- **Cleanup:** Remove event listeners on component unmount to prevent memory leaks

**Detection:**
- Can't drag-select text in conversation area
- Dropping files anywhere triggers attachment
- Console errors about unhandled drag events

**Stage to address:** Implementation phase (scoped event handling) + Testing phase (interaction testing)

---

### Pitfall 8: Performance Regression from Over-Rendering
**What goes wrong:** UI refactoring introduces unnecessary re-renders:
- New components don't use React.memo for expensive renders
- Inline function definitions in render cause child re-renders
- Zustand store subscriptions too broad (subscribing to entire store)
- Large lists (sessions, projects) render without virtualization

**Prevention:**
- **Selective Zustand subscriptions:**
  ```typescript
  // Bad: re-renders on any store change
  const store = useShellStore();
  
  // Good: only re-renders when activeProject changes
  const activeProject = useShellStore(state => state.activeProject);
  ```
- **Memoize expensive components:**
  ```typescript
  const SessionListItem = React.memo(({ session }) => {
    // Expensive render logic
  });
  ```
- **Stable callback references:**
  ```typescript
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  ```
- **Virtual scrolling for long lists:** Use `react-window` for session/project lists >50 items
- **Performance profiling:** Use React DevTools Profiler before and after refactoring

**Detection:**
- App feels sluggish during typing or scrolling
- React DevTools shows excessive re-renders
- CPU usage spikes during normal interactions
- Input lag when typing in message box

**Stage to address:** Implementation phase (memoization) + Testing phase (performance profiling)

---

### Pitfall 9: Keyboard Shortcuts Breaking or Conflicting
**What goes wrong:** UI refactoring breaks existing keyboard shortcuts:
- Shortcuts registered in old components no longer work
- New components register conflicting shortcuts
- Focus management breaks (Tab order, focus trapping)
- Shortcuts work inconsistently depending on focus location

**Prevention:**
- **Centralized shortcut registry:** `src/hooks/useKeyboardShortcuts.ts`
  ```typescript
  const shortcuts = {
    'Ctrl+N': 'new-session',
    'Ctrl+K': 'search',
    'Ctrl+,': 'settings',
  };
  ```
- **Document all shortcuts:** Create `KEYBOARD_SHORTCUTS.md`
- **Test focus management:** Verify Tab order follows visual layout
- **Modal focus trapping:** Ensure focus stays within modals, returns on close
- **Conflict detection:** Log warning if multiple components register same shortcut

**Detection:**
- Shortcuts stop working after refactoring
- Pressing shortcut triggers multiple actions
- Tab order jumps around illogically
- Can't escape from modal with Esc

**Stage to address:** Planning phase (shortcut audit) + Implementation phase (centralized registry) + Testing phase (keyboard-only navigation)

---

### Pitfall 10: Theme Switching Partially Broken
**What goes wrong:** New components don't respect theme system:
- Hardcoded colors instead of theme variables
- Theme toggle updates old components but not new ones
- Inconsistent dark mode appearance (some components light, some dark)
- Flash of wrong theme on app startup

**Prevention:**
- **Use CSS custom properties exclusively:**
  ```css
  /* Bad */
  background: #ffffff;
  
  /* Good */
  background: var(--color-background);
  ```
- **Theme variable mapping:** Ensure all new components use theme variables
- **Test both themes:** Manually verify every new component in light and dark mode
- **Theme persistence:** Verify theme choice persists across app restarts
- **Startup theme flash prevention:** Apply theme class before first render

**Detection:**
- Some components don't change color when switching themes
- Console warnings about missing CSS variables
- Theme resets to default on app restart
- White flash on startup in dark mode

**Stage to address:** Implementation phase (CSS variables) + Testing phase (theme switching validation)

---

## Minor Pitfalls

Issues that cause minor UX degradation or technical debt.

### Pitfall 11: Inconsistent Icon System
**What goes wrong:** Mixing icon libraries or styles:
- Some components use old icon set, some use new
- Inconsistent icon sizes, weights, or styles
- Icons don't align properly with text
- Missing icons for new features

**Prevention:**
- **Single icon library:** Choose one (e.g., Lucide React, Heroicons)
- **Icon component wrapper:** Standardize size and color
  ```tsx
  <Icon name="plus" size={16} />
  ```
- **Icon audit:** List all icons used, ensure consistency

**Stage to address:** Planning phase (icon library choice) + Implementation phase (consistent usage)

---

### Pitfall 12: Empty State Design Inconsistency
**What goes wrong:** Empty states (no sessions, no projects) don't match new design:
- Old empty state UI still shows
- Missing 大熊猫吉祥物 in some empty states
- Inconsistent messaging or CTAs

**Prevention:**
- **Centralized empty state component:** `<EmptyState icon={pandaIcon} message="..." />`
- **Audit all empty states:** Sessions, projects, search results, etc.

**Stage to address:** Implementation phase (component creation) + Testing phase (empty state validation)

---

### Pitfall 13: Responsive Layout Breakage
**What goes wrong:** New UI doesn't handle window resizing:
- Sidebar doesn't collapse on narrow windows
- Input box overflows on small screens
- Horizontal scrollbars appear unexpectedly

**Prevention:**
- **Test at multiple window sizes:** 1024px, 1280px, 1920px widths
- **Responsive CSS:** Use flexbox/grid with proper min-width constraints
- **Minimum window size:** Define minimum viable window size (e.g., 1024x768)

**Stage to address:** Implementation phase (responsive CSS) + Testing phase (resize testing)

---

### Pitfall 14: Accessibility Regressions
**What goes wrong:** New UI loses accessibility features:
- Missing ARIA labels on new buttons
- Focus indicators invisible or missing
- Screen reader announcements broken
- Keyboard navigation incomplete

**Prevention:**
- **ARIA label audit:** Every interactive element needs accessible name
- **Focus indicator testing:** Verify visible focus on all interactive elements
- **Screen reader testing:** Test with NVDA on Windows
- **Keyboard navigation testing:** Complete all workflows with keyboard only

**Stage to address:** Implementation phase (ARIA labels) + Testing phase (accessibility audit)

---

### Pitfall 15: Animation Performance Issues
**What goes wrong:** Adding animations/transitions causes jank:
- Sidebar slide animation drops frames
- Modal fade-in stutters
- Scroll performance degrades

**Prevention:**
- **Use transform and opacity only:** Avoid animating layout properties
- **GPU acceleration:** `will-change: transform` for animated elements
- **Reduce motion preference:** Respect `prefers-reduced-motion`
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
  ```

**Stage to address:** Implementation phase (performant animations) + Testing phase (frame rate monitoring)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 顶栏重构 | Breaking window controls (minimize, maximize, close) | Test window controls on Windows specifically; verify Tauri window API integration |
| 左侧栏重构 | Breaking project/session selection state | Maintain state contracts; test selection persistence |
| 中央对话区重构 | Breaking streaming message rendering | Preserve streaming logic; test with long responses |
| 输入框重构 | Breaking message submission, file attachment, model selection | Test all input modes; verify Tauri IPC for file handling |
| 审批流移除 | Losing command safety mechanism | Implement inline approval before removing panel |
| 审查面板移除 | Losing command output visibility | Implement output display in conversation flow |
| 三模式切换添加 | Mode state not persisting or syncing | Add mode to session state; test mode switching |
| 语音输入添加 | Browser compatibility issues on Windows | Feature detection; graceful degradation |

---

## Integration Pitfalls

Specific to integrating new UI with existing backend.

### Pitfall 16: Tauri IPC Serialization Breakage
**What goes wrong:** New UI components pass non-serializable data to Rust backend:
- Functions in state objects
- Circular references
- Large binary data without streaming

**Prevention:**
- **Validate serialization:** Test all Tauri invoke calls with complex data
- **Use Tauri events for streaming:** Don't pass large payloads through invoke
- **Type safety:** Use TypeScript interfaces that match Rust structs

**Detection:**
- Console errors: "Failed to serialize"
- Tauri invoke calls failing silently
- Data corruption when passing to backend

**Stage to address:** Implementation phase (serialization validation) + Testing phase (IPC integration tests)

---

### Pitfall 17: Session State Desynchronization
**What goes wrong:** New UI updates frontend state but doesn't sync to backend:
- Session metadata (model, title) updates in UI but not persisted
- Backend continues using old session state
- Session recovery loads stale state

**Prevention:**
- **Bidirectional state sync:** UI changes trigger backend updates via Tauri commands
- **State reconciliation on load:** Verify frontend and backend state match on session load
- **Optimistic updates with rollback:** Update UI immediately, rollback if backend fails

**Detection:**
- Session state resets after app restart
- Model selection doesn't persist
- Session title changes don't save

**Stage to address:** Implementation phase (state sync) + Testing phase (persistence validation)

---

## Highest-Priority Pitfalls for v2.3

1. **Big-bang refactoring without incremental strategy** - Will break the entire app for weeks
2. **Breaking Zustand state management** - Will lose sessions, projects, preferences
3. **Removing approval flow without alternative** - Will expose users to destructive operations
4. **E2E test suite collapse** - Will lose validation safety net
5. **CSS specificity wars** - Will create visual bugs that are hard to debug

## Bottom Line

The biggest failure mode for v2.3 is **attempting to refactor everything at once without incremental validation**. The roadmap should prioritize:

1. **Strangler fig pattern** with feature flags for each major component
2. **State contract preservation** before any UI changes
3. **Inline approval mechanism** before removing approval panel
4. **Test refactoring strategy** alongside UI refactoring
5. **CSS methodology decision** before writing new styles

Success means: **New UI ships with 100% feature parity, zero data loss, and E2E tests still passing at 90%+**.

---

## Sources

**Web Search Results:**
- Tauri React state management refactoring patterns and IPC performance considerations
- React component refactoring pitfalls including state management, hooks, and lifecycle issues
- Large-scale UI refactoring best practices: incremental approach, feature flags, strangler fig pattern
- Desktop application UI redesign migration strategies: phased rollout, design system first
- Feature removal impact on user workflows and approval workflow considerations
- Playwright test maintenance: Page Object Model, stable selectors, data-testid best practices
- Web Speech API browser compatibility for Electron/Tauri desktop applications
- CSS specificity conflicts during design system migration
- Zustand state management refactoring and migration patterns
- React performance optimization: memo, useMemo, useCallback patterns
- Keyboard shortcuts accessibility and focus management
- File attachment drag-drop implementation considerations

**Confidence Level:** MEDIUM
- Based on general web search results for React/Tauri refactoring patterns
- Specific to the project context (v2.3 UI refactoring scope)
- Validated against common refactoring pitfalls in production applications
- Some pitfalls derived from project-specific context (approval flow, Zustand stores, Playwright tests)
