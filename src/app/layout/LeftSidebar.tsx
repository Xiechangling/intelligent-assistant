const recentSessions = ['Welcome session', 'Design review placeholder']
const projects = ['No recent projects yet']

export function LeftSidebar() {
  return (
    <div className="sidebar">
      <section className="sidebar__section">
        <h2 className="sidebar__title">Recent Sessions</h2>
        <ul className="sidebar__list">
          {recentSessions.map((session) => (
            <li key={session} className="sidebar__item">
              <button className="sidebar__button">{session}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar__section">
        <h2 className="sidebar__title">Projects</h2>
        <ul className="sidebar__list">
          {projects.map((project) => (
            <li key={project} className="sidebar__item">
              <button className="sidebar__button">{project}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
