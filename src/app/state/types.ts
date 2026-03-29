export type AppMode = 'project' | 'conversation'

export type ShellView = 'project-home' | 'project-sessions' | 'conversation-home'

export type ProjectWarningState = 'none' | 'non-standard'

export type ModelId = 'claude-opus' | 'claude-sonnet' | 'claude-haiku'

export interface ProjectRecord {
  name: string
  path: string | null
  warning: ProjectWarningState
}

export interface ModelSelectionState {
  globalDefaultModel: ModelId
  activeSessionModelOverride: ModelId | null
}

export type CredentialStatusSummary = 'missing' | 'configured' | 'error'

export type RightPanelView = 'context' | 'settings'
