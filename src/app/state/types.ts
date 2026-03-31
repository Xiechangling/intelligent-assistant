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

export type SessionStatus = 'active' | 'idle' | 'needs-attention' | 'complete'

export type SessionMessageRole = 'user' | 'assistant'

export type SessionTranscriptEventKind =
  | 'user-message'
  | 'assistant-message'
  | 'stage-status'
  | 'tool-summary'
  | 'approval-request'
  | 'approval-resolution'
  | 'execution-update'
  | 'review-available'

export interface CommandProposal {
  id: string
  summary: string
  command: string
  projectPath: string
  workingDirectory: string
  requiresApproval: boolean
}

export type ApprovalDecision = 'approved' | 'rejected'

export interface ExecutionOutputEntry {
  id: string
  stream: 'stdout' | 'stderr' | 'system'
  text: string
  createdAt: string
}

export interface ChangedFileReview {
  id: string
  path: string
  summary: string
  diff: string
}

export type ExecutionStatus = 'idle' | 'awaiting-approval' | 'running' | 'completed' | 'rejected' | 'failed'

export interface ExecutionRecord {
  id: string
  proposalId: string
  summary: string
  command: string
  projectPath: string
  workingDirectory: string
  status: ExecutionStatus
  output: ExecutionOutputEntry[]
  changedFiles: ChangedFileReview[]
  startedAt: string | null
  completedAt: string | null
}

export interface ReviewPreset {
  id: string
  name: string
  mode: AppMode
  modelId: ModelId
  openReviewByDefault: boolean
}

export interface SkillToggle {
  id: string
  label: string
  enabled: boolean
}

export interface SessionTranscriptEvent {
  id: string
  kind: SessionTranscriptEventKind
  body: string
  createdAt: string
  displayRole?: SessionMessageRole
  stageLabel?: string
  toolLabel?: string
  toolSummary?: string
  proposal?: CommandProposal
  approvalDecision?: ApprovalDecision
  executionStatus?: ExecutionStatus
}

export interface SessionRecentActivity {
  label: string
  summary: string
  at: string
}

export interface SessionRecord {
  id: string
  projectPath: string
  projectName: string
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  effectiveModelId: ModelId
  title: string
  status: SessionStatus
  recentActivity: SessionRecentActivity | null
}

export interface SessionDetail extends SessionRecord {
  transcript: SessionTranscriptEvent[]
}

export interface SessionHistoryFilter {
  projectPath?: string | null
}

export interface SessionActivityUpdate {
  status?: SessionStatus
  effectiveModelId?: ModelId
  title?: string
  recentActivity?: SessionRecentActivity | null
  transcript?: SessionTranscriptEvent[]
}

export interface SessionRecoverySnapshot {
  sessionId: string
  projectPath: string
  projectName: string
  effectiveModelId: ModelId
  restoredAt: string
  lastActivityAt: string
  recentActivity: SessionRecentActivity | null
}
