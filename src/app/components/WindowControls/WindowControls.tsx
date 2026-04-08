import { Minus, Square, X } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import styles from './WindowControls.module.css'

export function WindowControls() {
  const appWindow = getCurrentWindow()

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleClose = () => appWindow.close()

  return (
    <div className={styles.windowControls}>
      <button onClick={handleMinimize} aria-label="Minimize" className={styles.button}>
        <Minus size={16} />
      </button>
      <button onClick={handleMaximize} aria-label="Maximize" className={styles.button}>
        <Square size={16} />
      </button>
      <button onClick={handleClose} aria-label="Close" className={styles.closeButton}>
        <X size={16} />
      </button>
    </div>
  )
}
