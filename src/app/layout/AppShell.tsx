import { BottomPanel } from './BottomPanel'
import { CenterWorkspace } from './CenterWorkspace'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopToolbar } from './TopToolbar'

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__top">
        <TopToolbar />
      </header>
      <aside className="app-shell__left">
        <LeftSidebar />
      </aside>
      <main className="app-shell__center">
        <CenterWorkspace />
      </main>
      <aside className="app-shell__right">
        <RightPanel />
      </aside>
      <section className="app-shell__bottom">
        <BottomPanel />
      </section>
    </div>
  )
}
