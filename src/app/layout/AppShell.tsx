import React from 'react'
import { CenterWorkspace } from './CenterWorkspace'
import { LeftSidebar } from './LeftSidebar'
import { TopToolbar } from './TopToolbar'
import { GlobalSearch } from '../components/GlobalSearch'
import { useAppShellStore } from '../state/appShellStore'
import { useGlobalKeybindings } from '../hooks/useGlobalKeybindings'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function AppShell() {
  const { keybindingsEnabled, macOSOptionMappingEnabled, theme, createProjectSession, setCurrentMode, goBack, goForward } = useAppShellStore()
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Apply theme immediately on mount to prevent flash
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    const effectiveTheme = storedTheme || 'dark';

    if (effectiveTheme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
  }, []);

  // Apply theme and detect system changes
  React.useEffect(() => {
    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    };

    if (theme === 'auto') {
      // Detect system theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply explicit theme
      applyTheme(theme);
    }
  }, [theme]);

  // Register global keybindings
  useGlobalKeybindings({
    enabled: keybindingsEnabled,
    macOSOptionMapping: macOSOptionMappingEnabled,
  })

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+f': () => setSearchOpen(true),
    'escape': () => setSearchOpen(false),
    'ctrl+n': () => createProjectSession(),
    'ctrl+1': () => setCurrentMode('chat'),
    'ctrl+2': () => setCurrentMode('search'),
    'ctrl+3': () => setCurrentMode('navigate'),
    'alt+arrowleft': () => goBack(),
    'alt+arrowright': () => goForward(),
  })

  return (
    <div className="app-shell" data-testid="app-shell" data-theme={theme}>
      <header className="app-shell__top" data-testid="top-toolbar">
        <TopToolbar />
      </header>
      <aside className="app-shell__left" data-testid="left-sidebar">
        <LeftSidebar onSearchClick={() => setSearchOpen(true)} />
      </aside>
      <main className="app-shell__center" data-testid="center-workspace">
        <CenterWorkspace />
      </main>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
