export function RightPanel() {
  return (
    <div className="right-panel">
      <div className="right-panel__tabs">
        <button className="right-panel__tab right-panel__tab--active">Context</button>
        <button className="right-panel__tab">Settings</button>
      </div>
      <div className="right-panel__content">
        <h2>Current Context</h2>
        <ul>
          <li>Mode: Project</li>
          <li>Project: None selected</li>
          <li>Model: Claude Sonnet</li>
          <li>Credential: Not configured</li>
        </ul>
      </div>
    </div>
  )
}
