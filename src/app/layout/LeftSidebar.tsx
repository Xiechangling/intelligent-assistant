import { Clock3, Folder, FolderOpen, MessageSquare } from 'lucide-react'
import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'
import { KeyboardShortcutHint } from '../components/KeyboardShortcutHint'
import { SidebarTopActions } from '../components/SidebarTopActions'
import { useSessionGrouping } from '../hooks/useSessionGrouping'

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

export function LeftSidebar({ onSearchClick }: { onSearchClick?: () => void }) {
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

  // Convert chooser rows to session records for grouping
  const sessionRecords = chooserRows.map(row => ({
    id: row.sessionId,
    title: row.title,
    updatedAt: row.lastActivityAt,
    lastActivityAt: row.lastActivityAt,
    projectName: row.projectName,
    summary: row.summary,
    workflowStatus: row.workflowStatus,
    attention: row.attention
  }))

  const sessionGroups = useSessionGrouping(sessionRecords)

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
      <SidebarTopActions onSearchClick={onSearchClick} />

      {/* Project picker at top */}
      <section className="sidebar__project-picker">
        <div className="sidebar__project-name">{projectName}</div>
        <button className="sidebar__project-button" onClick={handleProjectPick}>
          <FolderOpen size={16} strokeWidth={2} />
          <span>Open workspace</span>
          <KeyboardShortcutHint shortcut="ctrl+o" />
        </button>
      </section>

      {/* Workspaces list - always visible */}
      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Folder size={16} strokeWidth={2} />
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
                    <Folder size={16} strokeWidth={2} />
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

      {/* Recent sessions - grouped by date */}
      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Clock3 size={16} strokeWidth={2} />
            <span className="sidebar__title">Recent sessions</span>
          </h2>
        </div>
        {sessionHistory.length === 0 ? <p className="sidebar__helper">No recent sessions yet</p> : null}

        {/* Today */}
        {sessionGroups.today.length > 0 && (
          <>
            <div className="sidebar__date-group">Today</div>
            <ul className="sidebar__list">
              {sessionGroups.today.map((session: any) => {
                const isActive = session.id === activeSession?.id
                const badgeLabel = attentionLabel(session.attention)
                return (
                  <li key={session.id} className="sidebar__item">
                    <button
                      className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                      onClick={() => resumeSession(session.id)}
                      title={session.title}
                    >
                      <div className="sidebar__row-head sidebar__row-head--spread">
                        <div className="sidebar__row-head">
                          <MessageSquare size={16} strokeWidth={2} />
                          <strong>{session.title}</strong>
                        </div>
                        {badgeLabel ? (
                          <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(session.attention)}`}>
                            {badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <small>{session.projectName}</small>
                      <small>{session.summary}</small>
                      <small>
                        {formatRelativeTime(session.lastActivityAt)} · {session.workflowStatus}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Yesterday */}
        {sessionGroups.yesterday.length > 0 && (
          <>
            <div className="sidebar__date-group">Yesterday</div>
            <ul className="sidebar__list">
              {sessionGroups.yesterday.map((session: any) => {
                const isActive = session.id === activeSession?.id
                const badgeLabel = attentionLabel(session.attention)
                return (
                  <li key={session.id} className="sidebar__item">
                    <button
                      className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                      onClick={() => resumeSession(session.id)}
                      title={session.title}
                    >
                      <div className="sidebar__row-head sidebar__row-head--spread">
                        <div className="sidebar__row-head">
                          <MessageSquare size={16} strokeWidth={2} />
                          <strong>{session.title}</strong>
                        </div>
                        {badgeLabel ? (
                          <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(session.attention)}`}>
                            {badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <small>{session.projectName}</small>
                      <small>{session.summary}</small>
                      <small>
                        {formatRelativeTime(session.lastActivityAt)} · {session.workflowStatus}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Last 7 Days */}
        {sessionGroups.last7Days.length > 0 && (
          <>
            <div className="sidebar__date-group">Last 7 Days</div>
            <ul className="sidebar__list">
              {sessionGroups.last7Days.map((session: any) => {
                const isActive = session.id === activeSession?.id
                const badgeLabel = attentionLabel(session.attention)
                return (
                  <li key={session.id} className="sidebar__item">
                    <button
                      className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                      onClick={() => resumeSession(session.id)}
                      title={session.title}
                    >
                      <div className="sidebar__row-head sidebar__row-head--spread">
                        <div className="sidebar__row-head">
                          <MessageSquare size={16} strokeWidth={2} />
                          <strong>{session.title}</strong>
                        </div>
                        {badgeLabel ? (
                          <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(session.attention)}`}>
                            {badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <small>{session.projectName}</small>
                      <small>{session.summary}</small>
                      <small>
                        {formatRelativeTime(session.lastActivityAt)} · {session.workflowStatus}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Last 30 Days */}
        {sessionGroups.last30Days.length > 0 && (
          <>
            <div className="sidebar__date-group">Last 30 Days</div>
            <ul className="sidebar__list">
              {sessionGroups.last30Days.map((session: any) => {
                const isActive = session.id === activeSession?.id
                const badgeLabel = attentionLabel(session.attention)
                return (
                  <li key={session.id} className="sidebar__item">
                    <button
                      className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                      onClick={() => resumeSession(session.id)}
                      title={session.title}
                    >
                      <div className="sidebar__row-head sidebar__row-head--spread">
                        <div className="sidebar__row-head">
                          <MessageSquare size={16} strokeWidth={2} />
                          <strong>{session.title}</strong>
                        </div>
                        {badgeLabel ? (
                          <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(session.attention)}`}>
                            {badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <small>{session.projectName}</small>
                      <small>{session.summary}</small>
                      <small>
                        {formatRelativeTime(session.lastActivityAt)} · {session.workflowStatus}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Older */}
        {sessionGroups.older.length > 0 && (
          <>
            <div className="sidebar__date-group">Older</div>
            <ul className="sidebar__list">
              {sessionGroups.older.map((session: any) => {
                const isActive = session.id === activeSession?.id
                const badgeLabel = attentionLabel(session.attention)
                return (
                  <li key={session.id} className="sidebar__item">
                    <button
                      className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                      onClick={() => resumeSession(session.id)}
                      title={session.title}
                    >
                      <div className="sidebar__row-head sidebar__row-head--spread">
                        <div className="sidebar__row-head">
                          <MessageSquare size={16} strokeWidth={2} />
                          <strong>{session.title}</strong>
                        </div>
                        {badgeLabel ? (
                          <span className={`sidebar__attention-pill sidebar__attention-pill--${attentionTone(session.attention)}`}>
                            {badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <small>{session.projectName}</small>
                      <small>{session.summary}</small>
                      <small>
                        {formatRelativeTime(session.lastActivityAt)} · {session.workflowStatus}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
