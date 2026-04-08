import React from 'react'
import { BottomPanel } from './BottomPanel'
import { CenterWorkspace } from './CenterWorkspace'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopToolbar } from './TopToolbar'
import { useAppShellStore } from '../state/appShellStore'
import { useGlobalKeybindings } from '../hooks/useGlobalKeybindings'

export function AppShell() {
  const { bottomPanelExpanded, executionRecord, pendingProposal, rightPanelOpen, rightPanelWidth, keybindingsEnabled, macOSOptionMappingEnabled, theme } = useAppShellStore()
  const showBottomPanel = bottomPanelExpanded || Boolean(pendingProposal) || Boolean(executionRecord)

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

  return (
    <div
      className={`app-shell ${rightPanelOpen ? 'app-shell--drawer-open' : ''} ${showBottomPanel ? 'app-shell--bottom-open' : ''}`}
      style={{ '--right-panel-width': `${rightPanelWidth}px` } as React.CSSProperties}
    >
      <header className="app-shell__top app-shell__top--sticky">
        <TopToolbar />
      </header>
      <aside className="app-shell__left">
        <LeftSidebar />
      </aside>
      <main className="app-shell__center">
        <CenterWorkspace />
      </main>
      <div className={`app-shell__drawer ${rightPanelOpen ? 'app-shell__drawer--open' : ''}`}>
        <RightPanel />
      </div>
      {showBottomPanel ? (
        <section className="app-shell__bottom">
          <BottomPanel />
        </section>
      ) : null}
    </div>
  )
}
