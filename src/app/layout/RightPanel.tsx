import { Check, FileText, Settings, X } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import {
  clearAssistantConnectionSettings,
  clearCredential,
  getAssistantConnectionSettings,
  replaceCredential,
  saveAssistantConnectionSettings,
  saveCredential,
} from '../services/credentialService'
import { useAppShellStore } from '../state/appShellStore'

function formatTime(timestamp: string | null) {
  if (!timestamp) {
    return '—'
  }

  return new Date(Number(timestamp)).toLocaleString()
}

function formatCredentialState(status: string) {
  if (status === 'configured') {
    return 'Connected'
  }

  if (status === 'error') {
    return 'Needs attention'
  }

  return 'Not configured'
}

function formatExecutionState(status: string, reviewState: 'pending' | 'ready' | 'empty' | 'unavailable') {
  switch (status) {
    case 'awaiting-approval':
      return 'Awaiting approval'
    case 'running':
      return 'Working'
    case 'completed':
      return reviewState === 'ready' ? 'Review ready' : reviewState === 'unavailable' ? 'Review unavailable' : 'Execution complete'
    case 'rejected':
      return 'Attached'
    case 'failed':
      return 'Failed'
    default:
      return 'Ready'
  }
}

function formatPresetMode(mode: 'project' | 'conversation') {
  return mode === 'project' ? 'Workspace' : 'Conversation'
}

function formatPresetReviewPreference(openReviewByDefault: boolean) {
  return openReviewByDefault ? 'Review open' : 'Output open'
}

export function RightPanel() {
  const {
    activeProjectPath,
    activeSession,
    activePresetId,
    activeSessionModelOverride,
    credentialStatus,
    executionRecord,
    globalDefaultModel,
    mode,
    pendingProposal,
    presets,
    rightPanelView,
    savePreset,
    applyPreset,
    setCredentialStatus,
    setRightPanelOpen,
    setRightPanelView,
    skillToggles,
    toggleSkill,
    getDesktopWorkflow,
  } = useAppShellStore()
  const [credentialDraft, setCredentialDraft] = useState('')
  const [baseUrlDraft, setBaseUrlDraft] = useState('')
  const [credentialMessage, setCredentialMessage] = useState<string | null>(null)
  const [credentialBusy, setCredentialBusy] = useState(false)

  useEffect(() => {
    if (rightPanelView === 'settings') {
      getAssistantConnectionSettings().then((settings) => {
        setBaseUrlDraft(settings.apiBaseUrl ?? '')
      })
    }
  }, [rightPanelView])

  const effectiveModel = activeSessionModelOverride ?? globalDefaultModel
  const desktopWorkflow = getDesktopWorkflow()

  const handleCredentialSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCredentialBusy(true)
    setCredentialMessage(null)
    try {
      if (credentialDraft.trim()) {
        const nextStatus = credentialStatus === 'configured' ? await replaceCredential(credentialDraft.trim()) : await saveCredential(credentialDraft.trim())
        setCredentialStatus(nextStatus)
        setCredentialDraft('')
      }

      const settings = await saveAssistantConnectionSettings(baseUrlDraft.trim())
      setBaseUrlDraft(settings.apiBaseUrl ?? '')

      setCredentialMessage('Settings saved securely.')
    } catch (error) {
      setCredentialMessage(error instanceof Error ? error.message : 'Unable to save settings.')
    } finally {
      setCredentialBusy(false)
    }
  }

  const handleCredentialClear = async () => {
    setCredentialBusy(true)
    setCredentialMessage(null)
    try {
      const nextStatus = await clearCredential()
      await clearAssistantConnectionSettings()
      setCredentialStatus(nextStatus)
      setCredentialDraft('')
      setBaseUrlDraft('')
      setCredentialMessage('Credentials and endpoint cleared.')
    } catch (error) {
      setCredentialMessage(error instanceof Error ? error.message : 'Unable to clear settings.')
    } finally {
      setCredentialBusy(false)
    }
  }

  return (
    <div className="right-panel">
      <div className="right-panel__drawer-header">
        <div className="right-panel__drawer-title">
          {rightPanelView === 'context' ? <FileText size={15} /> : <Settings size={15} />}
          <strong>{rightPanelView === 'context' ? 'Context' : 'Settings'}</strong>
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
              <h2 className="right-panel__heading">Workspace context</h2>
              <p className="right-panel__section-copy">Supportive metadata for the current workspace and session.</p>
              <div className="right-panel__row-list">
                <div className="right-panel__row"><span>Mode</span><strong>{mode === 'project' ? 'Workspace' : 'Conversation'}</strong></div>
                <div className="right-panel__row"><span>Workspace</span><strong>{mode === 'conversation' ? 'Not required' : activeProjectPath ?? 'No workspace selected'}</strong></div>
                <div className="right-panel__row"><span>Model</span><strong>{effectiveModel}</strong></div>
                <div className="right-panel__row"><span>Credential state</span><strong>{formatCredentialState(credentialStatus)}</strong></div>
                <div className="right-panel__row"><span>Workflow state</span><strong>{desktopWorkflow.desktopStatus}</strong></div>
              </div>
            </div>

            {activeSession ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Active session</h2>
                <div className="right-panel__row-list">
                  <div className="right-panel__row"><span>Title</span><strong>{activeSession.title}</strong></div>
                  <div className="right-panel__row"><span>Last activity</span><strong>{formatTime(activeSession.lastActivityAt)}</strong></div>
                  <div className="right-panel__row"><span>Session state</span><strong>{desktopWorkflow.activeSessionHeader?.workflowStatus ?? desktopWorkflow.desktopStatus}</strong></div>
                  <div className="right-panel__row"><span>Activity summary</span><strong>{activeSession.recentActivity?.summary ?? 'Ready to continue work.'}</strong></div>
                </div>
              </div>
            ) : null}

            {pendingProposal ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Approval summary</h2>
                <p className="right-panel__section-copy">Supporting context only. Approve or reject from the main workflow surface.</p>
                <div className="right-panel__note">
                  <strong>{pendingProposal.summary}</strong>
                  <span>Workspace: {pendingProposal.projectPath}</span>
                  <span>Working directory: {pendingProposal.workingDirectory}</span>
                </div>
              </div>
            ) : null}

            {executionRecord ? (
              <div className="right-panel__section">
                <h2 className="right-panel__heading">Execution summary</h2>
                <p className="right-panel__section-copy">Supportive workflow context sourced from the shared store.</p>
                <div className="right-panel__row-list">
                  <div className="right-panel__row"><span>Status</span><strong>{formatExecutionState(executionRecord.status, executionRecord.reviewState)}</strong></div>
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
                <div>
                  <h2 className="right-panel__heading">Connection settings</h2>
                  <p className="right-panel__section-copy">Manage local credentials and the optional API endpoint override.</p>
                </div>
                <span className="right-panel__helper">{formatCredentialState(credentialStatus)}</span>
              </div>
              <form className="right-panel__credential-form" onSubmit={handleCredentialSubmit}>
                <div className="right-panel__input-group">
                  <label className="right-panel__input-label">API key</label>
                  <textarea
                    className="right-panel__credential-input"
                    value={credentialDraft}
                    onChange={(event) => setCredentialDraft(event.target.value)}
                    placeholder={credentialStatus === 'configured' ? '••••••••••••••••' : 'Enter Anthropic API key'}
                    rows={1}
                    style={{ minHeight: '44px' }}
                    disabled={credentialBusy}
                  />
                </div>
                <div className="right-panel__input-group">
                  <label className="right-panel__input-label">Base URL</label>
                  <input
                    type="text"
                    className="right-panel__credential-input"
                    value={baseUrlDraft}
                    onChange={(event) => setBaseUrlDraft(event.target.value)}
                    placeholder="https://api.anthropic.com/v1/messages"
                    style={{ minHeight: '44px' }}
                    disabled={credentialBusy}
                  />
                </div>
                <div className="right-panel__credential-actions">
                  <button className="workspace__primary-action" type="submit" disabled={credentialBusy}>
                    Save settings
                  </button>
                  <button
                    className="workspace__secondary-action"
                    type="button"
                    onClick={() => handleCredentialClear().catch(() => undefined)}
                    disabled={credentialBusy || (credentialStatus !== 'configured' && !baseUrlDraft)}
                  >
                    Clear settings
                  </button>
                </div>
                {credentialMessage ? <p className="right-panel__helper">{credentialMessage}</p> : null}
              </form>
            </div>

            <div className="right-panel__section">
              <div className="right-panel__settings-header">
                <div>
                  <h2 className="right-panel__heading">Presets</h2>
                  <p className="right-panel__section-copy">Save compact defaults for the next workspace session.</p>
                </div>
                <button className="right-panel__inline-action" onClick={() => savePreset(`Preset ${presets.length + 1}`)}>
                  Save current
                </button>
              </div>
              <div className="right-panel__settings-list">
                {presets.length === 0 ? <p className="right-panel__helper">No presets saved yet.</p> : null}
                {presets.map((preset) => {
                  const isActive = activePresetId === preset.id

                  return (
                    <button
                      key={preset.id}
                      className={`right-panel__settings-item ${isActive ? 'right-panel__settings-item--active' : ''}`}
                      onClick={() => applyPreset(preset.id)}
                    >
                      <div className="right-panel__settings-item-head">
                        <div>
                          <strong>{preset.name}</strong>
                          <span>{formatPresetMode(preset.mode)} · {preset.modelId}</span>
                        </div>
                        <small>{isActive ? 'Active' : 'Apply'}</small>
                      </div>
                      <div className="right-panel__settings-item-meta">
                        <span>{formatPresetReviewPreference(preset.openReviewByDefault)}</span>
                        {isActive ? <span className="right-panel__status-inline"><Check size={12} /> Future default</span> : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="right-panel__section">
              <div className="right-panel__settings-header">
                <div>
                  <h2 className="right-panel__heading">Workflow capabilities</h2>
                  <p className="right-panel__section-copy">Keep the shell behavior concise and explicit.</p>
                </div>
              </div>
              <div className="right-panel__settings-list">
                {skillToggles.map((skill) => (
                  <button key={skill.id} className="right-panel__settings-item" onClick={() => toggleSkill(skill.id)}>
                    <div className="right-panel__settings-item-head">
                      <div>
                        <strong>{skill.label}</strong>
                        <span>{skill.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <small>{skill.enabled ? 'On' : 'Off'}</small>
                    </div>
                    <div className="right-panel__settings-item-meta">
                      <span>{skill.description}</span>
                    </div>
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
