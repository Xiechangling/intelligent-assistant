import { useEffect } from 'react'
import { AppShell } from './app/layout/AppShell'
import { useAppShellStore } from './app/state/appShellStore'

function App() {
  const attemptRecovery = useAppShellStore((state) => state.attemptRecovery)

  useEffect(() => {
    attemptRecovery().catch(() => undefined)
  }, [attemptRecovery])

  return <AppShell />
}

export default App
