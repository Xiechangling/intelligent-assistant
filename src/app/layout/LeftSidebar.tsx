import { Clock3, Folder, FolderOpen, MessageSquare } from 'lucide-react'
import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'
import { KeyboardShortcutHint } from '../components/KeyboardShortcutHint'
import { SidebarTopActions } from '../components/SidebarTopActions'

function formatRelativeTime(timestamp: string) {
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

function attentionLabel(attention: 'approval' | 'review' | 'failure' | 'recovery' | null) {
  switch (attention) {
    case 'approval':
      return 'Awaiting approval'
    case 'review':
      return 'Review ready'
    case 'failure':
      return 'Failed'
    case 'recovery':
      return 'Needs attention'
    default:
      return null
  }
}

function attentionTone(attention: 'approval' | 'review' | 'failure' | 'recovery' | null) {
  switch (attention) {
    case 'approval':
      return 'warning'
    case 'review':
      return 'review'
    case 'failure':
    case 'recovery':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function LeftSidebar() {
  const {
    activeProjectPath,
    activeSession,
    mode,
    recentProjects,
    sessionHistory,
    getDesktopWorkflow,
    resumeSession,
    setActiveProject,
  } = useAppShellStore()

  const desktopWorkflow = getDesktopWorkflow()
  const chooserRows = desktopWorkflow.chooser.rows.slice(0, 6)
  const workspaceProjects = recentProjects.filter((project) => project.path)

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

  // Extract project name from path
  const projectName = activeProjectPath
    ? activeProjectPath.split(/[\\/]/).filter(Boolean).pop() || 'Project'
    : 'No workspace'

  return (
    <div className="sidebar">
      {/* Top actions */}
      <SidebarTopActions />

      {/* Project picker at top */}
      <section className="sidebar__project-picker">
        <div className="sidebar__project-name">{projectName}</div>
        <button className="sidebar__project-button" onClick={handleProjectPick}>
          <FolderOpen size={13} />
          <span>Open workspace</span>
          <KeyboardShortcutHint shortcut="ctrl+o" />
        </button>
      </section>

      {/* Workspaces list - always visible */}
      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Folder size={13} />
            <span className="sidebar__title">Workspaces</span>
          </h2>
        </div>
        {workspaceProjects.length === 0 ? <p className="sidebar__helper">No workspace selected</p> : null}
        <ul className="sidebar__list">
          {workspaceProjects.map((project) => {
            const isActiveWorkspace = project.path === activeProjectPath && mode === 'project'
            return (
              <li key={`${project.name}-${project.path ?? 'none'}`} className="sidebar__item">
                <button
                  className={`sidebar__row ${isActiveWorkspace ? 'sidebar__row--active' : ''}`}
                  onClick={() => setActiveProject(project)}
                  title={project.path ?? project.name}
                >
                  <div className="sidebar__row-head">
                    <Folder size={13} />
                    <strong>{project.name}</strong>
                  </div>
                  <small>{project.path ?? 'Local workspace'}</small>
                  {project.warning === 'non-standard' ? <small className="sidebar__warning">Needs attention</small> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Recent sessions - always visible */}
      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Clock3 size={13} />
            <span className="sidebar__title">Recent sessions</span>
          </h2>
        </div>
        {sessionHistory.length === 0 ? <p className="sidebar__helper">No recent sessions yet</p> : null}
        <ul className="sidebar__list">
          {chooserRows.map((row) => {
            const isActive = row.sessionId === activeSession?.id
            const badgeLabel = attentionLabel(row.attention)
            return (
              <li key={row.sessionId} className="sidebar__item">
                <button
                  className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                  onClick={() => resumeSession(row.sessionId)}
                  title={row.title}
                >
                  <div className="sidebar__row-head sidebar__row-head--spread">
                    <div className="sidebar__row-head">
                      <MessageSquare size={13} />
                      <strong>{row.title}</strong>
                    </div>
                    {badgeLabel ? (
                      <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(row.attention)}`}>
                        {badgeLabel}
                      </span>
                    ) : null}
                  </div>
                  <small>{row.projectName}</small>
                  <small>{row.summary}</small>
                  <small>
                    {formatRelativeTime(row.lastActivityAt)} · {row.workflowStatus}
                  </small>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
