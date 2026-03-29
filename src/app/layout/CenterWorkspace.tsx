import { useMemo } from 'react'
import { useAppShellStore } from '../state/appShellStore'

export function CenterWorkspace() {
  const { activeProjectPath, activeShellView, mode } = useAppShellStore()

  const viewContent = useMemo(() => {
    if (activeShellView === 'project-sessions') {
      return {
        title: 'Project session list',
        body: `Recent and resumable sessions for ${activeProjectPath ?? 'the active project'} appear here.`,
      }
    }

    if (mode === 'conversation' || activeShellView === 'conversation-home') {
      return {
        title: 'Pure conversation mode home',
        body: 'Start a conversation without opening a project folder.',
      }
    }

    return {
      title: 'Project mode home',
      body: 'Select a project to access its sessions and coding context.',
    }
  }, [activeProjectPath, activeShellView, mode])

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
        <section className="workspace__card workspace__card--featured">
          <h2>{viewContent.title}</h2>
          <p>{viewContent.body}</p>
        </section>
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
