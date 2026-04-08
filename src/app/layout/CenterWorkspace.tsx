import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  FileImage,
  FilePlus2,
  FileText,
  FolderOpen,
  MessageSquare,
  SendHorizontal,
  ShieldAlert,
  X,
} from 'lucide-react'
import { FormEvent, KeyboardEvent } from 'react'
import { pickProjectDirectory } from '../services/projectService'
import { useAppShellStore } from '../state/appShellStore'
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
    return (
      <div className="conversation-empty">
        <h3>{mode === 'project' ? 'Start a coding session' : 'Start a conversation'}</h3>
        <p>
          {mode === 'project'
            ? 'Describe the task for this workspace to begin an attached coding session.'
            : 'Send a message without opening a workspace.'}
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
        <ArrowUpRight size={14} />
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
          <FolderOpen size={14} />
          <span>Open workspace</span>
        </button>
      </div>
      <button className="workspace__conversation-entry" onClick={() => onConversation().catch(() => undefined)}>
        <MessageSquare size={14} />
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

function InlineApprovalSummary({
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
            <span>Awaiting approval</span>
          </span>
          <h3>{pendingProposal.summary}</h3>
        </div>
        <StatusChip status="Awaiting approval" />
      </div>
      <p className="workspace__inline-copy">
        Review the command details in the bottom panel, then approve or reject the command for this workspace.
      </p>
      <div className="approval-card__actions">
        <button className="workspace__secondary-action" onClick={() => onReject().catch(() => undefined)}>
          Reject command
        </button>
        <button className="workspace__primary-action" onClick={() => onApprove().catch(() => undefined)}>
          Approve and run
        </button>
      </div>
    </div>
  )
}

function InlineWorkflowStatusSummary() {
  const { executionRecord } = useAppShellStore()

  if (!executionRecord || executionRecord.status === 'awaiting-approval' || executionRecord.reviewState === 'ready') {
    return null
  }

  const statusLabel =
    executionRecord.status === 'running'
      ? 'Working'
      : executionRecord.status === 'rejected'
        ? 'Attached'
        : executionRecord.status === 'failed'
          ? 'Failed'
          : executionRecord.reviewState === 'unavailable'
            ? 'Attached'
            : executionRecord.status === 'completed'
              ? 'Attached'
              : 'Ready'

  const helperCopy =
    executionRecord.status === 'running'
      ? 'Command execution is in progress. Follow detailed output in the bottom panel while the session stays attached.'
      : executionRecord.status === 'rejected'
        ? 'The command was rejected before execution. You can continue the session or send a revised instruction.'
        : executionRecord.status === 'failed'
          ? 'Execution stopped before completion. Review the bottom panel output, then continue from the same session.'
          : executionRecord.reviewState === 'unavailable'
            ? executionRecord.reviewUnavailableMessage ?? 'Execution completed, but review artifacts were unavailable for this workspace.'
            : executionRecord.reviewState === 'empty'
              ? 'Execution finished without changed files. You can continue the session or inspect the output for more detail.'
              : 'Execution finished and the session is ready for the next step.'

  return (
    <div className={`workspace__inline-surface workspace__inline-surface--status ${executionRecord.reviewState === 'unavailable' ? 'workspace__inline-surface--warning' : ''}`}>
      <div className="workspace__inline-surface-header">
        <div>
          <span className="conversation-event__eyebrow workspace__inline-badge">
            <FileText size={13} />
            <span>{executionRecord.reviewState === 'unavailable' ? 'Review unavailable' : statusLabel}</span>
          </span>
          <h3>{executionRecord.summary}</h3>
        </div>
        <StatusChip status={statusLabel as DesktopWorkflowStatus} />
      </div>
      <p className="workspace__inline-copy">{helperCopy}</p>
    </div>
  )
}

function InlineReviewSummary() {
  const { executionRecord, selectReviewFile } = useAppShellStore()

  if (!executionRecord || executionRecord.reviewState !== 'ready' || executionRecord.changedFiles.length === 0) {
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
        <StatusChip status="Review ready" />
      </div>
      <p className="workspace__inline-copy">Open review in the bottom panel to inspect changed files and continue the session.</p>
      <div className="review-summary-card__list review-summary-card__list--inline">
        {executionRecord.changedFiles.map((file) => (
          <button key={file.id} className="review-summary-card__file" onClick={() => selectReviewFile(file.id)}>
            <div>
              <strong>{file.path}</strong>
              <span>{file.summary}</span>
            </div>
            <span className="workspace__review-cta">
              Open review
              <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CommandHint({ draftPrompt }: { draftPrompt: string }) {
  const firstLine = draftPrompt.trim().split(/\n/)[0] ?? ''
  if (!firstLine.startsWith('/')) {
    return null
  }

  const commandName = firstLine.slice(1).split(/\s+/)[0] || 'command'
  return (
    <div className="composer__hint" role="status" aria-live="polite">
      <strong>Slash command detected</strong>
      <span>/{commandName} will be sent as Claude Code-style command input.</span>
    </div>
  )
}

function PendingAttachments({ attachments, onRemove }: { attachments: SessionAttachment[]; onRemove: (attachmentId: string) => void }) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="composer__attachments">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="composer__attachment-chip">
          <div>
            <strong>{attachment.name}</strong>
            <span>
              {attachment.kind} · {attachment.source}
            </span>
          </div>
          <button type="button" className="composer__attachment-remove" onClick={() => onRemove(attachment.id)}>
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

function Composer({
  mode,
  draftPrompt,
  pendingAttachments,
  setDraftPrompt,
  addFileAttachments,
  addImageAttachments,
  removePendingAttachment,
  submitPrompt,
  disabled,
}: {
  mode: 'project' | 'conversation'
  draftPrompt: string
  pendingAttachments: SessionAttachment[]
  setDraftPrompt: (prompt: string) => void
  addFileAttachments: () => Promise<void>
  addImageAttachments: () => Promise<void>
  removePendingAttachment: (attachmentId: string) => void
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

  const buttonLabel = mode === 'project' ? 'Send instruction' : 'Send message'

  return (
    <form className={`composer composer--${mode}`} onSubmit={handleSubmit}>
      <CommandHint draftPrompt={draftPrompt} />
      <div className="composer__toolbar">
        <button className="workspace__secondary-action" type="button" onClick={() => addFileAttachments().catch(() => undefined)} disabled={disabled}>
          <FilePlus2 size={14} />
          <span>File</span>
        </button>
        <button className="workspace__secondary-action" type="button" onClick={() => addImageAttachments().catch(() => undefined)} disabled={disabled}>
          <FileImage size={14} />
          <span>Image</span>
        </button>
        <span className="composer__slash-hint">Type / to use slash commands</span>
      </div>
      <PendingAttachments attachments={pendingAttachments} onRemove={removePendingAttachment} />
      <div className="composer__field">
        <textarea
          id="assistant-prompt"
          className="composer__input"
          value={draftPrompt}
          onChange={(event) => setDraftPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'project'
              ? 'Describe the next task for this workspace.'
              : 'Send a message to the assistant.'
          }
          rows={mode === 'project' ? 3 : 4}
          disabled={disabled}
        />
        <button
          className="workspace__primary-action composer__send"
          type="submit"
          disabled={disabled || !draftPrompt.trim()}
          aria-label={buttonLabel}
          title={mode === 'project' ? 'Ctrl/Cmd + Enter sends instruction' : 'Ctrl/Cmd + Enter sends message'}
        >
          <SendHorizontal size={15} />
        </button>
      </div>
      <div className="composer__footer">
        <span>{buttonLabel}</span>
        <span>Ctrl/Cmd + Enter</span>
      </div>
    </form>
  )
}

function SessionHeader({ header, mode }: { header: DesktopSessionHeader; mode: 'project' | 'conversation' }) {
  return (
    <div className="workspace__session-header-card">
      <div className="workspace__session-header-main">
        <div>
          <span className="workspace__eyebrow">{mode === 'project' ? 'Attached session' : 'Conversation session'}</span>
          <h2>{header.title}</h2>
          <p>{header.currentActivitySummary ?? 'Ready to continue work.'}</p>
        </div>
        <StatusChip status={header.workflowStatus} />
      </div>
      <div className="workspace__session-meta-grid">
        <div>
          <span>Workspace</span>
          <strong>{header.projectName}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{header.modelId}</strong>
        </div>
        <div>
          <span>Last activity</span>
          <strong>{formatRelativeTime(header.lastActivityAt)}</strong>
        </div>
        <div>
          <span>Session state</span>
          <strong>{header.workflowStatus}</strong>
        </div>
      </div>
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
  approvePendingCommand,
  rejectPendingCommand,
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
  approvePendingCommand: () => Promise<void>
  rejectPendingCommand: () => Promise<void>
}) {
  return (
    <section className="workspace__session-surface">
      <SessionHeader header={header} mode={mode} />
      <div className="workspace__conversation-body">
        {mode === 'project' ? <InlineApprovalSummary onApprove={approvePendingCommand} onReject={rejectPendingCommand} /> : null}
        {mode === 'project' ? <InlineWorkflowStatusSummary /> : null}
        {mode === 'project' ? <InlineReviewSummary /> : null}
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
    approvePendingCommand,
    attemptRecovery,
    createConversationSession,
    createProjectSession,
    currentStageLabel,
    draftPrompt,
    getDesktopWorkflow,
    loadSessionHistory,
    mode,
    pendingAttachments,
    pendingProposal,
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
    rejectPendingCommand,
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
            <AlertTriangle size={14} /> Assistant request failed
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
            <MessageSquare size={14} />
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
          disabled={assistantStatus === 'streaming' || Boolean(pendingProposal)}
          approvePendingCommand={approvePendingCommand}
          rejectPendingCommand={rejectPendingCommand}
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
          disabled={assistantStatus === 'streaming' || Boolean(pendingProposal)}
          approvePendingCommand={approvePendingCommand}
          rejectPendingCommand={rejectPendingCommand}
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
