import { ChevronDown, ChevronUp, FileText, Terminal } from 'lucide-react'
import { useMemo } from 'react'
import { useAppShellStore } from '../state/appShellStore'

export function BottomPanel() {
  const {
    bottomPanelExpanded,
    bottomPanelTab,
    executionRecord,
    pendingProposal,
    selectedReviewFileId,
    selectReviewFile,
    setBottomPanelExpanded,
    setBottomPanelTab,
  } = useAppShellStore()

  const selectedReviewFile = useMemo(
    () => executionRecord?.changedFiles.find((file) => file.id === selectedReviewFileId) ?? executionRecord?.changedFiles[0] ?? null,
    [executionRecord, selectedReviewFileId],
  )

  const title = pendingProposal
    ? 'Approval required'
    : executionRecord
      ? bottomPanelTab === 'review'
        ? 'Review'
        : 'Execution output'
      : 'Utility tray'

  const summary = pendingProposal
    ? 'Review the command details before execution starts.'
    : executionRecord
      ? bottomPanelTab === 'review'
        ? `${executionRecord.changedFiles.length} changed file${executionRecord.changedFiles.length === 1 ? '' : 's'} available.`
        : `Status: ${executionRecord.status}`
      : 'Output and review surfaces appear here when needed.'

  return (
    <div className="bottom-panel" data-collapsed={!bottomPanelExpanded}>
      <button className="bottom-panel__toggle" onClick={() => setBottomPanelExpanded(!bottomPanelExpanded)}>
        <div className="bottom-panel__toggle-content">
          {bottomPanelTab === 'review' ? <FileText size={15} /> : <Terminal size={15} />}
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
            {executionRecord ? <span className="bottom-panel__status">{executionRecord.status}</span> : null}
          </div>

          {executionRecord ? (
            <div className="bottom-panel__tabs">
              <button
                className={`bottom-panel__tab ${bottomPanelTab === 'output' ? 'bottom-panel__tab--active' : ''}`}
                onClick={() => setBottomPanelTab('output')}
              >
                <Terminal size={14} />
                <span>Output</span>
              </button>
              <button
                className={`bottom-panel__tab ${bottomPanelTab === 'review' ? 'bottom-panel__tab--active' : ''}`}
                onClick={() => setBottomPanelTab('review')}
              >
                <FileText size={14} />
                <span>Review</span>
              </button>
            </div>
          ) : null}

          {pendingProposal ? (
            <div className="bottom-panel__approval-preview">
              <p><strong>Command</strong></p>
              <code>{pendingProposal.command}</code>
              <p><strong>Project</strong> {pendingProposal.projectPath}</p>
              <p><strong>Working directory</strong> {pendingProposal.workingDirectory}</p>
            </div>
          ) : null}

          {executionRecord && bottomPanelTab === 'output' ? (
            <div className="bottom-panel__log-viewer" role="log" aria-live="polite">
              {executionRecord.output.length === 0 ? (
                <p className="bottom-panel__empty">Waiting for execution output…</p>
              ) : (
                executionRecord.output.map((entry) => (
                  <div key={entry.id} className={`bottom-panel__log-line bottom-panel__log-line--${entry.stream}`}>
                    <span className="bottom-panel__log-stream">{entry.stream}</span>
                    <span>{entry.text}</span>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {executionRecord && bottomPanelTab === 'review' ? (
            <div className="bottom-panel__review-surface">
              <div className="bottom-panel__review-files">
                {executionRecord.changedFiles.length === 0 ? (
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
                  </>
                ) : (
                  <p className="bottom-panel__empty">Select a changed file to preview its diff.</p>
                )}
              </div>
            </div>
          ) : null}

          {!executionRecord && !pendingProposal ? (
            <p className="bottom-panel__empty">Run a project task to bring execution output, approval details, and review surfaces into this tray.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
