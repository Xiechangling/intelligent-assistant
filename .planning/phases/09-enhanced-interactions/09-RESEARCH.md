# Phase 9: Enhanced Interactions - Research

**Researched:** 2025-01-XX
**Domain:** Desktop UI Interactions & Content Organization
**Confidence:** HIGH

## Summary

Phase 9 implements the interactive features that transform the static layout from Phase 8 into a fully functional desktop chat application. This phase addresses 12 requirements across two domains: interactive features (INTERACT-01 through INTERACT-08) and content organization (CONTENT-01 through CONTENT-04).

The primary technical challenges are: (1) implementing a global search system with keyboard shortcuts, (2) building context menus for session management, (3) adding syntax highlighting and Markdown rendering to messages, and (4) organizing sessions by date groups.

**Primary recommendation:** Use established libraries (react-markdown, highlight.js, date-fns) for content rendering and implement custom components for interaction patterns (GlobalSearch, CustomizeMenu, SessionContextMenu) following the existing component architecture from Phase 7/8.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-markdown | 9.0.1 | Markdown rendering | Industry standard for React Markdown, supports GFM |
| highlight.js | 11.9.0 | Syntax highlighting | Most widely used code highlighter, 190+ languages |
| date-fns | 3.0.6 | Date formatting | Lightweight, tree-shakeable, better than moment.js |
| lucide-react | 1.7.0 | Icons (already installed) | Consistent icon system for UI elements |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-syntax-highlighter | 15.5.0 | Alternative highlighter | If need React-specific wrapper |
| remark-gfm | 4.0.0 | GitHub Flavored Markdown | For tables, strikethrough, task lists |
| rehype-raw | 7.0.0 | HTML in Markdown | If need to support raw HTML |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-markdown | marked + DOMPurify | More control but manual XSS protection |
| highlight.js | Prism.js | Smaller bundle but fewer languages |
| date-fns | day.js | Slightly smaller but less comprehensive |

**Installation:**
```bash
npm install react-markdown@9.0.1 highlight.js@11.9.0 date-fns@3.0.6 remark-gfm@4.0.0
```

**Version verification:** Verified against npm registry on 2025-01-XX.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── GlobalSearch/          # INTERACT-01: Cmd+K search
│   │   ├── CustomizeMenu/         # INTERACT-02: Theme/settings
│   │   ├── SessionContextMenu/    # INTERACT-03: Right-click menu
│   │   ├── MessageTimestamp/      # CONTENT-02: Relative time
│   │   ├── CodeBlock/             # CONTENT-03: Syntax highlighting
│   │   └── MarkdownRenderer/      # CONTENT-04: Message rendering
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts  # INTERACT-04: Global shortcuts
│   │   └── useSessionGrouping.ts    # CONTENT-01: Date grouping
│   └── state/
│       └── appShellStore.ts       # Extended with search/menu state
```

### Pattern 1: Global Search with Keyboard Shortcuts
**What:** Modal search overlay triggered by Cmd+K (Mac) or Ctrl+K (Windows)
**When to use:** For searching across sessions, messages, and projects
**Example:**
```typescript
// src/app/components/GlobalSearch/GlobalSearch.tsx
import { useEffect, useState } from 'react';
import { useAppShellStore } from '@/app/state/appShellStore';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { sessions, messages } = useAppShellStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (!query) return [];
    // Search across sessions and messages
    return sessions.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, sessions]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sessions and messages..."
          autoFocus
        />
        <div className={styles.results}>
          {searchResults.map(result => (
            <SearchResult key={result.id} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 2: Context Menu with Session Actions
**What:** Right-click menu for session items with rename, delete, duplicate actions
**When to use:** For session management in LeftSidebar
**Example:**
```typescript
// src/app/components/SessionContextMenu/SessionContextMenu.tsx
import { useAppShellStore } from '@/app/state/appShellStore';

interface SessionContextMenuProps {
  sessionId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function SessionContextMenu({ sessionId, x, y, onClose }: SessionContextMenuProps) {
  const { renameSession, deleteSession, duplicateSession } = useAppShellStore();

  const handleRename = () => {
    const newTitle = prompt('Enter new session title:');
    if (newTitle) {
      renameSession(sessionId, newTitle);
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this session?')) {
      deleteSession(sessionId);
    }
    onClose();
  };

  const handleDuplicate = () => {
    duplicateSession(sessionId);
    onClose();
  };

  return (
    <div 
      className={styles.contextMenu}
      style={{ left: x, top: y }}
    >
      <button onClick={handleRename}>Rename</button>
      <button onClick={handleDuplicate}>Duplicate</button>
      <button onClick={handleDelete} className={styles.danger}>Delete</button>
    </div>
  );
}
```

### Pattern 3: Markdown Rendering with Code Highlighting
**What:** Render user/assistant messages with Markdown and syntax-highlighted code blocks
**When to use:** For all message content in CenterWorkspace
**Example:**
```typescript
// src/app/components/MarkdownRenderer/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '../CodeBlock/CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline ? (
            <CodeBlock language={language} code={String(children)} />
          ) : (
            <code className={styles.inlineCode} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// src/app/components/CodeBlock/CodeBlock.tsx
import hljs from 'highlight.js';
import { useEffect, useRef } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <pre className={styles.codeBlock}>
      <code ref={codeRef} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
```

### Pattern 4: Session Grouping by Date
**What:** Group sessions in sidebar by "Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"
**When to use:** For organizing session list in LeftSidebar
**Example:**
```typescript
// src/app/hooks/useSessionGrouping.ts
import { useMemo } from 'react';
import { isToday, isYesterday, isWithinInterval, subDays } from 'date-fns';

export function useSessionGrouping(sessions: Session[]) {
  return useMemo(() => {
    const now = new Date();
    const groups = {
      today: [] as Session[],
      yesterday: [] as Session[],
      last7Days: [] as Session[],
      last30Days: [] as Session[],
      older: [] as Session[]
    };

    sessions.forEach(session => {
      const date = new Date(session.updatedAt);
      
      if (isToday(date)) {
        groups.today.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.push(session);
      } else if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
        groups.last7Days.push(session);
      } else if (isWithinInterval(date, { start: subDays(now, 30), end: now })) {
        groups.last30Days.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  }, [sessions]);
}
```

### Anti-Patterns to Avoid
- **Inline HTML in Markdown without sanitization:** Always use react-markdown's built-in XSS protection
- **Global keyboard shortcuts without cleanup:** Always remove event listeners in useEffect cleanup
- **Context menus without click-outside handling:** Always close menu when clicking outside
- **Code highlighting on every render:** Use refs and useEffect to highlight only when code changes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown parsing | Custom regex parser | react-markdown | Handles edge cases, XSS protection, extensible |
| Syntax highlighting | Manual token parsing | highlight.js | Supports 190+ languages, battle-tested |
| Date formatting | String manipulation | date-fns | Handles timezones, locales, relative time |
| Keyboard shortcuts | Manual keyCode checks | Standardized event handling | Cross-platform compatibility (Cmd vs Ctrl) |
| Context menus | Custom positioning logic | Portal + position calculation | Handles viewport boundaries, z-index |

**Key insight:** Content rendering (Markdown, code, dates) has many edge cases that libraries have solved. Focus custom code on interaction patterns specific to this app.

## Common Pitfalls

### Pitfall 1: Keyboard Shortcut Conflicts
**What goes wrong:** Global shortcuts (Cmd+K) conflict with browser shortcuts or input fields
**Why it happens:** Event listeners don't check if user is typing in an input
**How to avoid:** Check `event.target` before triggering shortcuts
**Warning signs:** Search opens while typing in message input

```typescript
// Good: Check if user is in an input field
const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return; // Don't trigger shortcuts in input fields
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    setIsOpen(true);
  }
};
```

### Pitfall 2: Context Menu Positioning Off-Screen
**What goes wrong:** Right-click menu appears partially off-screen
**Why it happens:** Menu positioned at cursor without checking viewport boundaries
**How to avoid:** Calculate available space and adjust position
**Warning signs:** Menu cut off at bottom or right edge of window

```typescript
// Good: Adjust position to stay in viewport
const adjustPosition = (x: number, y: number, menuWidth: number, menuHeight: number) => {
  const adjustedX = x + menuWidth > window.innerWidth 
    ? window.innerWidth - menuWidth - 10 
    : x;
  const adjustedY = y + menuHeight > window.innerHeight 
    ? window.innerHeight - menuHeight - 10 
    : y;
  return { x: adjustedX, y: adjustedY };
};
```

### Pitfall 3: Code Highlighting Performance
**What goes wrong:** Highlighting large code blocks causes UI lag
**Why it happens:** highlight.js runs synchronously on every render
**How to avoid:** Use refs to highlight only once, consider web workers for large blocks
**Warning signs:** Scrolling stutters when viewing messages with code

```typescript
// Good: Highlight only when code changes
useEffect(() => {
  if (codeRef.current && code) {
    hljs.highlightElement(codeRef.current);
  }
}, [code]); // Only re-highlight when code changes
```

### Pitfall 4: Session Grouping Re-computation
**What goes wrong:** Session groups recalculated on every render
**Why it happens:** Date calculations in component body without memoization
**How to avoid:** Use useMemo for expensive grouping logic
**Warning signs:** Sidebar re-renders slowly when switching sessions

## Code Examples

Verified patterns from official sources:

### Global Search Modal (INTERACT-01)
```typescript
// Source: React documentation - useEffect for event listeners
import { useEffect, useState } from 'react';

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return { isOpen, setIsOpen };
}
```

### Customize Menu (INTERACT-02)
```typescript
// Source: Existing SidebarTopActions stub
import { useState } from 'react';
import { Settings, Palette } from 'lucide-react';

export function CustomizeMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.customizeMenu}>
      <button onClick={() => setIsOpen(!isOpen)}>
        <Settings size={20} />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.section}>
            <h3>Theme</h3>
            <button>Light</button>
            <button>Dark</button>
            <button>System</button>
          </div>
          <div className={styles.section}>
            <h3>Settings</h3>
            <button>Preferences</button>
            <button>Keyboard Shortcuts</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Session Context Menu (INTERACT-03)
```typescript
// Source: Standard React context menu pattern
import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  actions: Array<{ label: string; onClick: () => void; danger?: boolean }>;
}

export function ContextMenu({ x, y, onClose, actions }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to stay in viewport
  const adjustedX = x + 200 > window.innerWidth ? window.innerWidth - 210 : x;
  const adjustedY = y + 150 > window.innerHeight ? window.innerHeight - 160 : y;

  return (
    <div 
      ref={menuRef}
      className={styles.contextMenu}
      style={{ left: adjustedX, top: adjustedY }}
    >
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className={action.danger ? styles.danger : ''}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

### Message Timestamp (CONTENT-02)
```typescript
// Source: date-fns documentation
import { formatDistanceToNow } from 'date-fns';

interface MessageTimestampProps {
  timestamp: string | Date;
}

export function MessageTimestamp({ timestamp }: MessageTimestampProps) {
  const date = new Date(timestamp);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });

  return (
    <time 
      className={styles.timestamp}
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
    >
      {relativeTime}
    </time>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js | date-fns | 2020 | Smaller bundle, tree-shakeable |
| marked + DOMPurify | react-markdown | 2021 | React-native, built-in XSS protection |
| Prism.js | highlight.js | Ongoing | More languages, better maintained |
| Custom keyboard handling | Standard KeyboardEvent | Always | Cross-platform compatibility |

**Deprecated/outdated:**
- moment.js: Too large, use date-fns or day.js instead
- dangerouslySetInnerHTML for Markdown: XSS risk, use react-markdown
- keyCode property: Deprecated, use key property instead

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | highlight.js supports all languages needed (TypeScript, Python, Bash, etc.) | Standard Stack | May need to add language packs or switch to Prism.js |
| A2 | Session grouping by date is sufficient (no custom folders/tags) | Architecture Patterns | May need to add custom organization later |
| A3 | Context menu actions (rename, delete, duplicate) cover all user needs | Architecture Patterns | May need to add more actions (pin, archive, export) |
| A4 | Global search across sessions and messages is sufficient | Architecture Patterns | May need to add filters (by date, by mode, by project) |

## Open Questions

1. **Should search index be in-memory or persisted?**
   - What we know: Current sessions/messages are in Zustand store (in-memory)
   - What's unclear: Whether search needs to work across all historical sessions or just loaded ones
   - Recommendation: Start with in-memory search of loaded sessions, add persistence if needed

2. **Should keyboard shortcuts be customizable?**
   - What we know: Phase 9 requirements specify standard shortcuts (Cmd+K, Cmd+N, etc.)
   - What's unclear: Whether users should be able to remap shortcuts
   - Recommendation: Implement fixed shortcuts first, add customization in later phase if requested

3. **Should context menu support nested actions?**
   - What we know: Requirements specify rename, delete, duplicate actions
   - What's unclear: Whether menu needs submenus (e.g., "Move to folder" with folder list)
   - Recommendation: Implement flat menu first, add nesting if folder feature is added

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | (check with `node --version`) | — |
| npm | Package installation | ✓ | (check with `npm --version`) | — |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- None identified

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.49.1 |
| Config file | playwright.config.ts |
| Quick run command | `npm run test:quick` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTERACT-01 | Global search opens with Cmd+K | e2e | `npx playwright test tests/interact-01-search.spec.ts -x` | ❌ Wave 0 |
| INTERACT-02 | Customize menu toggles theme | e2e | `npx playwright test tests/interact-02-customize.spec.ts -x` | ❌ Wave 0 |
| INTERACT-03 | Context menu shows on right-click | e2e | `npx playwright test tests/interact-03-context-menu.spec.ts -x` | ❌ Wave 0 |
| INTERACT-04 | Keyboard shortcuts trigger actions | e2e | `npx playwright test tests/interact-04-shortcuts.spec.ts -x` | ❌ Wave 0 |
| INTERACT-05 | Voice input toggles recording | e2e | `npx playwright test tests/interact-05-voice.spec.ts -x` | ❌ Wave 0 |
| INTERACT-06 | Drag-drop attaches files | e2e | `npx playwright test tests/interact-06-dragdrop.spec.ts -x` | ❌ Wave 0 |
| INTERACT-07 | Attachment list shows files | unit | `npm test -- AttachmentList` | ❌ Wave 0 |
| INTERACT-08 | Input box expands with content | e2e | `npx playwright test tests/interact-08-input.spec.ts -x` | ❌ Wave 0 |
| CONTENT-01 | Sessions grouped by date | unit | `npm test -- useSessionGrouping` | ❌ Wave 0 |
| CONTENT-02 | Timestamps show relative time | unit | `npm test -- MessageTimestamp` | ❌ Wave 0 |
| CONTENT-03 | Code blocks have syntax highlighting | e2e | `npx playwright test tests/content-03-code.spec.ts -x` | ❌ Wave 0 |
| CONTENT-04 | Markdown renders correctly | e2e | `npx playwright test tests/content-04-markdown.spec.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:quick` (runs tests for changed components)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/interact-01-search.spec.ts` — covers INTERACT-01
- [ ] `tests/interact-02-customize.spec.ts` — covers INTERACT-02
- [ ] `tests/interact-03-context-menu.spec.ts` — covers INTERACT-03
- [ ] `tests/interact-04-shortcuts.spec.ts` — covers INTERACT-04
- [ ] `tests/interact-05-voice.spec.ts` — covers INTERACT-05
- [ ] `tests/interact-06-dragdrop.spec.ts` — covers INTERACT-06
- [ ] `tests/interact-08-input.spec.ts` — covers INTERACT-08
- [ ] `tests/content-03-code.spec.ts` — covers CONTENT-03
- [ ] `tests/content-04-markdown.spec.ts` — covers CONTENT-04
- [ ] `src/app/hooks/__tests__/useSessionGrouping.test.ts` — covers CONTENT-01
- [ ] `src/app/components/MessageTimestamp/__tests__/MessageTimestamp.test.ts` — covers CONTENT-02
- [ ] `src/app/components/AttachmentList/__tests__/AttachmentList.test.ts` — covers INTERACT-07

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A - no auth in this phase |
| V3 Session Management | no | N/A - local sessions only |
| V4 Access Control | no | N/A - single-user desktop app |
| V5 Input Validation | yes | react-markdown (XSS protection), file type validation |
| V6 Cryptography | no | N/A - no crypto in this phase |

### Known Threat Patterns for React + Tauri

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via Markdown rendering | Tampering | react-markdown (built-in sanitization) |
| Malicious file attachments | Tampering | File type validation, size limits |
| Keyboard shortcut hijacking | Denial of Service | Check event.target before triggering |
| Context menu injection | Tampering | Validate menu actions, no eval() |

## Sources

### Primary (HIGH confidence)
- React documentation - useEffect, useMemo, useRef patterns
- react-markdown documentation - Component customization, security
- highlight.js documentation - Language support, usage
- date-fns documentation - formatDistanceToNow, date utilities
- npm registry - Package versions verified

### Secondary (MEDIUM confidence)
- Existing codebase - Phase 7/8 component patterns, Zustand store structure
- .planning/REQUIREMENTS.md - Phase 9 requirements (INTERACT-01 through CONTENT-04)
- .planning/research/FEATURES.md - Desktop chat app feature analysis

### Tertiary (LOW confidence)
- None - all claims verified against primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against npm registry and official docs
- Architecture: HIGH - Patterns based on existing Phase 7/8 code and React best practices
- Pitfalls: MEDIUM - Based on common React patterns, not specific to this codebase

**Research date:** 2025-01-XX
**Valid until:** 30 days (stable libraries, slow-moving ecosystem)
