export type AppMode = 'project' | 'conversation'

export type ShellView = 'project-home' | 'project-sessions' | 'conversation-home'

export type ProjectWarningState = 'none' | 'non-standard'

export type ModelId = 'claude-opus' | 'claude-sonnet' | 'claude-haiku'

export type DesktopWorkflowStatus =
  | 'Ready'
  | 'Connecting'
  | 'Connected'
  | 'Attached'
  | 'Working'
  | 'Awaiting approval'
  | 'Review ready'
  | 'Failed'
  | 'Needs attention'

export type DesktopStartupState =
  | 'recovery-available'
  | 'chooser-ready'
  | 'no-workspace'
  | 'recovery-failed'
  | 'active-session'

export type DesktopTrayMode = 'approval' | 'output' | 'review' | 'collapsed'

export type DesktopSessionAttention = 'approval' | 'review' | 'failure' | 'recovery' | null

export type DesktopSessionAction = 'resume' | 'attach' | 'start-new'

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

export type ExecutionReviewState = 'pending' | 'ready' | 'empty' | 'unavailable'

export type ExecutionStatus = 'idle' | 'awaiting-approval' | 'running' | 'completed' | 'rejected' | 'failed'

export interface ExecutionRecord {
  id: string
  proposalId: string
  summary: string
  command: string
  projectPath: string
  workingDirectory: string
  status: ExecutionStatus
  reviewState: ExecutionReviewState
  reviewUnavailableMessage: string | null
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
  description: string
  enabled: boolean
}

export interface ComposerInputSegment {
  type: 'text' | 'command'
  text: string
  commandName?: string
}

export interface SessionAttachment {
  id: string
  kind: 'file' | 'image'
  name: string
  path: string
  mimeType?: string
  sizeBytes?: number
  source: 'picker' | 'project' | 'paste' | 'drop'
  status: 'ready' | 'missing' | 'error'
}

export type AssistantStreamEventKind =
  | 'stage-status'
  | 'assistant-start'
  | 'assistant-delta'
  | 'tool-summary'
  | 'command-proposal'
  | 'complete'
  | 'error'

export interface AssistantStreamEvent {
  turnId: string
  kind: AssistantStreamEventKind
  stageLabel?: string
  body?: string
  delta?: string
  toolLabel?: string
  toolSummary?: string
  commandProposal?: CommandProposal | null
  error?: string
}

export interface AssistantStreamStartResponse {
  turnId: string
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
  inputSegments?: ComposerInputSegment[]
  attachments?: SessionAttachment[]
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

export interface RecoverySpotlight {
  sessionId: string
  title: string
  projectName: string
  projectPath: string
  effectiveModelId: ModelId
  lastActivityAt: string
  restoredAt?: string
  recentActivity: SessionRecentActivity | null
  workflowStatus: DesktopWorkflowStatus
  primaryAction: 'resume'
  secondaryAction: 'open-chooser'
}

export interface WorkspaceSummaryViewModel {
  projectName: string
  projectPath: string | null
  warning: ProjectWarningState
  sessionCount: number
  workflowStatus: DesktopWorkflowStatus
  summary: string
}

export interface DesktopSessionHeader {
  sessionId: string
  title: string
  projectName: string
  projectPath: string
  modelId: ModelId
  workflowStatus: DesktopWorkflowStatus
  lastActivityAt: string
  currentActivitySummary: string | null
  attention: DesktopSessionAttention
}

export interface DesktopChooserRow {
  sessionId: string
  title: string
  projectName: string
  projectPath: string
  modelId: ModelId
  lastActivityAt: string
  workflowStatus: DesktopWorkflowStatus
  attention: DesktopSessionAttention
  summary: string
  primaryAction: DesktopSessionAction
  isActive: boolean
  isSpotlight: boolean
  isRecoveryTarget: boolean
}

export interface DesktopChooserViewModel {
  ready: boolean
  workspaceSummary: WorkspaceSummaryViewModel | null
  spotlight: DesktopChooserRow | null
  rows: DesktopChooserRow[]
  hasWorkspace: boolean
  hasSessions: boolean
  conversationEntryAvailable: boolean
}

export interface DesktopRecoveryViewModel {
  state: DesktopStartupState
  spotlight: RecoverySpotlight | null
  message: string | null
}

export interface DesktopWorkflowViewModel {
  startupState: DesktopStartupState
  desktopStatus: DesktopWorkflowStatus
  trayMode: DesktopTrayMode
  recovery: DesktopRecoveryViewModel
  chooser: DesktopChooserViewModel
  activeWorkspace: WorkspaceSummaryViewModel | null
  activeSessionHeader: DesktopSessionHeader | null
  activeSessionAttention: DesktopSessionAttention
}
