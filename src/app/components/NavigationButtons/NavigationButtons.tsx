import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppShellStore } from '../../state/appShellStore'
import styles from './NavigationButtons.module.css'

export function NavigationButtons() {
  const { navigationHistory, navigationIndex, goBack, goForward } = useAppShellStore()

  const canGoBack = navigationIndex > 0
  const canGoForward = navigationIndex < navigationHistory.length - 1

  return (
    <div className={styles.navigationButtons}>
      <button
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Go back"
        className={styles.button}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Go forward"
        className={styles.button}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
