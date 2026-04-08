import { useAppShellStore } from '../../state/appShellStore'
import styles from './ModeTabs.module.css'

export function ModeTabs() {
  const currentMode = useAppShellStore((state) => state.currentMode)
  const setCurrentMode = useAppShellStore((state) => state.setCurrentMode)

  return (
    <div className={styles.container} role="tablist" aria-label="Mode selection">
      <button
        type="button"
        role="tab"
        aria-selected={currentMode === 'chat'}
        className={currentMode === 'chat' ? styles.tabActive : styles.tab}
        onClick={() => setCurrentMode('chat')}
      >
        Chat
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentMode === 'search'}
        className={currentMode === 'search' ? styles.tabActive : styles.tab}
        onClick={() => setCurrentMode('search')}
      >
        Cowork
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentMode === 'navigate'}
        className={currentMode === 'navigate' ? styles.tabActive : styles.tab}
        onClick={() => setCurrentMode('navigate')}
      >
        Code
      </button>
    </div>
  )
}
