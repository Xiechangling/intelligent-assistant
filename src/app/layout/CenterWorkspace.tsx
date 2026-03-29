export function CenterWorkspace() {
  return (
    <div className="workspace">
      <div className="workspace__hero">
        <span className="workspace__eyebrow">Chat-first workspace</span>
        <h1 className="workspace__title">Start building with Intelligent Assistant</h1>
        <p className="workspace__body">
          This shell reserves space for project mode, conversation mode, and project session flows.
        </p>
      </div>

      <div className="workspace__states">
        <section className="workspace__card">
          <h2>Project mode home</h2>
          <p>Select a project to access its sessions and coding context.</p>
        </section>
        <section className="workspace__card">
          <h2>Pure conversation mode home</h2>
          <p>Start a conversation without opening a project folder.</p>
        </section>
        <section className="workspace__card">
          <h2>Project session list</h2>
          <p>Recent and resumable sessions for the active project appear here.</p>
        </section>
      </div>
    </div>
  )
}
