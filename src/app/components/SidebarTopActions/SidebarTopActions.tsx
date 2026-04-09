import { Plus, Search, Settings } from 'lucide-react'
import { useAppShellStore } from '../../state/appShellStore'
import { CustomizeMenu } from '../CustomizeMenu'
import { useState, useRef } from 'react'
import styles from './SidebarTopActions.module.css'

export function SidebarTopActions({ onSearchClick }: { onSearchClick?: () => void }) {
  const { createProjectSession } = useAppShellStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const customizeButtonRef = useRef<HTMLButtonElement>(null)

  const handleNewSession = () => {
    createProjectSession().catch(() => undefined)
  }

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick()
    }
  }

  const handleCustomize = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className={styles.topActions}>
      <button
        onClick={handleNewSession}
        className={styles.primaryButton}
        aria-label="New session"
      >
        <Plus size={18} strokeWidth={2} />
        <span>New session</span>
      </button>
      <div className={styles.iconButtons}>
        <button
          onClick={handleSearch}
          className={styles.iconButton}
          aria-label="Search"
        >
          <Search size={18} strokeWidth={2} />
        </button>
        <button
          ref={customizeButtonRef}
          onClick={handleCustomize}
          className={styles.iconButton}
          aria-label="Customize"
        >
          <Settings size={18} strokeWidth={2} />
        </button>
      </div>
      <CustomizeMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={customizeButtonRef}
      />
    </div>
  )
}
