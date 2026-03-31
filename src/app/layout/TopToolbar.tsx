import { FolderOpen, MessageSquare, Settings, Shield, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
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

export function TopToolbar() {
  const {
    mode,
    activeProjectPath,
    activePresetId,
    credentialStatus,
    activeSession,
    assistantStatus,
    currentStageLabel,
    executionRecord,
    pendingProposal,
    presets,
    setMode,
    setActiveProject,
    setRecentProjects,
    setCredentialStatus,
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

  const activePreset = presets.find((preset) => preset.id === activePresetId)
  const title = activeSession?.title ?? (mode === 'project' ? 'Project workspace' : 'Conversation')
  const meta = activeSession
    ? `${formatRelativeTime(activeSession.lastActivityAt)} · ${activeSession.projectName}`
    : mode === 'project'
      ? activeProjectPath ?? 'Open a project to begin'
      : 'Start a direct conversation'

  const statusLabel = pendingProposal
    ? 'Approval required'
    : executionRecord
      ? `Execution ${executionRecord.status}`
      : assistantStatus === 'streaming'
        ? currentStageLabel ?? 'Responding'
        : 'Ready'

  const openInspector = (view: 'context' | 'settings') => {
    setRightPanelView(view)
    setRightPanelOpen(true)
  }

  return (
    <div className="toolbar">
      <div className="toolbar__left-cluster">
        <div className="toolbar__segmented" role="tablist" aria-label="Mode switcher">
          <button
            className={`toolbar__segment ${mode === 'project' ? 'toolbar__segment--active' : ''}`}
            onClick={() => setMode('project')}
            title="Project mode"
          >
            <Sparkles size={14} />
            <span>Project</span>
          </button>
          <button
            className={`toolbar__segment ${mode === 'conversation' ? 'toolbar__segment--active' : ''}`}
            onClick={() => setMode('conversation')}
            title="Conversation mode"
          >
            <MessageSquare size={14} />
            <span>Chat</span>
          </button>
        </div>

        <button className="toolbar__project-button" onClick={handleProjectPick} title={activeProjectPath ?? 'Open project folder'}>
          <FolderOpen size={15} />
          <span>{activeProjectPath ?? 'Open project'}</span>
        </button>
      </div>

      <div className="toolbar__context">
        <strong className="toolbar__context-title">{title}</strong>
        <span className="toolbar__context-meta">{meta}</span>
      </div>

      <div className="toolbar__utility">
        <span className="toolbar__status-chip">{statusLabel}</span>
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
