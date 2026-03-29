import { useAppShellStore } from '../state/appShellStore'

const modelOptions = [
  { label: 'Claude Sonnet', value: 'claude-sonnet' },
  { label: 'Claude Opus', value: 'claude-opus' },
  { label: 'Claude Haiku', value: 'claude-haiku' },
] as const

export function TopToolbar() {
  const {
    mode,
    activeProjectPath,
    globalDefaultModel,
    credentialStatus,
    setMode,
    setGlobalDefaultModel,
  } = useAppShellStore()

  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <span className="toolbar__label">Mode</span>
        <button
          className={`toolbar__chip ${mode === 'project' ? 'toolbar__chip--active' : ''}`}
          onClick={() => setMode('project')}
        >
          Project
        </button>
        <button
          className={`toolbar__chip ${mode === 'conversation' ? 'toolbar__chip--active' : ''}`}
          onClick={() => setMode('conversation')}
        >
          Conversation
        </button>
      </div>

      <div className="toolbar__group toolbar__group--grow">
        <span className="toolbar__label">Project</span>
        <button className="toolbar__select">{activeProjectPath ?? 'No project selected'}</button>
      </div>

      <div className="toolbar__group">
        <span className="toolbar__label">Model</span>
        <select
          className="toolbar__select"
          value={globalDefaultModel}
          onChange={(event) => setGlobalDefaultModel(event.target.value as (typeof modelOptions)[number]['value'])}
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar__group">
        <button className="toolbar__icon-button">Credential: {credentialStatus}</button>
      </div>

      <div className="toolbar__group">
        <button className="toolbar__icon-button">Settings</button>
      </div>
    </div>
  )
}
