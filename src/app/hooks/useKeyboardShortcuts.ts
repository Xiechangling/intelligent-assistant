import { useEffect } from 'react';

type ShortcutHandler = () => void;
type ShortcutMap = Record<string, ShortcutHandler>;

interface ParsedShortcut {
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
  shift: boolean;
  key: string;
}

function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta'),
    shift: parts.includes('shift'),
    key: parts[parts.length - 1]
  };
}

function matchesShortcut(event: KeyboardEvent, parsed: ParsedShortcut): boolean {
  // Handle ctrl/meta modifier
  const ctrlMatch = parsed.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
  const altMatch = parsed.alt ? event.altKey : !event.altKey;
  const shiftMatch = parsed.shift ? event.shiftKey : !event.shiftKey;
  const keyMatch = event.key.toLowerCase() === parsed.key.toLowerCase();

  return ctrlMatch && altMatch && shiftMatch && keyMatch;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Check each shortcut
      for (const [shortcut, handler] of Object.entries(shortcuts)) {
        const parsed = parseShortcut(shortcut);

        if (matchesShortcut(event, parsed)) {
          event.preventDefault();
          handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
