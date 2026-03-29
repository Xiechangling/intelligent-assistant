import { useAppShellStore } from '../state/appShellStore'

export function RightPanel() {
  const {
    activeProjectPath,
    credentialStatus,
    globalDefaultModel,
    mode,
    rightPanelView,
    setRightPanelView,
  } = useAppShellStore()

  return (
    <div className="right-panel">
      <div className="right-panel__tabs">
        <button
          className={`right-panel__tab ${rightPanelView === 'context' ? 'right-panel__tab--active' : ''}`}
          onClick={() => setRightPanelView('context')}
        >
          Context
        </button>
        <button
          className={`right-panel__tab ${rightPanelView === 'settings' ? 'right-panel__tab--active' : ''}`}
          onClick={() => setRightPanelView('settings')}
        >
          Settings
        </button>
      </div>
      <div className="right-panel__content">
        {rightPanelView === 'context' ? (
          <>
            <h2>Current Context</h2>
            <ul>
              <li>Mode: {mode}</li>
              <li>Project: {activeProjectPath ?? 'None selected'}</li>
              <li>Model: {globalDefaultModel}</li>
              <li>Credential: {credentialStatus}</li>
            </ul>
          </>
        ) : (
          <>
            <h2>Settings</h2>
            <p>Mode, project, model, and credential settings expand from this panel in later phases.</p>
          </>
        )}
      </div>
    </div>
  )
}
