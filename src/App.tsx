import { useEffect } from 'react'
import { AppShell } from './app/layout/AppShell'
import { useAppShellStore } from './app/state/appShellStore'

function App() {
  const attemptRecovery = useAppShellStore((state) => state.attemptRecovery)

  useEffect(() => {
    if (typeof window !== 'undefined' && '__PLAYWRIGHT_SKIP_RECOVERY__' in window) {
      return
    }

    attemptRecovery().catch(() => undefined)
  }, [attemptRecovery])

  return <AppShell />
}

export default App
