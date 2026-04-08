import { Plus, Search, Settings } from 'lucide-react'
import { useAppShellStore } from '../../state/appShellStore'
import styles from './SidebarTopActions.module.css'

export function SidebarTopActions() {
  const { createProjectSession } = useAppShellStore()

  const handleNewSession = () => {
    createProjectSession().catch(() => undefined)
  }

  const handleSearch = () => {
    // Stub for Phase 9
    console.log('Search clicked - to be implemented in Phase 9')
  }

  const handleCustomize = () => {
    // Stub for Phase 9
    console.log('Customize clicked - to be implemented in Phase 9')
  }

  return (
    <div className={styles.topActions}>
      <button
        onClick={handleNewSession}
        className={styles.primaryButton}
        aria-label="New session"
      >
        <Plus size={20} />
        <span>New session</span>
      </button>
      <div className={styles.iconButtons}>
        <button
          onClick={handleSearch}
          className={styles.iconButton}
          aria-label="Search"
        >
          <Search size={20} />
        </button>
        <button
          onClick={handleCustomize}
          className={styles.iconButton}
          aria-label="Customize"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
