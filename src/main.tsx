import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useAppShellStore } from './app/state/appShellStore'
import './styles/app-shell.css'

if (typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window) {
  ;(window as typeof window & { __APP_SHELL_STORE__?: typeof useAppShellStore }).__APP_SHELL_STORE__ = useAppShellStore
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
