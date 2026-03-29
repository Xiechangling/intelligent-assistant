import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'

const placeholderSessions = ['Welcome session', 'Design review placeholder']
const demoProjectPath = 'E:/work/ai/agent'

export function LeftSidebar() {
  const { recentProjects, setActiveProject } = useAppShellStore()

  const handleProjectPick = async () => {
    const project = await pickProjectDirectory(demoProjectPath)
    setActiveProject(project)
  }

  return (
    <div className="sidebar">
      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title">Recent Sessions</h2>
        </div>
        <ul className="sidebar__list">
          {placeholderSessions.map((session) => (
            <li key={session} className="sidebar__item">
              <button className="sidebar__button">{session}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <h2 className="sidebar__title">Projects</h2>
          <button className="sidebar__action" onClick={handleProjectPick}>
            Open folder
          </button>
        </div>
        <ul className="sidebar__list">
          {recentProjects.map((project) => (
            <li key={`${project.name}-${project.path ?? 'none'}`} className="sidebar__item">
              <button className="sidebar__button" onClick={() => setActiveProject(project)}>
                <span>{project.name}</span>
                {project.path ? <small>{project.path}</small> : null}
                {project.warning === 'non-standard' ? (
                  <strong className="sidebar__warning">Non-standard project folder</strong>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
