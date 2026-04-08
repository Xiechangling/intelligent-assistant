import { BottomPanel } from './BottomPanel'
import { CenterWorkspace } from './CenterWorkspace'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopToolbar } from './TopToolbar'
import { useAppShellStore } from '../state/appShellStore'

export function AppShell() {
  const { bottomPanelExpanded, executionRecord, pendingProposal, rightPanelOpen } = useAppShellStore()
  const showBottomPanel = bottomPanelExpanded || Boolean(pendingProposal) || Boolean(executionRecord)

  return (
    <div className={`app-shell ${rightPanelOpen ? 'app-shell--drawer-open' : ''} ${showBottomPanel ? 'app-shell--bottom-open' : ''}`}>
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
