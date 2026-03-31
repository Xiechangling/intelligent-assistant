import { AlertTriangle, ArrowUp, FileText, SendHorizontal, ShieldAlert } from 'lucide-react'
import { FormEvent, KeyboardEvent } from 'react'
import { useAppShellStore } from '../state/appShellStore'
import type { SessionTranscriptEvent } from '../state/types'

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

function EventRow({ event, mode }: { event: SessionTranscriptEvent; mode: 'project' | 'conversation' }) {
  if (event.kind === 'stage-status') {
    return (
      <div className="conversation-event conversation-event--stage">
        <span className="conversation-event__eyebrow">{event.stageLabel ?? 'Stage update'}</span>
        <p>{event.body}</p>
      </div>
    )
  }

  if (event.kind === 'tool-summary') {
    return (
      <div className="conversation-event conversation-event--tool">
        <div className="conversation-event__header">
          <strong>{event.toolLabel ?? 'Tool summary'}</strong>
          <span>Workflow support</span>
        </div>
        <p>{event.toolSummary ?? event.body}</p>
      </div>
    )
  }

  if (event.kind === 'approval-request') {
    return (
      <div className="conversation-event conversation-event--approval">
        <span className="conversation-event__eyebrow">Approval required</span>
        <p>{event.body}</p>
      </div>
    )
  }

  if (event.kind === 'approval-resolution') {
    return (
      <div className="conversation-event conversation-event--resolution">
        <span className="conversation-event__eyebrow">{event.approvalDecision === 'approved' ? 'Approved' : 'Rejected'}</span>
        <p>{event.body}</p>
      </div>
    )
  }

  if (event.kind === 'execution-update') {
    return (
      <div className="conversation-event conversation-event--execution">
        <span className="conversation-event__eyebrow">{event.executionStatus ?? 'Execution update'}</span>
        <p>{event.body}</p>
      </div>
    )
  }

  if (event.kind === 'review-available') {
    return (
      <div className="conversation-event conversation-event--review">
        <span className="conversation-event__eyebrow">Review available</span>
        <p>{event.body}</p>
      </div>
    )
  }

  return (
    <div
      className={`conversation-message conversation-message--${event.displayRole ?? 'assistant'} ${
        mode === 'project' ? 'conversation-message--project' : 'conversation-message--chat'
      }`}
    >
      <span className="conversation-message__role">{event.displayRole === 'user' ? 'You' : 'Assistant'}</span>
      <p>{event.body}</p>
    </div>
  )
}

function Transcript({ events, mode, assistantStatus, currentStageLabel }: {
  events: SessionTranscriptEvent[]
  mode: 'project' | 'conversation'
  assistantStatus: 'idle' | 'streaming' | 'error'
  currentStageLabel: string | null
}) {
  if (events.length === 0) {
    return (
      <div className="conversation-empty">
        <h3>{mode === 'project' ? 'Start a coding task' : 'Start a conversation'}</h3>
        <p>
          {mode === 'project'
            ? 'Describe the task you want handled in the active project. The assistant will stream progress and keep the result in this session.'
            : 'Ask a question or explore an idea without selecting a project folder.'}
        </p>
      </div>
    )
  }

  return (
    <div className="conversation-transcript" role="log" aria-live="polite">
      {events.map((event) => (
        <EventRow key={event.id} event={event} mode={mode} />
      ))}
      {assistantStatus === 'streaming' ? (
        <div className="conversation-streaming-indicator">
          <strong>{currentStageLabel ?? 'Responding'}</strong>
          <span>{mode === 'project' ? 'Streaming project-aware response…' : 'Streaming response…'}</span>
        </div>
      ) : null}
    </div>
  )
}

function ApprovalCard({
  onApprove,
  onReject,
}: {
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
}) {
  const { pendingProposal } = useAppShellStore()

  if (!pendingProposal) {
    return null
  }

  return (
    <div className="workspace__inline-surface workspace__inline-surface--approval">
      <div className="workspace__inline-surface-header">
        <div>
          <span className="conversation-event__eyebrow workspace__inline-badge">
            <ShieldAlert size={13} />
            <span>Impactful command</span>
          </span>
          <h3>{pendingProposal.summary}</h3>
        </div>
        <span className="workspace__mode-pill">Needs review</span>
      </div>
      <p className="workspace__inline-copy">Review the command details in the bottom utility tray, then approve or reject here.</p>
      <div className="approval-card__actions">
        <button className="workspace__secondary-action" onClick={() => onReject().catch(() => undefined)}>
          Reject
        </button>
        <button className="workspace__primary-action" onClick={() => onApprove().catch(() => undefined)}>
          Approve & Run
        </button>
      </div>
    </div>
  )
}

function ReviewSummary() {
  const { executionRecord, selectReviewFile } = useAppShellStore()

  if (!executionRecord || executionRecord.changedFiles.length === 0) {
    return null
  }

  return (
    <div className="workspace__inline-surface workspace__inline-surface--review">
      <div className="workspace__inline-surface-header">
        <div>
          <span className="conversation-event__eyebrow workspace__inline-badge">
            <FileText size={13} />
            <span>Review ready</span>
          </span>
          <h3>{executionRecord.changedFiles.length} changed files available</h3>
        </div>
        <span className="workspace__mode-pill workspace__mode-pill--chat">Open review</span>
      </div>
      <div className="review-summary-card__list review-summary-card__list--inline">
        {executionRecord.changedFiles.map((file) => (
          <button key={file.id} className="review-summary-card__file" onClick={() => selectReviewFile(file.id)}>
            <div>
              <strong>{file.path}</strong>
              <span>{file.summary}</span>
            </div>
            <ArrowUp size={14} />
          </button>
        ))}
      </div>
    </div>
  )
}

function Composer({
  mode,
  draftPrompt,
  setDraftPrompt,
  submitPrompt,
  disabled,
}: {
  mode: 'project' | 'conversation'
  draftPrompt: string
  setDraftPrompt: (prompt: string) => void
  submitPrompt: () => Promise<void>
  disabled: boolean
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitPrompt().catch(() => undefined)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      submitPrompt().catch(() => undefined)
    }
  }

  return (
    <form className={`composer composer--${mode}`} onSubmit={handleSubmit}>
      <div className="composer__field">
        <textarea
          id="assistant-prompt"
          className="composer__input"
          value={draftPrompt}
          onChange={(event) => setDraftPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'project'
              ? 'Describe the coding task for the active project…'
              : 'Send a message to the assistant…'
          }
          rows={mode === 'project' ? 3 : 4}
          disabled={disabled}
        />
        <button
          className="workspace__primary-action composer__send"
          type="submit"
          disabled={disabled || !draftPrompt.trim()}
          aria-label={mode === 'project' ? 'Run task' : 'Send message'}
          title={mode === 'project' ? 'Ctrl/Cmd + Enter sends task' : 'Ctrl/Cmd + Enter sends message'}
        >
          <SendHorizontal size={15} />
        </button>
      </div>
    </form>
  )
}

export function CenterWorkspace() {
  const {
    activeProjectPath,
    activeSession,
    activeShellView,
    assistantError,
    assistantStatus,
    approvePendingCommand,
    currentStageLabel,
    draftPrompt,
    mode,
    pendingProposal,
    projectWarning,
    recoveryMessage,
    recoveryStatus,
    rejectPendingCommand,
    resumeStatus,
    sessionHistory,
    sessionHistoryError,
    sessionHistoryFilter,
    sessionHistoryStatus,
    createConversationSession,
    createProjectSession,
    loadSessionHistory,
    resumeSession,
    setDraftPrompt,
    submitPrompt,
  } = useAppShellStore()

  const filteredLabel =
    sessionHistoryFilter.projectPath && activeProjectPath === sessionHistoryFilter.projectPath
      ? 'Current project only'
      : sessionHistoryFilter.projectPath
        ? sessionHistoryFilter.projectPath
        : 'All projects'

  const activeSessionId = activeSession?.id ?? null
  const showProjectConversation = mode === 'project' && activeShellView === 'project-sessions' && Boolean(activeSession)
  const showConversationMode = mode === 'conversation'

  return (
    <div className="workspace">
      {projectWarning ? <div className="workspace__banner workspace__banner--warning">{projectWarning}</div> : null}
      {recoveryMessage ? (
        <div className={`workspace__banner workspace__banner--${recoveryStatus === 'error' ? 'error' : 'info'}`}>
          <strong>{recoveryStatus === 'restored' ? 'Session restored' : recoveryStatus === 'error' ? 'Recovery issue' : 'Restoring session'}</strong>
          <p>{recoveryMessage}</p>
        </div>
      ) : null}
      {assistantError ? (
        <div className="workspace__banner workspace__banner--error">
          <strong>
            <AlertTriangle size={14} /> Assistant error
          </strong>
          <p>{assistantError}</p>
        </div>
      ) : null}

      {showProjectConversation ? (
        <section className="workspace__conversation-shell workspace__conversation-shell--project">
          <div className="workspace__conversation-header workspace__conversation-header--compact">
            <div>
              <span className="workspace__eyebrow">Project workflow</span>
              <h2>{activeSession?.title}</h2>
              <p>
                {activeSession?.projectName} · {formatStatusLabel(activeSession?.status ?? 'idle')} · {activeSession?.lastActivityAt ? formatRelativeTime(activeSession.lastActivityAt) : '—'}
              </p>
            </div>
            <span className="workspace__mode-pill">Coding workflow</span>
          </div>
          <div className="workspace__conversation-body">
            {pendingProposal ? <ApprovalCard onApprove={approvePendingCommand} onReject={rejectPendingCommand} /> : null}
            <ReviewSummary />
            <Transcript
              events={activeSession?.transcript ?? []}
              mode="project"
              assistantStatus={assistantStatus}
              currentStageLabel={currentStageLabel}
            />
          </div>
          <Composer
            mode="project"
            draftPrompt={draftPrompt}
            setDraftPrompt={setDraftPrompt}
            submitPrompt={submitPrompt}
            disabled={assistantStatus === 'streaming' || Boolean(pendingProposal)}
          />
        </section>
      ) : null}

      {showConversationMode ? (
        <section className="workspace__conversation-shell workspace__conversation-shell--chat">
          <div className="workspace__conversation-header workspace__conversation-header--compact">
            <div>
              <span className="workspace__eyebrow">Conversation</span>
              <h2>{activeSession?.title ?? 'Conversation'}</h2>
              <p>
                {activeSession
                  ? `${formatStatusLabel(activeSession.status)} · ${formatRelativeTime(activeSession.lastActivityAt)}`
                  : 'Start a lightweight assistant conversation without opening a project.'}
              </p>
            </div>
            {!activeSession ? (
              <button className="workspace__secondary-action" onClick={() => createConversationSession()}>
                New Conversation
              </button>
            ) : null}
          </div>
          <div className="workspace__conversation-body">
            <Transcript
              events={activeSession?.transcript ?? []}
              mode="conversation"
              assistantStatus={assistantStatus}
              currentStageLabel={currentStageLabel}
            />
          </div>
          <Composer
            mode="conversation"
            draftPrompt={draftPrompt}
            setDraftPrompt={setDraftPrompt}
            submitPrompt={submitPrompt}
            disabled={assistantStatus === 'streaming'}
          />
        </section>
      ) : null}

      {activeShellView === 'project-sessions' && !activeSession ? (
        <section className="workspace__surface workspace__surface--list">
          <div className="workspace__surface-header">
            <div>
              <span className="workspace__eyebrow">Project sessions</span>
              <h2>Resume work or start fresh</h2>
              <p>Pick up a previous session or create a new one for the active project.</p>
            </div>
            <div className="workspace__history-actions">
              <button className="workspace__primary-action" onClick={() => createProjectSession()} disabled={!activeProjectPath}>
                New Session
              </button>
              {!activeProjectPath ? <span className="workspace__helper">Select a project before creating a session.</span> : null}
            </div>
          </div>

          <div className="workspace__filters">
            <button
              className={`workspace__filter-chip ${!sessionHistoryFilter.projectPath ? 'workspace__filter-chip--active' : ''}`}
              onClick={() => loadSessionHistory({})}
            >
              All projects
            </button>
            <button
              className={`workspace__filter-chip ${sessionHistoryFilter.projectPath ? 'workspace__filter-chip--active' : ''}`}
              onClick={() => loadSessionHistory(activeProjectPath ? { projectPath: activeProjectPath } : {})}
              disabled={!activeProjectPath}
            >
              {activeProjectPath ? 'Current project only' : 'No project selected'}
            </button>
          </div>

          {resumeStatus === 'loading' ? (
            <div className="workspace__inline-banner">
              <strong>Restoring session</strong>
              <p>Reloading project, model, and recent activity…</p>
            </div>
          ) : null}

          {sessionHistoryStatus === 'loading' || recoveryStatus === 'recovering' ? (
            <div className="workspace__history-list">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="workspace__session-row workspace__session-row--loading" aria-hidden="true">
                  <div className="workspace__skeleton workspace__skeleton--title" />
                  <div className="workspace__skeleton workspace__skeleton--body" />
                  <div className="workspace__skeleton workspace__skeleton--meta" />
                </div>
              ))}
            </div>
          ) : null}

          {sessionHistoryStatus === 'error' ? (
            <div className="workspace__state-card workspace__state-card--error">
              <h3>We couldn’t load session history.</h3>
              <p>{sessionHistoryError ?? 'Try again, and if the problem persists restart the app to reload local session data.'}</p>
              <button className="workspace__secondary-action" onClick={() => loadSessionHistory(sessionHistoryFilter)}>
                Reload History
              </button>
            </div>
          ) : null}

          {sessionHistoryStatus === 'ready' && sessionHistory.length === 0 ? (
            <div className="workspace__state-card">
              <h3>No sessions for this view yet</h3>
              <p>Start a new session for the selected project, or clear the filter to reopen earlier work.</p>
              <div className="workspace__state-actions">
                <button className="workspace__primary-action" onClick={() => createProjectSession()} disabled={!activeProjectPath}>
                  New Session
                </button>
                {sessionHistoryFilter.projectPath ? (
                  <button className="workspace__secondary-action" onClick={() => loadSessionHistory({})}>
                    Clear Filter
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {sessionHistoryStatus === 'ready' && sessionHistory.length > 0 ? (
            <div className="workspace__history-list" role="list" aria-label={`Session history filtered by ${filteredLabel}`}>
              {sessionHistory.map((session) => {
                const isActive = session.id === activeSessionId
                return (
                  <button
                    key={session.id}
                    className={`workspace__session-row ${isActive ? 'workspace__session-row--active' : ''}`}
                    onClick={() => resumeSession(session.id)}
                  >
                    <div className="workspace__session-header">
                      <strong>{session.title}</strong>
                      <span className="workspace__status-pill">{formatStatusLabel(session.status)}</span>
                    </div>
                    <p className="workspace__session-summary">{session.recentActivity?.summary ?? 'No recent activity summary yet.'}</p>
                    <div className="workspace__session-meta">
                      <span>{session.projectName}</span>
                      <span>{session.effectiveModelId}</span>
                      <span>{formatRelativeTime(session.lastActivityAt)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {!showProjectConversation && !showConversationMode && activeShellView !== 'project-sessions' ? (
        <section className="workspace__surface workspace__surface--empty">
          <span className="workspace__eyebrow">{mode === 'project' ? 'Project workspace' : 'Conversation mode'}</span>
          <h2>{mode === 'project' ? 'Select a project to begin' : 'Start a direct conversation'}</h2>
          <p>
            {mode === 'project'
              ? 'Choose a local project folder to open project-aware sessions, coding workflows, and review surfaces.'
              : 'Use conversation mode when you want a direct assistant exchange without binding to a project.'}
          </p>
        </section>
      ) : null}
    </div>
  )
}
