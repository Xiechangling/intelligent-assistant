import { useAppShellStore } from '../state/appShellStore'

const placeholderSessions = ['Welcome session', 'Design review placeholder']

export function LeftSidebar() {
  const { recentProjects, setActiveProject } = useAppShellStore()

  return (
    <div className="sidebar">
      <section className="sidebar__section">
        <h2 className="sidebar__title">Recent Sessions</h2>
        <ul className="sidebar__list">
          {placeholderSessions.map((session) => (
            <li key={session} className="sidebar__item">
              <button className="sidebar__button">{session}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar__section">
        <h2 className="sidebar__title">Projects</h2>
        <ul className="sidebar__list">
          {recentProjects.map((project) => (
            <li key={`${project.name}-${project.path ?? 'none'}`} className="sidebar__item">
              <button className="sidebar__button" onClick={() => setActiveProject(project)}>
                <span>{project.name}</span>
                {project.path ? <small>{project.path}</small> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
