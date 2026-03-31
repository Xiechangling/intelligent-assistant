import { FileText, Settings, X } from 'lucide-react'
import { useAppShellStore } from '../state/appShellStore'

function formatTime(timestamp: string | null) {
  if (!timestamp) {
    return '—'
  }

  return new Date(Number(timestamp)).toLocaleString()
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

export function RightPanel() {
  const {
    activeProjectPath,
    activeSession,
    activePresetId,
    activeSessionModelOverride,
    assistantStatus,
    currentStageLabel,
    credentialStatus,
    executionRecord,
    globalDefaultModel,
    mode,
    pendingProposal,
    presets,
    rightPanelView,
    savePreset,
    applyPreset,
    setRightPanelOpen,
    setRightPanelView,
    skillToggles,
    toggleSkill,
  } = useAppShellStore()

  const effectiveModel = activeSessionModelOverride ?? globalDefaultModel

  return (
    <div className="right-panel">
      <div className="right-panel__drawer-header">
        <div className="right-panel__drawer-title">
          {rightPanelView === 'context' ? <FileText size={15} /> : <Settings size={15} />}
          <strong>Inspector</strong>
        </div>
        <button className="right-panel__close" onClick={() => setRightPanelOpen(false)}>
          <X size={15} />
          <span>Close</span>
        </button>
      </div>
      <div className="right-panel__tabs">
        <button
          className={`right-panel__tab ${rightPanelView === 'context' ? 'right-panel__tab--active' : ''}`}
          onClick={() => setRightPanelView('context')}
        >
          <FileText size={14} />
          <span>Context</span>
        </button>
        <button
          className={`right-panel__tab ${rightPanelView === 'settings' ? 'right-panel__tab--active' : ''}`}
          onClick={() => setRightPanelView('settings')}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
      <div className="right-panel__content">
        {rightPanelView === 'context' ? (
          <>
            <div className="right-panel__section">
              <h2 className="right-panel__heading">Session</h2>
              <div className="right-panel__row-list">
                <div className="right-panel__row"><span>Mode</span><strong>{mode}</strong></div>
                <div className="right-panel__row"><span>Project</span><strong>{mode === 'conversation' ? 'Not required' : activeProjectPath ?? 'None selected'}</strong></div>
                <div className="right-panel__row"><span>Model</span><strong>{effectiveModel}</strong></div>
                <div className="right-panel__row"><span>Credential</span><strong>{credentialStatus}</strong></div>
                <div className="right-panel__row"><span>Status</span><strong>{assistantStatus === 'streaming' ? currentStageLabel ?? 'Responding' : 'Ready'}</strong></div>
              </div>
            </div>

            {activeSession ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Active session</h2>
                <div className="right-panel__row-list">
                  <div className="right-panel__row"><span>Title</span><strong>{activeSession.title}</strong></div>
                  <div className="right-panel__row"><span>Status</span><strong>{formatStatusLabel(activeSession.status)}</strong></div>
                  <div className="right-panel__row"><span>Created</span><strong>{formatTime(activeSession.createdAt)}</strong></div>
                  <div className="right-panel__row"><span>Activity</span><strong>{activeSession.recentActivity?.summary ?? 'No recent activity summary yet.'}</strong></div>
                </div>
              </div>
            ) : null}

            {pendingProposal ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Approval</h2>
                <div className="right-panel__note">
                  <strong>{pendingProposal.summary}</strong>
                  <span>{pendingProposal.projectPath}</span>
                  <span>{pendingProposal.workingDirectory}</span>
                </div>
              </div>
            ) : null}

            {executionRecord ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Execution</h2>
                <div className="right-panel__row-list">
                  <div className="right-panel__row"><span>Status</span><strong>{executionRecord.status}</strong></div>
                  <div className="right-panel__row"><span>Command</span><strong>{executionRecord.command}</strong></div>
                  <div className="right-panel__row"><span>Output lines</span><strong>{executionRecord.output.length}</strong></div>
                  <div className="right-panel__row"><span>Changed files</span><strong>{executionRecord.changedFiles.length}</strong></div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="right-panel__section">
              <div className="right-panel__settings-header">
                <h2 className="right-panel__heading">Presets</h2>
                <button className="right-panel__inline-action" onClick={() => savePreset(`Preset ${presets.length + 1}`)}>
                  Save current
                </button>
              </div>
              <div className="right-panel__settings-list">
                {presets.length === 0 ? <p className="right-panel__helper">No presets saved yet.</p> : null}
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`right-panel__settings-item ${activePresetId === preset.id ? 'right-panel__settings-item--active' : ''}`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <div>
                      <strong>{preset.name}</strong>
                      <span>{preset.mode} · {preset.modelId}</span>
                    </div>
                    <small>{activePresetId === preset.id ? 'Active' : 'Apply'}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="right-panel__section">
              <h2 className="right-panel__heading">Workflow capabilities</h2>
              <div className="right-panel__settings-list">
                {skillToggles.map((skill) => (
                  <button key={skill.id} className="right-panel__settings-item" onClick={() => toggleSkill(skill.id)}>
                    <div>
                      <strong>{skill.label}</strong>
                      <span>{skill.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <small>{skill.enabled ? 'On' : 'Off'}</small>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
