import { CheckCircle2, ChevronDown, ChevronUp, FileText, ShieldAlert, Terminal, XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useAppShellStore } from '../state/appShellStore'

function formatExecutionStatus(status: string, reviewState: 'pending' | 'ready' | 'empty' | 'unavailable') {
  switch (status) {
    case 'awaiting-approval':
      return 'Awaiting approval'
    case 'running':
      return 'Working'
    case 'completed':
      return reviewState === 'ready' ? 'Review ready' : reviewState === 'unavailable' ? 'Review unavailable' : 'Execution complete'
    case 'failed':
      return 'Failed'
    case 'rejected':
      return 'Ready'
    default:
      return 'Ready'
  }
}

function formatImpactLabel(command: string) {
  if (/\b(rm|del|remove|drop|reset|restore)\b/i.test(command)) {
    return 'High impact'
  }

  if (/\b(git|npm|cargo|pnpm|yarn)\b/i.test(command)) {
    return 'Elevated impact'
  }

  return 'Standard impact'
}

function getReviewDegradedMessage(output: { stream: string; text: string }[] | undefined) {
  return output?.find((entry) => entry.stream === 'system' && /review unavailable/i.test(entry.text))?.text ?? null
}

export function BottomPanel() {
  const {
    activeProjectPath,
    activeSession,
    approvePendingCommand,
    bottomPanelExpanded,
    bottomPanelTab,
    executionRecord,
    getDesktopTrayMode,
    pendingProposal,
    rejectPendingCommand,
    selectedReviewFileId,
    selectReviewFile,
    setBottomPanelExpanded,
    setBottomPanelTab,
  } = useAppShellStore()

  const trayMode = getDesktopTrayMode()
  const effectiveTab = pendingProposal ? 'output' : bottomPanelTab
  const reviewDegradedMessage = executionRecord?.reviewUnavailableMessage ?? getReviewDegradedMessage(executionRecord?.output)
  const reviewState = executionRecord?.reviewState ?? 'pending'

  const selectedReviewFile = useMemo(
    () => executionRecord?.changedFiles.find((file) => file.id === selectedReviewFileId) ?? executionRecord?.changedFiles[0] ?? null,
    [executionRecord, selectedReviewFileId],
  )

  const title =
    trayMode === 'approval'
      ? 'Awaiting approval'
      : trayMode === 'review'
        ? 'Review ready'
        : trayMode === 'output'
          ? executionRecord?.status === 'failed'
            ? 'Execution failed'
            : executionRecord?.status === 'completed'
              ? reviewState === 'unavailable'
                ? 'Review unavailable'
                : 'Execution complete'
              : 'Working'
          : 'Lifecycle tray'

  const summary =
    trayMode === 'approval'
      ? 'Review the exact command context before approving execution.'
      : trayMode === 'review'
        ? `${executionRecord?.changedFiles.length ?? 0} changed file${executionRecord?.changedFiles.length === 1 ? '' : 's'} available for inspection.`
        : trayMode === 'output'
          ? reviewState === 'unavailable'
            ? 'Execution completed, but review artifacts were unavailable for this workspace.'
            : executionRecord?.output.length
              ? 'Execution output is tied to the current session action.'
              : 'Waiting for execution output.'
          : 'Approval, output, and review details appear here when the session needs them.'

  return (
    <div className="bottom-panel" data-collapsed={!bottomPanelExpanded}>
      <button className="bottom-panel__toggle" onClick={() => setBottomPanelExpanded(!bottomPanelExpanded)}>
        <div className="bottom-panel__toggle-content">
          {trayMode === 'approval' ? <ShieldAlert size={15} /> : effectiveTab === 'review' ? <FileText size={15} /> : <Terminal size={15} />}
          <div>
            <span>{title}</span>
            <small>{summary}</small>
          </div>
        </div>
        {bottomPanelExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>
      {bottomPanelExpanded ? (
        <div className="bottom-panel__content">
          <div className="bottom-panel__header">
            <div>
              <h2>{title}</h2>
              <p>{summary}</p>
            </div>
            {pendingProposal ? <span className="bottom-panel__status bottom-panel__status--warning">Awaiting approval</span> : null}
            {!pendingProposal && executionRecord ? (
              <span className="bottom-panel__status">
                {formatExecutionStatus(executionRecord.status, reviewState)}
              </span>
            ) : null}
          </div>

          {(pendingProposal || executionRecord) ? (
            <div className="bottom-panel__tabs">
              <button
                className={`bottom-panel__tab ${trayMode === 'approval' ? 'bottom-panel__tab--active' : ''}`}
                onClick={() => setBottomPanelExpanded(true)}
                disabled={!pendingProposal}
              >
                <ShieldAlert size={14} />
                <span>Approval</span>
              </button>
              <button
                className={`bottom-panel__tab ${effectiveTab === 'output' && trayMode !== 'approval' ? 'bottom-panel__tab--active' : ''}`}
                onClick={() => setBottomPanelTab('output')}
                disabled={!executionRecord}
              >
                <Terminal size={14} />
                <span>Output</span>
              </button>
              <button
                className={`bottom-panel__tab ${effectiveTab === 'review' ? 'bottom-panel__tab--active' : ''}`}
                onClick={() => setBottomPanelTab('review')}
                disabled={!executionRecord}
              >
                <FileText size={14} />
                <span>Review</span>
              </button>
            </div>
          ) : null}

          {pendingProposal ? (
            <div className="bottom-panel__approval-surface">
              <div className="bottom-panel__approval-grid">
                <div className="bottom-panel__approval-field bottom-panel__approval-field--summary">
                  <span>Summary</span>
                  <strong>{pendingProposal.summary}</strong>
                </div>
                <div className="bottom-panel__approval-field bottom-panel__approval-field--command">
                  <span>Command</span>
                  <code>{pendingProposal.command}</code>
                </div>
                <div className="bottom-panel__approval-field">
                  <span>Workspace path</span>
                  <strong>{pendingProposal.projectPath}</strong>
                </div>
                <div className="bottom-panel__approval-field">
                  <span>Working directory</span>
                  <strong>{pendingProposal.workingDirectory}</strong>
                </div>
                <div className="bottom-panel__approval-field">
                  <span>Approval status</span>
                  <strong>Awaiting approval</strong>
                </div>
                <div className="bottom-panel__approval-field">
                  <span>Impact</span>
                  <strong>{formatImpactLabel(pendingProposal.command)}</strong>
                </div>
              </div>
              <div className="bottom-panel__approval-actions">
                <button className="workspace__secondary-action bottom-panel__reject-action" onClick={() => rejectPendingCommand().catch(() => undefined)}>
                  <XCircle size={14} />
                  <span>Reject command</span>
                </button>
                <button className="workspace__primary-action" onClick={() => approvePendingCommand().catch(() => undefined)}>
                  <CheckCircle2 size={14} />
                  <span>Approve and run</span>
                </button>
              </div>
            </div>
          ) : null}

          {executionRecord && effectiveTab === 'output' && !pendingProposal ? (
            <>
              {reviewDegradedMessage ? (
                <div className="bottom-panel__degraded-review" role="status">
                  <strong>Review unavailable</strong>
                  <p>{reviewDegradedMessage}</p>
                </div>
              ) : null}
              <div className="bottom-panel__log-viewer" role="log" aria-live="polite">
                {executionRecord.output.length === 0 ? (
                  <p className="bottom-panel__empty">Waiting for execution output.</p>
                ) : (
                  executionRecord.output.map((entry) => (
                    <div key={entry.id} className={`bottom-panel__log-line bottom-panel__log-line--${entry.stream}`}>
                      <span className="bottom-panel__log-stream">{entry.stream}</span>
                      <span>{entry.text}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}

          {executionRecord && effectiveTab === 'review' && !pendingProposal ? (
            <div className="bottom-panel__review-surface">
              <div className="bottom-panel__review-files">
                {executionRecord.reviewState === 'unavailable' ? (
                  <p className="bottom-panel__empty bottom-panel__empty--warning">Review artifacts are unavailable for this execution.</p>
                ) : executionRecord.reviewState === 'empty' ? (
                  <p className="bottom-panel__empty">No changed files are available yet.</p>
                ) : (
                  executionRecord.changedFiles.map((file) => (
                    <button
                      key={file.id}
                      className={`bottom-panel__review-file ${selectedReviewFile?.id === file.id ? 'bottom-panel__review-file--active' : ''}`}
                      onClick={() => selectReviewFile(file.id)}
                    >
                      <strong>{file.path}</strong>
                      <span>{file.summary}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="bottom-panel__review-diff">
                {selectedReviewFile ? (
                  <>
                    <h3>{selectedReviewFile.path}</h3>
                    <p>{selectedReviewFile.summary}</p>
                    <pre>{selectedReviewFile.diff}</pre>
                    <div className="bottom-panel__review-followup">
                      <span>Continue from the composer after inspecting the selected diff.</span>
                    </div>
                  </>
                ) : executionRecord.reviewState === 'unavailable' ? (
                  <>
                    <h3>Review unavailable</h3>
                    <p>{reviewDegradedMessage}</p>
                    <div className="bottom-panel__review-followup">
                      <span>Execution output is still available in the Output tab for this session action.</span>
                    </div>
                  </>
                ) : executionRecord.reviewState === 'empty' ? (
                  <>
                    <h3>No changed files</h3>
                    <p>No changed files are available yet.</p>
                    <div className="bottom-panel__review-followup">
                      <span>Continue from the composer or review the execution output for more detail.</span>
                    </div>
                  </>
                ) : (
                  <p className="bottom-panel__empty">Review will appear here when execution artifacts arrive.</p>
                )}
              </div>
            </div>
          ) : null}

          {!executionRecord && !pendingProposal ? (
            <p className="bottom-panel__empty">Approval, output, and review details appear here when the session needs them.</p>
          ) : null}

          {!activeSession && activeProjectPath ? <p className="bottom-panel__context-note">Open a session in the workspace to activate the lifecycle tray.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
