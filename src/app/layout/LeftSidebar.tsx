import { Clock3, Folder, FolderOpen, MessageSquare } from 'lucide-react'
import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'

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

function formatStatusLabel(status: 'active' | 'idle' | 'needs-attention' | 'complete') {
  switch (status) {
    case 'needs-attention':
      return 'Needs attention'
    case 'complete':
      return 'Complete'
    case 'idle':
      return 'Idle'
    default:
      return 'Active'
  }
}

export function LeftSidebar() {
  const { activeSession, recentProjects, sessionHistory, resumeSession, setActiveProject } = useAppShellStore()
  const recentSessions = sessionHistory.slice(0, 6)

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

  return (
    <div className="sidebar">
      <section className="sidebar__section sidebar__section--brand">
        <div className="sidebar__brand-mark">
          <MessageSquare size={15} />
        </div>
        <div className="sidebar__brand-copy">
          <strong>Claude shell</strong>
          <span>Desktop workspace</span>
        </div>
      </section>

      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Clock3 size={13} />
            <span className="sidebar__title">Recent sessions</span>
          </h2>
        </div>
        {recentSessions.length === 0 ? <p className="sidebar__helper">No recent sessions yet</p> : null}
        <ul className="sidebar__list">
          {recentSessions.map((session) => {
            const isActive = session.id === activeSession?.id
            return (
              <li key={session.id} className="sidebar__item">
                <button
                  className={`sidebar__row ${isActive ? 'sidebar__row--active' : ''}`}
                  onClick={() => resumeSession(session.id)}
                  title={session.title}
                >
                  <div className="sidebar__row-head">
                    <MessageSquare size={13} />
                    <strong>{session.title}</strong>
                  </div>
                  <small>
                    {formatRelativeTime(session.lastActivityAt)} · {formatStatusLabel(session.status)}
                  </small>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title-wrap">
            <Folder size={13} />
            <span className="sidebar__title">Projects</span>
          </h2>
          <button className="sidebar__link-action" onClick={handleProjectPick}>
            <FolderOpen size={13} />
            <span>Open</span>
          </button>
        </div>
        <ul className="sidebar__list">
          {recentProjects.map((project) => (
            <li key={`${project.name}-${project.path ?? 'none'}`} className="sidebar__item">
              <button className="sidebar__row" onClick={() => setActiveProject(project)} title={project.path ?? project.name}>
                <div className="sidebar__row-head">
                  <Folder size={13} />
                  <strong>{project.name}</strong>
                </div>
                {project.warning === 'non-standard' ? <small className="sidebar__warning">Non-standard project folder</small> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
