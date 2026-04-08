import { FolderOpen, MessageSquare, Settings, Shield, Sparkles } from 'lucide-react'
import { ChangeEvent, useEffect } from 'react'
import type { ModelId } from '../state/types'
import { getRecentProjects, pickProjectDirectory } from '../services/projectService'
import { getCredentialStatus } from '../services/credentialService'
import { useAppShellStore } from '../state/appShellStore'

function formatRelativeTime(timestamp: string | null) {
  if (!timestamp) {
    return 'No recent activity'
  }

  const delta = Date.now() - Number(timestamp)
  const minutes = Math.max(1, Math.round(delta / 60000))
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function truncateWorkspacePath(path: string | null) {
  if (!path) {
    return 'No workspace selected'
  }

  if (path.length <= 42) {
    return path
  }

  const normalized = path.replace(/\\/g, '/')
  const segments = normalized.split('/').filter(Boolean)
  if (segments.length <= 2) {
    return path
  }

  return `…/${segments.slice(-2).join('/')}`
}

function statusTone(status: string) {
  if (status === 'Awaiting approval') {
    return 'warning'
  }

  if (status === 'Failed' || status === 'Needs attention') {
    return 'danger'
  }

  if (status === 'Review ready') {
    return 'review'
  }

  if (status === 'Connected' || status === 'Attached' || status === 'Working') {
    return 'accent'
  }

  return 'neutral'
}

export function TopToolbar() {
  const {
    mode,
    activeProjectPath,
    activePresetId,
    credentialStatus,
    activeSession,
    presets,
    globalDefaultModel,
    activeSessionModelOverride,
    getDesktopWorkflow,
    setMode,
    setActiveProject,
    setRecentProjects,
    setCredentialStatus,
    setGlobalDefaultModel,
    setActiveSessionModelOverride,
    setRightPanelOpen,
    setRightPanelView,
  } = useAppShellStore()

  useEffect(() => {
    getRecentProjects()
      .then((projects) => {
        if (projects.length > 0) {
          setRecentProjects(projects)
        }
      })
      .catch(() => undefined)

    getCredentialStatus()
      .then((status) => setCredentialStatus(status))
      .catch(() => setCredentialStatus('error'))
  }, [setCredentialStatus, setRecentProjects])

  const handleProjectPick = async () => {
    try {
      const project = await pickProjectDirectory()
      if (!project) {
        return
      }

      setActiveProject(project)
    } catch {
      console.error('Failed to pick project directory')
    }
  }

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextModel = event.target.value as ModelId
    setGlobalDefaultModel(nextModel)
  }

  const desktopWorkflow = getDesktopWorkflow()
  const activePreset = presets.find((preset) => preset.id === activePresetId)
  const effectiveModel = activeSessionModelOverride ?? globalDefaultModel
  const modeLabel = mode === 'project' ? 'Workspace' : 'Conversation'
  const workspaceLabel = mode === 'project' ? truncateWorkspacePath(activeProjectPath) : 'Conversation only'
  const sessionLabel = activeSession?.title ?? (mode === 'project' ? 'Session chooser' : 'Start a conversation')
  const contextMeta = activeSession
    ? `${formatRelativeTime(activeSession.lastActivityAt)} · ${activeSession.projectName}`
    : mode === 'project'
      ? activeProjectPath ?? 'Open a workspace to continue'
      : 'No workspace required'

  const openInspector = (view: 'context' | 'settings') => {
    setRightPanelView(view)
    setRightPanelOpen(true)
  }

  return (
    <div className="toolbar">
      <div className="toolbar__left-cluster">
        <div className="toolbar__segmented" role="tablist" aria-label="Mode switcher">
          <button
            className={`toolbar__segment ${mode === 'conversation' ? 'toolbar__segment--active' : ''}`}
            onClick={() => setMode('conversation')}
            title="Conversation mode"
          >
            <MessageSquare size={14} />
            <span>Conversation</span>
          </button>
          <button
            className={`toolbar__segment ${mode === 'project' ? 'toolbar__segment--active' : ''}`}
            onClick={() => setMode('project')}
            title="Workspace mode"
          >
            <Sparkles size={14} />
            <span>Workspace</span>
          </button>
        </div>

        <button className="toolbar__project-button" onClick={handleProjectPick} title={activeProjectPath ?? 'Open workspace folder'}>
          <FolderOpen size={15} />
          <span>{mode === 'project' ? workspaceLabel : 'Open workspace'}</span>
        </button>

        <select className="toolbar__project-button toolbar__model-select" value={globalDefaultModel} onChange={handleModelChange} aria-label="Model selector">
          <option value="claude-opus">claude-opus</option>
          <option value="claude-sonnet">claude-sonnet</option>
          <option value="claude-haiku">claude-haiku</option>
        </select>
      </div>

      <div className="toolbar__context">
        <div className="toolbar__context-grid">
          <div className="toolbar__context-item">
            <span className="toolbar__context-label">Mode</span>
            <strong className="toolbar__context-title">{modeLabel}</strong>
          </div>
          <div className="toolbar__context-item">
            <span className="toolbar__context-label">Workspace</span>
            <strong className="toolbar__context-title">{workspaceLabel}</strong>
          </div>
          <div className="toolbar__context-item toolbar__context-item--session">
            <span className="toolbar__context-label">Session</span>
            <strong className="toolbar__context-title">{sessionLabel}</strong>
          </div>
        </div>
        <span className="toolbar__context-meta">{contextMeta}</span>
      </div>

      <div className="toolbar__utility">
        <span className={`toolbar__status-chip toolbar__status-chip--${statusTone(desktopWorkflow.desktopStatus)}`}>{desktopWorkflow.desktopStatus}</span>
        {activePreset ? <span className="toolbar__utility-meta toolbar__utility-meta--pill">{activePreset.name}</span> : null}
        <button className="toolbar__icon-button" onClick={() => openInspector('context')} title={`Context · ${credentialStatus}`}>
          <Shield size={15} />
        </button>
        <button className="toolbar__icon-button" onClick={() => openInspector('settings')} title="Settings">
          <Settings size={15} />
        </button>
      </div>
    </div>
  )
}
