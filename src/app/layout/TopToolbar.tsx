import { Settings } from 'lucide-react'
import { ChangeEvent } from 'react'
import type { ModelId } from '../state/types'
import { useAppShellStore } from '../state/appShellStore'

export function TopToolbar() {
  const {
    activeProjectPath,
    globalDefaultModel,
    setGlobalDefaultModel,
    setRightPanelOpen,
    setRightPanelView,
  } = useAppShellStore()

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextModel = event.target.value as ModelId
    setGlobalDefaultModel(nextModel)
  }

  const openSettings = () => {
    setRightPanelView('settings')
    setRightPanelOpen(true)
  }

  // Simplify project name display (only show last path segment)
  const projectName = activeProjectPath
    ? activeProjectPath.split(/[\\/]/).filter(Boolean).pop() || 'Project'
    : 'No workspace'

  return (
    <div className="toolbar">
      {/* Left: Breadcrumb (project name) */}
      <div className="toolbar__breadcrumb">
        <span className="toolbar__project-badge">{projectName}</span>
      </div>

      {/* Center: Model selector */}
      <div className="toolbar__center">
        <select
          className="toolbar__model-select"
          value={globalDefaultModel}
          onChange={handleModelChange}
          aria-label="Model selector"
        >
          <option value="claude-opus">claude-opus</option>
          <option value="claude-sonnet">claude-sonnet</option>
          <option value="claude-haiku">claude-haiku</option>
        </select>
      </div>

      {/* Right: Settings entry */}
      <div className="toolbar__actions">
        <button
          className="toolbar__icon-button"
          onClick={openSettings}
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  )
}
