import {
  AlertTriangle,
  ArrowUpRight,
  FolderOpen,
  MessageSquare,
} from 'lucide-react'
import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'
import { Composer } from '../components/Composer'
import { EmptyState } from '../components/EmptyState/EmptyState'
import type {
  DesktopChooserRow,
  DesktopSessionHeader,
  DesktopWorkflowStatus,
  RecoverySpotlight,
  SessionAttachment,
  SessionTranscriptEvent,
  WorkspaceSummaryViewModel,
} from '../state/types'

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

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function statusTone(status: DesktopWorkflowStatus) {
  if (status === 'Awaiting approval') {
    return 'warning'
  }

  if (status === 'Failed' || status === 'Needs attention') {
    return 'danger'
  }

  if (status === 'Review ready') {
    return 'review'
  }

  if (status === 'Connected' || status === 'Attached' || status === 'Working') {
    return 'accent'
  }

  return 'neutral'
}

function EventAttachments({ attachments }: { attachments?: SessionAttachment[] }) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div className="conversation-attachments">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="conversation-attachment-chip">
          <strong>{attachment.name}</strong>
          <span>{attachment.kind}</span>
        </div>
      ))}
    </div>
  )
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
        <span className="conversation-event__eyebrow">Awaiting approval</span>
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
    const executionLabel =
      event.executionStatus === 'failed'
        ? 'Failed'
        : event.executionStatus === 'running'
          ? 'Working'
          : event.executionStatus === 'completed'
            ? 'Completed'
            : event.executionStatus === 'rejected'
              ? 'Rejected'
              : 'Execution update'

    return (
      <div className="conversation-event conversation-event--execution">
        <span className="conversation-event__eyebrow">{executionLabel}</span>
        <p>{event.body}</p>
      </div>
    )
  }

  if (event.kind === 'review-available') {
    return (
      <div className="conversation-event conversation-event--review">
        <span className="conversation-event__eyebrow">Review ready</span>
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
      <EventAttachments attachments={event.attachments} />
    </div>
  )
}

function Transcript({
  events,
  mode,
  assistantStatus,
  currentStageLabel,
}: {
  events: SessionTranscriptEvent[]
  mode: 'project' | 'conversation'
  assistantStatus: 'idle' | 'streaming' | 'error'
  currentStageLabel: string | null
}) {
  if (events.length === 0) {
    return <EmptyState mode={mode} />
  }

  return (
    <div className="conversation-transcript" role="log" aria-live="polite">
      {events.map((event) => (
        <EventRow key={event.id} event={event} mode={mode} />
      ))}
      {assistantStatus === 'streaming' ? (
        <div className="conversation-streaming-indicator">
          <strong>{currentStageLabel ?? 'Working'}</strong>
          <span>{mode === 'project' ? 'Streaming coding session updates.' : 'Streaming conversation updates.'}</span>
        </div>
      ) : null}
    </div>
  )
}

function StatusChip({ status }: { status: DesktopWorkflowStatus }) {
  return <span className={`workspace__status-pill workspace__status-pill--${statusTone(status)}`}>{status}</span>
}

function AttentionMarker({ attention }: { attention: DesktopChooserRow['attention'] }) {
  if (!attention) {
    return null
  }

  const label =
    attention === 'approval'
      ? 'Approval'
      : attention === 'review'
        ? 'Review'
        : attention === 'failure'
          ? 'Failed'
          : 'Recovery'

  return <span className={`workspace__attention-marker workspace__attention-marker--${attention}`}>{label}</span>
}

function WorkspaceSummaryCard({
  workspace,
  onStartNew,
}: {
  workspace: WorkspaceSummaryViewModel | null
  onStartNew: () => Promise<void>
}) {
  if (!workspace) {
    return null
  }

  return (
    <section className="workspace__summary-card">
      <div>
        <span className="workspace__eyebrow">Current workspace</span>
        <h2>{workspace.projectName}</h2>
        <p>{workspace.summary}</p>
      </div>
      <div className="workspace__summary-meta">
        <div>
          <span>Path</span>
          <strong>{workspace.projectPath}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{workspace.workflowStatus}</strong>
        </div>
        <div>
          <span>Sessions</span>
          <strong>{workspace.sessionCount}</strong>
        </div>
      </div>
      {workspace.sessionCount === 0 ? (
        <div className="workspace__summary-actions">
          <button className="workspace__primary-action" onClick={() => onStartNew().catch(() => undefined)}>
            Start new session
          </button>
        </div>
      ) : null}
    </section>
  )
}

function RecoveryCallout({
  spotlight,
  onResume,
  onOpenChooser,
}: {
  spotlight: RecoverySpotlight
  onResume: (sessionId: string) => Promise<void>
  onOpenChooser: () => void
}) {
  return (
    <section className="workspace__recovery">
      <div className="workspace__recovery-header">
        <div>
          <span className="workspace__eyebrow">Recovery available</span>
          <h2>{spotlight.title}</h2>
          <p>Resume the last attached coding session or open the full chooser.</p>
        </div>
        <StatusChip status={spotlight.workflowStatus} />
      </div>
      <div className="workspace__recovery-grid">
        <div>
          <span>Workspace</span>
          <strong>{spotlight.projectName}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{spotlight.effectiveModelId}</strong>
        </div>
        <div>
          <span>Last activity</span>
          <strong>{formatRelativeTime(spotlight.lastActivityAt)}</strong>
        </div>
        <div>
          <span>Workflow state</span>
          <strong>{spotlight.workflowStatus}</strong>
        </div>
      </div>
      {spotlight.recentActivity ? <p className="workspace__recovery-summary">{spotlight.recentActivity.summary}</p> : null}
      <div className="workspace__recovery-actions">
        <button className="workspace__primary-action" onClick={() => onResume(spotlight.sessionId).catch(() => undefined)}>
          Resume session
        </button>
        <button className="workspace__secondary-action" onClick={onOpenChooser}>
          Open session chooser
        </button>
      </div>
    </section>
  )
}

function ResumeSessionSpotlight({ row, onOpen }: { row: DesktopChooserRow; onOpen: (sessionId: string) => Promise<void> }) {
  const actionLabel = row.primaryAction === 'attach' ? 'Attach' : 'Resume'

  return (
    <section className="workspace__spotlight">
      <div className="workspace__spotlight-copy">
        <span className="workspace__eyebrow">Resume session</span>
        <div className="workspace__spotlight-title-row">
          <h3>{row.title}</h3>
          <StatusChip status={row.workflowStatus} />
        </div>
        <p>{row.summary}</p>
      </div>
      <div className="workspace__spotlight-meta">
        <span>{row.projectName}</span>
        <span>{row.modelId}</span>
        <span>{formatRelativeTime(row.lastActivityAt)}</span>
        <AttentionMarker attention={row.attention} />
      </div>
      <div className="workspace__spotlight-actions">
        <button className="workspace__primary-action" onClick={() => onOpen(row.sessionId).catch(() => undefined)}>
          {actionLabel}
        </button>
      </div>
    </section>
  )
}

function SessionRow({ row, onOpen }: { row: DesktopChooserRow; onOpen: (sessionId: string) => Promise<void> }) {
  const actionLabel = row.primaryAction === 'attach' ? 'Attach' : 'Resume'

  return (
    <button className={classNames('workspace__session-row', row.isActive && 'workspace__session-row--active')} onClick={() => onOpen(row.sessionId)}>
      <div className="workspace__session-header">
        <div className="workspace__session-title-wrap">
          <strong>{row.title}</strong>
          <AttentionMarker attention={row.attention} />
        </div>
        <StatusChip status={row.workflowStatus} />
      </div>
      <p className="workspace__session-summary">{row.summary}</p>
      <div className="workspace__session-meta">
        <span>{row.projectName}</span>
        <span>{row.modelId}</span>
        <span>{formatRelativeTime(row.lastActivityAt)}</span>
      </div>
      <div className="workspace__session-action-row">
        <span className="workspace__session-action-label">{actionLabel}</span>
        <ArrowUpRight size={18} strokeWidth={2} />
      </div>
    </button>
  )
}

function SessionList({
  rows,
  onResume,
}: {
  rows: DesktopChooserRow[]
  onResume: (sessionId: string) => Promise<void>
}) {
  return (
    <section className="workspace__chooser-section">
      <div className="workspace__section-heading">
        <div>
          <span className="workspace__eyebrow">Recent sessions</span>
          <h3>Choose a coding session</h3>
        </div>
      </div>
      <div className="workspace__history-list" role="list" aria-label="Recent sessions">
        {rows.map((row) => (
          <SessionRow key={row.sessionId} row={row} onOpen={onResume} />
        ))}
      </div>
    </section>
  )
}

function NoWorkspaceState({
  onOpenWorkspace,
  onConversation,
}: {
  onOpenWorkspace: () => void
  onConversation: () => Promise<void>
}) {
  return (
    <section className="workspace__surface workspace__surface--empty workspace__surface--hero">
      <span className="workspace__eyebrow">Workspace required</span>
      <h2>No workspace selected</h2>
      <p>Open a local workspace to resume a coding session, attach to recent work, or start a new session.</p>
      <div className="workspace__state-actions workspace__state-actions--hero">
        <button className="workspace__primary-action" onClick={onOpenWorkspace}>
          <FolderOpen size={18} strokeWidth={2} />
          <span>Open workspace</span>
        </button>
      </div>
      <button className="workspace__conversation-entry" onClick={() => onConversation().catch(() => undefined)}>
        <MessageSquare size={18} strokeWidth={2} />
        <span>Send message without opening a workspace</span>
      </button>
    </section>
  )
}

function RecoveryFailedState({
  message,
  onOpenChooser,
  onStartNew,
}: {
  message: string | null
  onOpenChooser: () => void
  onStartNew: () => Promise<void>
}) {
  return (
    <section className="workspace__surface workspace__surface--state">
      <span className="workspace__eyebrow">Recovery issue</span>
      <h2>Session recovery failed</h2>
      <p>{message ?? 'We couldn’t load local session data. Retry the chooser, or start a new session for this workspace.'}</p>
      <div className="workspace__state-actions">
        <button className="workspace__primary-action" onClick={onOpenChooser}>
          Open session chooser
        </button>
        <button className="workspace__secondary-action" onClick={() => onStartNew().catch(() => undefined)}>
          Start new session
        </button>
      </div>
    </section>
  )
}

function NoSessionsState({ onStartNew }: { onStartNew: () => Promise<void> }) {
  return (
    <section className="workspace__surface workspace__surface--state">
      <span className="workspace__eyebrow">Session chooser</span>
      <h2>No sessions yet</h2>
      <p>Start a new session for this workspace, or switch workspaces to reopen earlier work.</p>
      <div className="workspace__state-actions">
        <button className="workspace__primary-action" onClick={() => onStartNew().catch(() => undefined)}>
          Start new session
        </button>
      </div>
    </section>
  )
}

// Inline approval/review cards removed - Phase 8 simplification

function SessionHeader({ header, mode }: { header: DesktopSessionHeader; mode: 'project' | 'conversation' }) {
  return (
    <div className="workspace__session-header">
      <div className="workspace__session-header-main">
        <div className="workspace__session-title-group">
          <span className="workspace__eyebrow">{mode === 'project' ? 'Attached session' : 'Conversation session'}</span>
          <h2>{header.title}</h2>
        </div>
        <StatusChip status={header.workflowStatus} />
      </div>
      {header.currentActivitySummary && (
        <p className="workspace__session-activity">{header.currentActivitySummary}</p>
      )}
    </div>
  )
}

function SessionSurface({
  header,
  mode,
  transcript,
  assistantStatus,
  currentStageLabel,
  draftPrompt,
  pendingAttachments,
  setDraftPrompt,
  addFileAttachments,
  addImageAttachments,
  removePendingAttachment,
  submitPrompt,
  disabled,
}: {
  header: DesktopSessionHeader
  mode: 'project' | 'conversation'
  transcript: SessionTranscriptEvent[]
  assistantStatus: 'idle' | 'streaming' | 'error'
  currentStageLabel: string | null
  draftPrompt: string
  pendingAttachments: SessionAttachment[]
  setDraftPrompt: (prompt: string) => void
  addFileAttachments: () => Promise<void>
  addImageAttachments: () => Promise<void>
  removePendingAttachment: (attachmentId: string) => void
  submitPrompt: () => Promise<void>
  disabled: boolean
}) {
  return (
    <section className="workspace__session-surface">
      <SessionHeader header={header} mode={mode} />
      <div className="workspace__conversation-body">
        <Transcript
          events={transcript}
          mode={mode}
          assistantStatus={assistantStatus}
          currentStageLabel={currentStageLabel}
        />
      </div>
      <Composer
        mode={mode}
        draftPrompt={draftPrompt}
        pendingAttachments={pendingAttachments}
        setDraftPrompt={setDraftPrompt}
        addFileAttachments={addFileAttachments}
        addImageAttachments={addImageAttachments}
        removePendingAttachment={removePendingAttachment}
        submitPrompt={submitPrompt}
        disabled={disabled}
      />
    </section>
  )
}

export function CenterWorkspace() {
  const {
    activeSession,
    activeShellView,
    assistantError,
    assistantStatus,
    attemptRecovery,
    createConversationSession,
    createProjectSession,
    currentStageLabel,
    draftPrompt,
    getDesktopWorkflow,
    loadSessionHistory,
    mode,
    pendingAttachments,
    projectWarning,
    recoveryMessage,
    removePendingAttachment,
    resumeSession,
    setActiveProject,
    setDraftPrompt,
    setShellView,
    addFileAttachments,
    addImageAttachments,
    sessionHistoryError,
    sessionHistoryStatus,
    submitPrompt,
  } = useAppShellStore()

  const desktopWorkflow = getDesktopWorkflow()
  const { startupState, chooser, recovery, activeSessionHeader } = desktopWorkflow
  const spotlightRow = chooser.spotlight && !chooser.spotlight.isActive ? chooser.spotlight : null
  const recentRows = chooser.rows.filter((row) => row.sessionId !== spotlightRow?.sessionId)
  const showProjectChooser = mode === 'project' && !activeSession && (startupState === 'chooser-ready' || activeShellView === 'project-sessions')
  const showProjectSession = mode === 'project' && Boolean(activeSession && activeSessionHeader)
  const showConversationSession = mode === 'conversation' && Boolean(activeSession && activeSessionHeader)

  const handleOpenWorkspace = async () => {
    try {
      const project = await pickProjectDirectory()
      if (!project) {
        return
      }

      setActiveProject(project)
      await loadSessionHistory({ projectPath: project.path })
    } catch {
      console.error('Failed to open workspace')
    }
  }

  return (
    <div className="workspace">
      {projectWarning ? <div className="workspace__banner workspace__banner--warning">{projectWarning}</div> : null}
      {assistantError ? (
        <div className="workspace__banner workspace__banner--error">
          <strong>
            <AlertTriangle size={18} strokeWidth={2} /> Assistant request failed
          </strong>
          <p>{assistantError}</p>
        </div>
      ) : null}

      {startupState === 'recovery-available' && recovery.spotlight ? (
        <RecoveryCallout
          spotlight={recovery.spotlight}
          onResume={resumeSession}
          onOpenChooser={() => {
            setShellView('project-sessions')
            loadSessionHistory({ projectPath: recovery.spotlight?.projectPath ?? null }).catch(() => undefined)
          }}
        />
      ) : null}

      {startupState === 'recovery-failed' ? (
        <RecoveryFailedState
          message={recoveryMessage}
          onOpenChooser={() => {
            setShellView('project-sessions')
            loadSessionHistory().catch(() => undefined)
          }}
          onStartNew={createProjectSession}
        />
      ) : null}

      {startupState === 'no-workspace' ? (
        <NoWorkspaceState onOpenWorkspace={() => void handleOpenWorkspace()} onConversation={createConversationSession} />
      ) : null}

      {showProjectChooser ? (
        <section className="workspace__chooser workspace__surface">
          <div className="workspace__surface-header">
            <div>
              <span className="workspace__eyebrow">Session chooser</span>
              <h2>Choose where to continue work</h2>
              <p>Review the active workspace, resume a recent session, or start a new coding session.</p>
            </div>
            <StatusChip status={desktopWorkflow.desktopStatus} />
          </div>

          <WorkspaceSummaryCard workspace={desktopWorkflow.activeWorkspace} onStartNew={createProjectSession} />

          {spotlightRow ? <ResumeSessionSpotlight row={spotlightRow} onOpen={resumeSession} /> : null}

          {sessionHistoryStatus === 'error' ? (
            <div className="workspace__state-card workspace__state-card--error">
              <h3>We couldn’t load session history</h3>
              <p>{sessionHistoryError ?? 'Retry the chooser, or restart the app to reload local session data.'}</p>
              <button className="workspace__secondary-action" onClick={() => loadSessionHistory().catch(() => undefined)}>
                Reload history
              </button>
            </div>
          ) : null}

          {sessionHistoryStatus !== 'error' && !chooser.hasSessions ? <NoSessionsState onStartNew={createProjectSession} /> : null}

          {recentRows.length > 0 ? <SessionList rows={recentRows} onResume={resumeSession} /> : null}

          <div className="workspace__new-session-bar">
            <div>
              <span className="workspace__eyebrow">New session</span>
              <h3>Start new session</h3>
              <p>Open a clean coding session for the current workspace.</p>
            </div>
            <button className="workspace__primary-action" onClick={() => createProjectSession().catch(() => undefined)}>
              Start new session
            </button>
          </div>

          <button className="workspace__conversation-entry" onClick={() => createConversationSession().catch(() => undefined)}>
            <MessageSquare size={18} strokeWidth={2} />
            <span>Send message without switching the coding workspace</span>
          </button>
        </section>
      ) : null}

      {showProjectSession && activeSession && activeSessionHeader ? (
        <SessionSurface
          header={activeSessionHeader}
          mode="project"
          transcript={activeSession.transcript}
          assistantStatus={assistantStatus}
          currentStageLabel={currentStageLabel}
          draftPrompt={draftPrompt}
          pendingAttachments={pendingAttachments}
          setDraftPrompt={setDraftPrompt}
          addFileAttachments={addFileAttachments}
          addImageAttachments={addImageAttachments}
          removePendingAttachment={removePendingAttachment}
          submitPrompt={submitPrompt}
          disabled={assistantStatus === 'streaming'}
        />
      ) : null}

      {showConversationSession && activeSession && activeSessionHeader ? (
        <SessionSurface
          header={activeSessionHeader}
          mode="conversation"
          transcript={activeSession.transcript}
          assistantStatus={assistantStatus}
          currentStageLabel={currentStageLabel}
          draftPrompt={draftPrompt}
          pendingAttachments={pendingAttachments}
          setDraftPrompt={setDraftPrompt}
          addFileAttachments={addFileAttachments}
          addImageAttachments={addImageAttachments}
          removePendingAttachment={removePendingAttachment}
          submitPrompt={submitPrompt}
          disabled={assistantStatus === 'streaming'}
        />
      ) : null}

      {!showProjectChooser && !showProjectSession && !showConversationSession && startupState !== 'no-workspace' && startupState !== 'recovery-failed' ? (
        <section className="workspace__surface workspace__surface--state">
          <span className="workspace__eyebrow">Workspace loading</span>
          <h2>Loading workspace and recent sessions.</h2>
          <p>{recovery.message ?? 'Restoring session context.'}</p>
          <div className="workspace__state-actions">
            <button className="workspace__secondary-action" onClick={() => attemptRecovery().catch(() => undefined)}>
              Retry recovery
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
