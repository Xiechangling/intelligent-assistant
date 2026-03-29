export function TopToolbar() {
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <span className="toolbar__label">Mode</span>
        <button className="toolbar__chip toolbar__chip--active">Project</button>
        <button className="toolbar__chip">Conversation</button>
      </div>

      <div className="toolbar__group toolbar__group--grow">
        <span className="toolbar__label">Project</span>
        <button className="toolbar__select">No project selected</button>
      </div>

      <div className="toolbar__group">
        <span className="toolbar__label">Model</span>
        <button className="toolbar__select">Claude Sonnet</button>
      </div>

      <div className="toolbar__group">
        <button className="toolbar__icon-button">Settings</button>
      </div>
    </div>
  )
}
