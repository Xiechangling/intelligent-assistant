import { create } from 'zustand'
import { openFileAttachments, openImageAttachments } from '../services/attachmentService'
import { runApprovedCommand, streamAssistantResponse } from '../services/assistantService'
import {
  createSession,
  listSessions,
  loadRecoverySnapshot,
  loadSession,
  saveRecoverySnapshot,
  updateSessionActivity,
} from '../services/sessionService'
import type {
  AppMode,
  ApprovalDecision,
  ChangedFileReview,
  CommandProposal,
  CredentialStatusSummary,
  DesktopChooserRow,
  DesktopChooserViewModel,
  DesktopRecoveryViewModel,
  DesktopSessionAttention,
  DesktopSessionHeader,
  DesktopStartupState,
  DesktopTrayMode,
  DesktopWorkflowStatus,
  DesktopWorkflowViewModel,
  ExecutionOutputEntry,
  ExecutionRecord,
  ExecutionReviewState,
  ExecutionStatus,
  ModelId,
  ProjectRecord,
  ReviewPreset,
  RightPanelView,
  SessionAttachment,
  SessionDetail,
  SessionHistoryFilter,
  SessionRecord,
  SessionRecoverySnapshot,
  SessionTranscriptEvent,
  ShellView,
  SkillToggle,
  WorkspaceSummaryViewModel,
} from './types'

type SessionHistoryStatus = 'idle' | 'loading' | 'ready' | 'error'
type RecoveryStatus = 'idle' | 'recovering' | 'restored' | 'error'
type ResumeStatus = 'idle' | 'loading'
type AssistantStatus = 'idle' | 'streaming' | 'error'
type BottomPanelTab = 'output' | 'review'
type ThemeMode = 'light' | 'dark' | 'auto'
type Mode = 'chat' | 'search' | 'navigate'

interface Attachment {
  id: string
  path: string
  name: string
  type: 'file' | 'image'
}

interface AppShellState {
  mode: AppMode
  theme: ThemeMode
  currentMode: Mode
  voiceInputActive: boolean
  attachments: Attachment[]
  activeProjectPath: string | null
  recentProjects: ProjectRecord[]
  activeShellView: ShellView
  globalDefaultModel: ModelId
  activeSessionModelOverride: ModelId | null
  activeSession: SessionDetail | null
  sessionHistory: SessionRecord[]
  sessionHistoryFilter: SessionHistoryFilter
  sessionHistoryStatus: SessionHistoryStatus
  sessionHistoryError: string | null
  recoveryStatus: RecoveryStatus
  recoveryMessage: string | null
  lastRecoverySnapshot: SessionRecoverySnapshot | null
  resumeStatus: ResumeStatus
  rightPanelView: RightPanelView
  rightPanelOpen: boolean
  rightPanelWidth: number
  sidebarSessionsExpanded: boolean
  sidebarProjectsExpanded: boolean
  bottomPanelExpanded: boolean
  bottomPanelTab: BottomPanelTab
  credentialStatus: CredentialStatusSummary
  projectWarning: string | null
  draftPrompt: string
  pendingAttachments: SessionAttachment[]
  assistantStatus: AssistantStatus
  assistantError: string | null
  currentStageLabel: string | null
  pendingProposal: CommandProposal | null
  executionRecord: ExecutionRecord | null
  selectedExecutionId: string | null
  selectedReviewFileId: string | null
  presets: ReviewPreset[]
  activePresetId: string | null
  skillToggles: SkillToggle[]
  keybindingsEnabled: boolean
  macOSOptionMappingEnabled: boolean
  setTheme: (theme: ThemeMode) => void
  setMode: (mode: AppMode) => void
  setCurrentMode: (mode: Mode) => void
  toggleVoiceInput: () => void
  addAttachment: (file: Attachment) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void
  setActiveProject: (project: ProjectRecord | null) => void
  setRecentProjects: (projects: ProjectRecord[]) => void
  setShellView: (view: ShellView) => void
  setGlobalDefaultModel: (model: ModelId) => void
  setActiveSessionModelOverride: (model: ModelId | null) => void
  setRightPanelView: (view: RightPanelView) => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelWidth: (width: number) => void
  setSidebarSessionsExpanded: (expanded: boolean) => void
  setSidebarProjectsExpanded: (expanded: boolean) => void
  setBottomPanelExpanded: (expanded: boolean) => void
  setBottomPanelTab: (tab: BottomPanelTab) => void
  setCredentialStatus: (status: CredentialStatusSummary) => void
  setDraftPrompt: (prompt: string) => void
  addFileAttachments: () => Promise<void>
  addImageAttachments: () => Promise<void>
  removePendingAttachment: (attachmentId: string) => void
  selectReviewFile: (fileId: string) => void
  savePreset: (name: string) => void
  applyPreset: (presetId: string) => void
  toggleSkill: (skillId: string) => void
  setKeybindingsEnabled: (enabled: boolean) => void
  setMacOSOptionMappingEnabled: (enabled: boolean) => void
  loadSessionHistory: (filter?: SessionHistoryFilter) => Promise<void>
  applySessionHistoryFilter: (projectPath: string | null) => Promise<void>
  createProjectSession: () => Promise<void>
  createConversationSession: () => Promise<void>
  resumeSession: (sessionId: string) => Promise<void>
  attemptRecovery: () => Promise<void>
  clearRecoveryMessage: () => void
  submitPrompt: () => Promise<void>
  approvePendingCommand: () => Promise<void>
  rejectPendingCommand: () => Promise<void>
  getDesktopWorkflow: () => DesktopWorkflowViewModel
  getDesktopStatus: () => DesktopWorkflowStatus
  getDesktopTrayMode: () => DesktopTrayMode
  getChooserView: () => DesktopChooserViewModel
  getActiveSessionHeader: () => DesktopSessionHeader | null
}

const defaultProject: ProjectRecord = {
  name: 'No project selected',
  path: null,
  warning: 'none',
}

const defaultSkillToggles: SkillToggle[] = [
  {
    id: 'command-approval',
    label: 'Command approval',
    description: 'Ask before impactful commands run.',
    enabled: true,
  },
  {
    id: 'change-review',
    label: 'Change review',
    description: 'Keep changed files ready in the review tray.',
    enabled: true,
  },
  {
    id: 'workspace-context',
    label: 'Workspace context',
    description: 'Keep project context available during work.',
    enabled: true,
  },
]

function deriveProjectName(projectPath: string | null, recentProjects: ProjectRecord[]) {
  return recentProjects.find((project) => project.path === projectPath)?.name ?? 'Selected Project'
}

function now() {
  return Date.now().toString()
}

function createEvent(event: Omit<SessionTranscriptEvent, 'id' | 'createdAt'>): SessionTranscriptEvent {
  return {
    id: `event-${crypto.randomUUID()}`,
    createdAt: now(),
    ...event,
  }
}

function createAssistantActivity(summary: string) {
  return {
    label: 'Working',
    summary,
    at: now(),
  }
}

function createExecutionOutput(stream: ExecutionOutputEntry['stream'], text: string): ExecutionOutputEntry {
  return {
    id: `output-${crypto.randomUUID()}`,
    stream,
    text,
    createdAt: now(),
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

function buildExecutionRecord(proposal: CommandProposal): ExecutionRecord {
  return {
    id: `execution-${crypto.randomUUID()}`,
    proposalId: proposal.id,
    summary: proposal.summary,
    command: proposal.command,
    projectPath: proposal.projectPath,
    workingDirectory: proposal.workingDirectory,
    status: 'awaiting-approval',
    reviewState: 'pending',
    reviewUnavailableMessage: null,
    output: [],
    changedFiles: [],
    startedAt: null,
    completedAt: null,
  }
}

function deriveReviewUnavailableMessage(output: ExecutionOutputEntry[]) {
  return output.find((entry) => entry.stream === 'system' && /review unavailable/i.test(entry.text))?.text ?? null
}

function deriveExecutionReviewState(execution: Pick<ExecutionRecord, 'status' | 'changedFiles' | 'reviewUnavailableMessage'>): ExecutionReviewState {
  if (execution.status !== 'completed') {
    return 'pending'
  }

  if (execution.changedFiles.length > 0) {
    return 'ready'
  }

  if (execution.reviewUnavailableMessage) {
    return 'unavailable'
  }

  return 'empty'
}

function syncReviewSelection(previousExecution: ExecutionRecord | null, nextExecution: ExecutionRecord, selectedReviewFileId: string | null) {
  if (nextExecution.reviewState !== 'ready') {
    return null
  }

  const didExecutionChange = previousExecution?.id !== nextExecution.id
  if (didExecutionChange) {
    return nextExecution.changedFiles[0]?.id ?? null
  }

  const stillExists = nextExecution.changedFiles.some((file) => file.id === selectedReviewFileId)
  if (stillExists) {
    return selectedReviewFileId
  }

  return nextExecution.changedFiles[0]?.id ?? null
}

async function persistRecoverySnapshot(session: SessionDetail) {
  const snapshot: SessionRecoverySnapshot = {
    sessionId: session.id,
    projectPath: session.projectPath,
    projectName: session.projectName,
    effectiveModelId: session.effectiveModelId,
    restoredAt: now(),
    lastActivityAt: session.lastActivityAt,
    recentActivity: session.recentActivity,
  }
  await saveRecoverySnapshot(snapshot)
  return snapshot
}

async function rehydrateSession(sessionId: string) {
  const session = await loadSession(sessionId)
  const snapshot = await persistRecoverySnapshot(session)
  return { session, snapshot }
}

async function persistSession(session: SessionDetail) {
  return updateSessionActivity(session.id, {
    status: session.status,
    effectiveModelId: session.effectiveModelId,
    title: session.title,
    recentActivity: session.recentActivity,
    transcript: session.transcript,
  })
}

function createStreamingSessionPersister(sessionId: string) {
  let lastPersistAt = 0

  return async (session: SessionDetail, force = false) => {
    const nowMs = Date.now()
    if (!force && nowMs - lastPersistAt < 350) {
      return session
    }
    lastPersistAt = nowMs
    return updateSessionActivity(sessionId, {
      status: session.status,
      effectiveModelId: session.effectiveModelId,
      title: session.title,
      recentActivity: session.recentActivity,
      transcript: session.transcript,
    })
  }
}

function ensureConversationSession(state: AppShellState) {
  if (state.activeSession) {
    return state.activeSession
  }

  return null
}

function appendApprovalResolution(
  transcript: SessionTranscriptEvent[],
  decision: ApprovalDecision,
  proposal: CommandProposal,
) {
  return [
    ...transcript,
    createEvent({
      kind: 'approval-resolution',
      body: decision === 'approved' ? 'Command approved for execution.' : 'Command rejected before execution.',
      approvalDecision: decision,
      proposal,
    }),
  ]
}

function appendExecutionUpdate(
  transcript: SessionTranscriptEvent[],
  body: string,
  status: ExecutionStatus,
  proposal?: CommandProposal,
) {
  return [
    ...transcript,
    createEvent({
      kind: 'execution-update',
      body,
      executionStatus: status,
      proposal,
    }),
  ]
}

function appendReviewAvailable(transcript: SessionTranscriptEvent[], count: number) {
  return [
    ...transcript,
    createEvent({
      kind: 'review-available',
      body: `Review ready: ${count} changed file${count === 1 ? '' : 's'} available.`,
    }),
  ]
}

function buildExecutionOutcomeSummary(output: ExecutionOutputEntry[], fallback: string) {
  const preferredLine = [...output]
    .reverse()
    .find((entry) => entry.text.trim() && (entry.stream === 'stderr' || entry.stream === 'system'))

  return preferredLine?.text.trim() || fallback
}

function deriveSessionAttention(
  session: Pick<SessionRecord, 'status' | 'recentActivity'>,
  hasReviewReady = false,
): DesktopSessionAttention {
  const summary = session.recentActivity?.summary?.toLowerCase() ?? ''
  const label = session.recentActivity?.label?.toLowerCase() ?? ''

  if (hasReviewReady || summary.includes('review ready') || summary.includes('review artifacts')) {
    return 'review'
  }

  if (summary.includes('approval') || label.includes('approval')) {
    return 'approval'
  }

  if (session.status === 'needs-attention' || label.includes('failed') || summary.includes('failed')) {
    return 'failure'
  }

  return null
}

function deriveSessionWorkflowStatus(
  session: Pick<SessionRecord, 'status' | 'recentActivity'>,
  options?: {
    isActive?: boolean
    attention?: DesktopSessionAttention
    isWorking?: boolean
    isConnected?: boolean
  },
): DesktopWorkflowStatus {
  if (options?.isWorking) {
    return 'Working'
  }

  if (options?.attention === 'approval') {
    return 'Awaiting approval'
  }

  if (options?.attention === 'review') {
    return 'Review ready'
  }

  if (options?.attention === 'failure') {
    return session.status === 'needs-attention' ? 'Needs attention' : 'Failed'
  }

  if (session.status === 'needs-attention') {
    return 'Needs attention'
  }

  if (options?.isActive) {
    return 'Attached'
  }

  if (session.status === 'complete') {
    return 'Connected'
  }

  if (options?.isConnected) {
    return 'Connected'
  }

  return 'Ready'
}

function buildWorkspaceSummary(state: AppShellState): WorkspaceSummaryViewModel | null {
  const project = state.recentProjects.find((entry) => entry.path === state.activeProjectPath)
  if (!project?.path) {
    return null
  }

  const sessionCount = state.sessionHistory.filter((entry) => entry.projectPath === project.path).length
  let summary =
    sessionCount === 0 ? 'No sessions yet for this workspace.' : `${sessionCount} recent session${sessionCount === 1 ? '' : 's'} available.`

  if (state.projectWarning) {
    summary = state.projectWarning
  }

  return {
    projectName: project.name,
    projectPath: project.path,
    warning: project.warning,
    sessionCount,
    workflowStatus: state.activeSession ? 'Attached' : 'Connected',
    summary,
  }
}

function buildChooserRows(state: AppShellState): DesktopChooserRow[] {
  const recoverySessionId = state.lastRecoverySnapshot?.sessionId ?? null

  return state.sessionHistory
    .filter((session) => state.mode === 'conversation' || !state.activeProjectPath || session.projectPath === state.activeProjectPath)
    .map((session) => {
      const isConversation = session.projectPath === '__conversation__'
      const isActive = state.activeSession?.id === session.id
      const isRecoveryTarget = recoverySessionId === session.id
      const attention = deriveSessionAttention(session, state.executionRecord?.reviewState === 'ready' ? isActive : false)

      return {
        sessionId: session.id,
        title: session.title,
        projectName: session.projectName,
        projectPath: session.projectPath,
        modelId: session.effectiveModelId,
        lastActivityAt: session.lastActivityAt,
        workflowStatus: deriveSessionWorkflowStatus(session, {
          isActive,
          attention,
          isWorking: isActive && (state.assistantStatus === 'streaming' || state.executionRecord?.status === 'running'),
          isConnected: !isActive,
        }),
        attention,
        summary: session.recentActivity?.summary ?? 'Ready to continue work',
        primaryAction: isRecoveryTarget ? 'attach' : isConversation ? 'resume' : 'resume',
        isActive,
        isSpotlight: isRecoveryTarget || isActive,
        isRecoveryTarget,
      }
    })
}

function deriveStartupState(state: AppShellState): DesktopStartupState {
  if (state.activeSession) {
    return 'active-session'
  }

  if (state.recoveryStatus === 'error') {
    return 'recovery-failed'
  }

  if (state.lastRecoverySnapshot) {
    return 'recovery-available'
  }

  if (!state.activeProjectPath && state.mode === 'project') {
    return 'no-workspace'
  }

  return 'chooser-ready'
}

function deriveTrayMode(state: AppShellState): DesktopTrayMode {
  if (state.pendingProposal) {
    return 'approval'
  }

  if (state.executionRecord?.reviewState === 'ready') {
    return 'review'
  }

  if (state.executionRecord || state.assistantStatus === 'streaming' || state.assistantError) {
    return 'output'
  }

  return 'collapsed'
}

function deriveDesktopStatus(state: AppShellState): DesktopWorkflowStatus {
  if (state.recoveryStatus === 'recovering' || state.resumeStatus === 'loading' || state.sessionHistoryStatus === 'loading') {
    return 'Connecting'
  }

  if (state.pendingProposal) {
    return 'Awaiting approval'
  }

  if (state.assistantError || state.executionRecord?.status === 'failed') {
    return state.activeSession?.status === 'needs-attention' ? 'Needs attention' : 'Failed'
  }

  if (state.executionRecord?.reviewState === 'ready') {
    return 'Review ready'
  }

  if (state.assistantStatus === 'streaming' || state.executionRecord?.status === 'running') {
    return 'Working'
  }

  if (state.activeSession) {
    return 'Attached'
  }

  if (state.credentialStatus === 'configured' || Boolean(state.activeProjectPath)) {
    return 'Connected'
  }

  return 'Ready'
}

function buildRecoveryView(state: AppShellState): DesktopRecoveryViewModel {
  const startupState = deriveStartupState(state)
  const snapshot = state.lastRecoverySnapshot

  return {
    state: startupState,
    spotlight: snapshot
      ? {
          sessionId: snapshot.sessionId,
          title: snapshot.recentActivity?.summary || `Resume ${snapshot.projectName}`,
          projectName: snapshot.projectName,
          projectPath: snapshot.projectPath,
          effectiveModelId: snapshot.effectiveModelId,
          lastActivityAt: snapshot.lastActivityAt,
          restoredAt: snapshot.restoredAt,
          recentActivity: snapshot.recentActivity,
          workflowStatus: state.recoveryStatus === 'error' ? 'Needs attention' : 'Attached',
          primaryAction: 'resume',
          secondaryAction: 'open-chooser',
        }
      : null,
    message: state.recoveryMessage,
  }
}

function buildActiveSessionHeader(state: AppShellState): DesktopSessionHeader | null {
  const session = state.activeSession
  if (!session) {
    return null
  }

  const attention = deriveSessionAttention(session, state.executionRecord?.reviewState === 'ready')

  return {
    sessionId: session.id,
    title: session.title,
    projectName: session.projectName,
    projectPath: session.projectPath,
    modelId: session.effectiveModelId,
    workflowStatus: deriveDesktopStatus(state),
    lastActivityAt: session.lastActivityAt,
    currentActivitySummary: state.currentStageLabel ?? session.recentActivity?.summary ?? null,
    attention,
  }
}

function buildChooserView(state: AppShellState): DesktopChooserViewModel {
  const workspaceSummary = buildWorkspaceSummary(state)
  const rows = buildChooserRows(state)
  const spotlight = rows.find((row) => row.isSpotlight) ?? null

  return {
    ready: state.sessionHistoryStatus === 'ready' || state.sessionHistoryStatus === 'idle',
    workspaceSummary,
    spotlight,
    rows,
    hasWorkspace: Boolean(state.activeProjectPath),
    hasSessions: rows.length > 0,
    conversationEntryAvailable: true,
  }
}

function buildDesktopWorkflow(state: AppShellState): DesktopWorkflowViewModel {
  const startupState = deriveStartupState(state)
  const activeWorkspace = buildWorkspaceSummary(state)
  const chooser = buildChooserView(state)
  const activeSessionHeader = buildActiveSessionHeader(state)
  const activeSessionAttention = activeSessionHeader?.attention ?? null

  return {
    startupState,
    desktopStatus: deriveDesktopStatus(state),
    trayMode: deriveTrayMode(state),
    recovery: buildRecoveryView(state),
    chooser,
    activeWorkspace,
    activeSessionHeader,
    activeSessionAttention,
  }
}

function parseInputSegments(prompt: string) {
  return prompt
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith('/')) {
        const [commandName] = line.slice(1).split(/\s+/)
        return {
          type: 'command' as const,
          text: line,
          commandName: commandName || undefined,
        }
      }

      return {
        type: 'text' as const,
        text: line,
      }
    })
}

export const useAppShellStore = create<AppShellState>((set, get) => ({
  mode: 'conversation',
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as ThemeMode) || 'dark',
  currentMode: 'chat',
  voiceInputActive: false,
  attachments: [],
  activeProjectPath: null,
  recentProjects: [defaultProject],
  activeShellView: 'conversation-home',
  globalDefaultModel: 'claude-sonnet',
  activeSessionModelOverride: null,
  activeSession: null,
  sessionHistory: [],
  sessionHistoryFilter: {},
  sessionHistoryStatus: 'idle',
  sessionHistoryError: null,
  recoveryStatus: 'idle',
  recoveryMessage: null,
  lastRecoverySnapshot: null,
  resumeStatus: 'idle',
  rightPanelView: 'context',
  rightPanelOpen: false,
  rightPanelWidth: (typeof window !== 'undefined' && localStorage.getItem('rightPanelWidth'))
    ? Math.max(300, Math.min(600, Number(localStorage.getItem('rightPanelWidth'))))
    : 400,
  sidebarSessionsExpanded: true,
  sidebarProjectsExpanded: true,
  bottomPanelExpanded: false,
  bottomPanelTab: 'output',
  credentialStatus: 'missing',
  projectWarning: null,
  draftPrompt: '',
  pendingAttachments: [],
  assistantStatus: 'idle',
  assistantError: null,
  currentStageLabel: null,
  pendingProposal: null,
  executionRecord: null,
  selectedExecutionId: null,
  selectedReviewFileId: null,
  presets: [],
  activePresetId: null,
  skillToggles: defaultSkillToggles,
  keybindingsEnabled: true,
  macOSOptionMappingEnabled: true,
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },
  setMode: (mode) =>
    set((state) => {
      if (state.pendingProposal && mode !== state.mode) {
        return state
      }

      const shouldKeepActiveSession =
        mode === 'conversation'
          ? state.activeSession?.projectPath === '__conversation__'
          : state.activeSession?.projectPath === state.activeProjectPath

      return {
        mode,
        activeShellView: mode === 'project' ? 'project-home' : 'conversation-home',
        activeSession: shouldKeepActiveSession ? state.activeSession : null,
        assistantStatus: 'idle',
        assistantError: null,
        currentStageLabel: null,
        pendingProposal: state.pendingProposal,
        rightPanelOpen: mode === 'conversation' ? false : state.rightPanelOpen,
      }
    }),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  toggleVoiceInput: () => set((state) => ({ voiceInputActive: !state.voiceInputActive })),
  addAttachment: (file) => set((state) => ({ attachments: [...state.attachments, file] })),
  removeAttachment: (id) => set((state) => ({ attachments: state.attachments.filter((a) => a.id !== id) })),
  clearAttachments: () => set({ attachments: [] }),
  setActiveProject: (project) =>
    set((state) => {
      if (!project) {
        return {
          activeProjectPath: null,
          activeShellView: 'project-home',
          activeSession: null,
          activeSessionModelOverride: null,
          projectWarning: null,
          sessionHistoryFilter: {},
          pendingProposal: null,
          executionRecord: null,
          selectedReviewFileId: null,
        }
      }

      const filteredProjects = state.recentProjects.filter((entry) => entry.path !== project.path)

      return {
        activeProjectPath: project.path,
        activeShellView: 'project-sessions',
        activeSession:
          state.activeSession && state.activeSession.projectPath === project.path ? state.activeSession : null,
        recentProjects: [project, ...filteredProjects],
        projectWarning:
          project.warning === 'non-standard'
            ? 'This folder does not look like a standard project, but you can continue.'
            : null,
        pendingProposal: null,
        executionRecord: null,
        selectedReviewFileId: null,
      }
    }),
  setRecentProjects: (recentProjects) => set({ recentProjects }),
  setShellView: (activeShellView) => set({ activeShellView }),
  setGlobalDefaultModel: (globalDefaultModel) => set({ globalDefaultModel }),
  setActiveSessionModelOverride: (activeSessionModelOverride) => set({ activeSessionModelOverride }),
  setRightPanelView: (rightPanelView) => set({ rightPanelView, rightPanelOpen: true }),
  setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
  setRightPanelWidth: (width) => {
    const clampedWidth = Math.max(300, Math.min(600, width));
    set({ rightPanelWidth: clampedWidth });
    if (typeof window !== 'undefined') {
      localStorage.setItem('rightPanelWidth', String(clampedWidth));
    }
  },
  setSidebarSessionsExpanded: (sidebarSessionsExpanded) => set({ sidebarSessionsExpanded }),
  setSidebarProjectsExpanded: (sidebarProjectsExpanded) => set({ sidebarProjectsExpanded }),
  setBottomPanelExpanded: (bottomPanelExpanded) => set({ bottomPanelExpanded }),
  setBottomPanelTab: (bottomPanelTab) => set({ bottomPanelTab }),
  setCredentialStatus: (credentialStatus) => set({ credentialStatus }),
  setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
  addFileAttachments: async () => {
    const attachments = await openFileAttachments()
    if (attachments.length === 0) {
      return
    }
    set((state) => ({ pendingAttachments: [...state.pendingAttachments, ...attachments] }))
  },
  addImageAttachments: async () => {
    const attachments = await openImageAttachments()
    if (attachments.length === 0) {
      return
    }
    set((state) => ({ pendingAttachments: [...state.pendingAttachments, ...attachments] }))
  },
  removePendingAttachment: (attachmentId) =>
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((attachment) => attachment.id !== attachmentId),
    })),
  selectReviewFile: (selectedReviewFileId) => set({ selectedReviewFileId, bottomPanelExpanded: true, bottomPanelTab: 'review' }),
  savePreset: (name) =>
    set((state) => {
      const normalizedName = name.trim() || `Preset ${state.presets.length + 1}`
      const preset: ReviewPreset = {
        id: `preset-${crypto.randomUUID()}`,
        name: normalizedName,
        mode: state.mode,
        modelId: state.globalDefaultModel,
        openReviewByDefault: state.bottomPanelTab === 'review',
      }
      return {
        presets: [...state.presets, preset],
        activePresetId: preset.id,
      }
    }),
  applyPreset: (presetId) =>
    set((state) => {
      const preset = state.presets.find((entry) => entry.id === presetId)
      if (!preset) {
        return {}
      }
      return {
        activePresetId: preset.id,
        mode: preset.mode,
        globalDefaultModel: preset.modelId,
        bottomPanelTab: preset.openReviewByDefault ? 'review' : 'output',
      }
    }),
  toggleSkill: (skillId) =>
    set((state) => ({
      skillToggles: state.skillToggles.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              enabled: !skill.enabled,
            }
          : skill,
      ),
    })),
  setKeybindingsEnabled: (enabled) => set({ keybindingsEnabled: enabled }),
  setMacOSOptionMappingEnabled: (enabled) => set({ macOSOptionMappingEnabled: enabled }),
  loadSessionHistory: async (filter) => {
    const nextFilter = filter ?? get().sessionHistoryFilter
    set({ sessionHistoryStatus: 'loading', sessionHistoryError: null, sessionHistoryFilter: nextFilter })

    try {
      const sessionHistory = await listSessions(nextFilter)
      set({ sessionHistory, sessionHistoryStatus: 'ready' })
    } catch (error) {
      set({
        sessionHistoryStatus: 'error',
        sessionHistoryError: getErrorMessage(error, 'We couldn’t load session history.'),
      })
    }
  },
  applySessionHistoryFilter: async (projectPath) => {
    await get().loadSessionHistory(projectPath ? { projectPath } : {})
  },
  createProjectSession: async () => {
    const { activeProjectPath, globalDefaultModel, recentProjects } = get()
    if (!activeProjectPath) {
      return
    }

    const projectName = deriveProjectName(activeProjectPath, recentProjects)
    const session = await createSession({
      projectPath: activeProjectPath,
      projectName,
      effectiveModelId: globalDefaultModel,
      title: `Session for ${projectName}`,
      recentActivity: {
        label: 'Attached',
        summary: 'Ready to continue work.',
        at: now(),
      },
    })

    const snapshot = await persistRecoverySnapshot(session)

    set({
      activeSession: session,
      activeSessionModelOverride: session.effectiveModelId,
      activeShellView: 'project-sessions',
      recoveryStatus: 'idle',
      recoveryMessage: null,
      lastRecoverySnapshot: snapshot,
      mode: 'project',
      draftPrompt: '',
      assistantStatus: 'idle',
      assistantError: null,
      currentStageLabel: null,
      pendingProposal: null,
      executionRecord: null,
      selectedExecutionId: null,
      selectedReviewFileId: null,
    })

    await get().loadSessionHistory(get().sessionHistoryFilter)
  },
  createConversationSession: async () => {
    const { globalDefaultModel } = get()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const session = await createSession({
      projectPath: '__conversation__',
      projectName: 'Pure Conversation',
      effectiveModelId: globalDefaultModel,
      title: `Conversation ${timestamp}`,
      recentActivity: {
        label: 'Connected',
        summary: 'Ready for a direct conversation.',
        at: now(),
      },
    })

    const snapshot = await persistRecoverySnapshot(session)

    set({
      mode: 'conversation',
      activeSession: session,
      activeSessionModelOverride: session.effectiveModelId,
      activeShellView: 'conversation-home',
      recoveryStatus: 'idle',
      recoveryMessage: null,
      lastRecoverySnapshot: snapshot,
      draftPrompt: '',
      assistantStatus: 'idle',
      assistantError: null,
      currentStageLabel: null,
      pendingProposal: null,
      executionRecord: null,
      selectedExecutionId: null,
      selectedReviewFileId: null,
      rightPanelOpen: false,
    })

    await get().loadSessionHistory({})
  },
  resumeSession: async (sessionId) => {
    set({ resumeStatus: 'loading', recoveryMessage: 'Restoring session context.' })

    try {
      const { session, snapshot } = await rehydrateSession(sessionId)
      const isConversation = session.projectPath === '__conversation__'
      set({
        activeSession: session,
        activeProjectPath: isConversation ? get().activeProjectPath : session.projectPath,
        activeSessionModelOverride: session.effectiveModelId,
        activeShellView: isConversation ? 'conversation-home' : 'project-sessions',
        mode: isConversation ? 'conversation' : 'project',
        resumeStatus: 'idle',
        recoveryStatus: 'restored',
        recoveryMessage: `Session restored for ${session.projectName}.`,
        lastRecoverySnapshot: snapshot,
        assistantStatus: 'idle',
        assistantError: null,
        currentStageLabel: null,
        pendingProposal: null,
        executionRecord: null,
        selectedExecutionId: null,
        selectedReviewFileId: null,
        rightPanelOpen: false,
      })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch (error) {
      set({
        resumeStatus: 'idle',
        recoveryStatus: 'error',
        recoveryMessage: getErrorMessage(error, 'Unable to restore that session right now.'),
      })
    }
  },
  attemptRecovery: async () => {
    set({ recoveryStatus: 'recovering', recoveryMessage: null })

    try {
      const snapshot = await loadRecoverySnapshot()
      if (!snapshot) {
        set({ recoveryStatus: 'idle', lastRecoverySnapshot: null })
        await get().loadSessionHistory(get().sessionHistoryFilter)
        return
      }

      set({ recoveryStatus: 'idle', lastRecoverySnapshot: snapshot })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch (error) {
      set({
        recoveryStatus: 'error',
        recoveryMessage: getErrorMessage(error, 'Recovery failed. Open the session chooser or start a new session.'),
        lastRecoverySnapshot: null,
      })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    }
  },
  clearRecoveryMessage: () => set({ recoveryMessage: null, recoveryStatus: 'idle' }),
  submitPrompt: async () => {
    const state = get()
    const prompt = state.draftPrompt.trim()
    if (!prompt) {
      return
    }

    let session = ensureConversationSession(state)

    if (!session) {
      if (state.mode === 'conversation') {
        await get().createConversationSession()
      } else {
        await get().createProjectSession()
      }
      session = get().activeSession
    }

    if (!session) {
      return
    }

    const inputSegments = parseInputSegments(prompt)
    const attachments = state.pendingAttachments

    const userEvent = createEvent({
      kind: 'user-message',
      displayRole: 'user',
      body: prompt,
      inputSegments,
      attachments,
    })

    let transcript = [...session.transcript, userEvent]
    let assistantEventId: string | null = null
    let nextSession: SessionDetail = {
      ...session,
      status: 'active',
      transcript,
      recentActivity: createAssistantActivity(`Prompt submitted: ${prompt}`),
      lastActivityAt: now(),
    }
    const streamingSessionId = session.id
    const streamingTurnId = crypto.randomUUID()
    const persistStreamingSession = createStreamingSessionPersister(session.id)
    const isCurrentStreamingSession = () => get().activeSession?.id === streamingSessionId

    set({
      activeSession: nextSession,
      assistantStatus: 'streaming',
      assistantError: null,
      currentStageLabel: 'Working',
      draftPrompt: '',
      pendingAttachments: [],
      pendingProposal: null,
      executionRecord: null,
      selectedExecutionId: null,
      selectedReviewFileId: null,
      bottomPanelExpanded: false,
      bottomPanelTab: 'output',
    })

    nextSession = await persistSession(nextSession)
    set({ activeSession: nextSession })

    try {
      await streamAssistantResponse(
        {
          mode: state.mode,
          prompt,
          modelId: nextSession.effectiveModelId,
          projectName: nextSession.projectName,
          projectPath: state.activeProjectPath,
          inputSegments,
          attachments,
          turnId: streamingTurnId,
        },
        {
          onStage: async (stageLabel, body) => {
            if (!isCurrentStreamingSession()) {
              return
            }
            transcript = [
              ...transcript,
              createEvent({
                kind: 'stage-status',
                body,
                stageLabel,
              }),
            ]
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: createAssistantActivity(body),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession, currentStageLabel: stageLabel })
            nextSession = await persistStreamingSession(nextSession, true)
            set({ activeSession: nextSession })
          },
          onAssistantStart: async () => {
            if (!isCurrentStreamingSession()) {
              return
            }
            const existingAssistantEvent = transcript.find((event) => event.id === assistantEventId)
            if (existingAssistantEvent) {
              return
            }
            const assistantEvent = createEvent({
              kind: 'assistant-message',
              displayRole: 'assistant',
              body: '',
            })
            assistantEventId = assistantEvent.id
            transcript = [...transcript, assistantEvent]
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: createAssistantActivity('Assistant response in progress'),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession })
            nextSession = await persistStreamingSession(nextSession, true)
            set({ activeSession: nextSession })
          },
          onAssistantChunk: async (chunk) => {
            if (!isCurrentStreamingSession()) {
              return
            }
            if (!assistantEventId) {
              const assistantEvent = createEvent({
                kind: 'assistant-message',
                displayRole: 'assistant',
                body: '',
              })
              assistantEventId = assistantEvent.id
              transcript = [...transcript, assistantEvent]
            }
            transcript = transcript.map((event) =>
              event.id === assistantEventId
                ? {
                    ...event,
                    body: `${event.body}${chunk}`,
                  }
                : event,
            )
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: createAssistantActivity('Assistant response in progress'),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession })
            nextSession = await persistStreamingSession(nextSession)
            set({ activeSession: nextSession })
          },
          onCommandProposal: async (proposal) => {
            if (!isCurrentStreamingSession()) {
              return
            }
            transcript = [
              ...transcript,
              createEvent({
                kind: 'approval-request',
                body: `Approval required: ${proposal.summary}`,
                proposal,
              }),
            ]
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: {
                label: 'Awaiting approval',
                summary: `Waiting for approval: ${proposal.summary}`,
                at: now(),
              },
              lastActivityAt: now(),
            }
            set({
              activeSession: nextSession,
              pendingProposal: proposal,
              executionRecord: buildExecutionRecord(proposal),
              selectedExecutionId: proposal.id,
              currentStageLabel: 'Awaiting approval',
              bottomPanelExpanded: true,
              bottomPanelTab: 'output',
            })
            nextSession = await persistStreamingSession(nextSession, true)
            set({ activeSession: nextSession })
          },
          onToolSummary: async (toolLabel, toolSummary) => {
            if (!isCurrentStreamingSession()) {
              return
            }
            transcript = [
              ...transcript,
              createEvent({
                kind: 'tool-summary',
                body: toolSummary,
                toolLabel,
                toolSummary,
              }),
            ]
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: createAssistantActivity(toolSummary),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession })
            nextSession = await persistStreamingSession(nextSession, true)
            set({ activeSession: nextSession })
          },
          onComplete: async () => {
            if (!isCurrentStreamingSession()) {
              return
            }
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: {
                label: get().pendingProposal ? 'Awaiting approval' : state.mode === 'project' ? 'Attached' : 'Connected',
                summary: get().pendingProposal
                  ? 'Waiting for command approval before execution.'
                  : state.mode === 'project'
                    ? 'Ready to continue work.'
                    : 'Ready for the next message.',
                at: now(),
              },
              lastActivityAt: now(),
            }
            set({
              activeSession: nextSession,
              currentStageLabel: get().pendingProposal ? 'Awaiting approval' : null,
            })
            nextSession = await persistStreamingSession(nextSession, true)
            set({ activeSession: nextSession })
          },
        },
      )

      const persisted = await persistSession(nextSession)
      const snapshot = await persistRecoverySnapshot(persisted)
      if (isCurrentStreamingSession()) {
        set({
          activeSession: persisted,
          assistantStatus: 'idle',
          currentStageLabel: get().pendingProposal ? 'Awaiting approval' : null,
          lastRecoverySnapshot: snapshot,
        })
      } else {
        set({ lastRecoverySnapshot: snapshot })
      }
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch (error) {
      const assistantError = getErrorMessage(error, 'The assistant could not finish this response.')
      const failedSession: SessionDetail = {
        ...nextSession,
        status: 'needs-attention',
        recentActivity: {
          label: 'Needs attention',
          summary: assistantError,
          at: now(),
        },
        lastActivityAt: now(),
      }
      const persisted = await persistSession(failedSession)
      const snapshot = await persistRecoverySnapshot(persisted)
      if (isCurrentStreamingSession()) {
        set({
          activeSession: persisted,
          assistantStatus: 'error',
          assistantError,
          currentStageLabel: null,
          lastRecoverySnapshot: snapshot,
        })
      } else {
        set({ lastRecoverySnapshot: snapshot })
      }
      await get().loadSessionHistory(get().sessionHistoryFilter)
    }
  },
  approvePendingCommand: async () => {
    const state = get()
    const { activeSession, pendingProposal, executionRecord } = state
    if (!activeSession || !pendingProposal || !executionRecord) {
      return
    }

    let transcript = appendApprovalResolution(activeSession.transcript, 'approved', pendingProposal)
    transcript = appendExecutionUpdate(transcript, 'Execution started.', 'running', pendingProposal)

    let nextSession: SessionDetail = {
      ...activeSession,
      transcript,
      recentActivity: {
        label: 'Working',
        summary: `Running command: ${pendingProposal.summary}`,
        at: now(),
      },
      lastActivityAt: now(),
    }

    let nextExecution: ExecutionRecord = {
      ...executionRecord,
      status: 'running',
      reviewState: 'pending',
      reviewUnavailableMessage: null,
      changedFiles: [],
      startedAt: now(),
      output: [createExecutionOutput('system', 'Approval accepted. Starting execution...')],
    }

    set({
      activeSession: nextSession,
      pendingProposal: null,
      executionRecord: nextExecution,
      selectedExecutionId: nextExecution.id,
      currentStageLabel: 'Working',
      bottomPanelExpanded: true,
      bottomPanelTab: 'output',
    })

    nextSession = await persistSession(nextSession)
    set({ activeSession: nextSession })

    try {
      await runApprovedCommand(nextExecution.command, nextExecution.projectPath, nextExecution.workingDirectory, {
        onStatus: () => {
          set({ currentStageLabel: 'Working' })
        },
        onOutput: (stream, text) => {
          const output = [...nextExecution.output, createExecutionOutput(stream, text)]
          nextExecution = {
            ...nextExecution,
            output,
            reviewUnavailableMessage: deriveReviewUnavailableMessage(output),
          }
          nextExecution = {
            ...nextExecution,
            reviewState: deriveExecutionReviewState(nextExecution),
          }
          set({ executionRecord: nextExecution })
        },
        onReviewReady: (files) => {
          const changedFiles: ChangedFileReview[] = files.map((file) => ({
            id: `review-${crypto.randomUUID()}`,
            ...file,
          }))
          nextExecution = {
            ...nextExecution,
            changedFiles,
            reviewState: changedFiles.length > 0 ? 'ready' : nextExecution.reviewState,
          }
          transcript = appendReviewAvailable(transcript, changedFiles.length)
          nextSession = {
            ...nextSession,
            transcript,
            recentActivity: {
              label: 'Review ready',
              summary: `Review ready: ${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'} ready for inspection.`,
              at: now(),
            },
            lastActivityAt: now(),
          }
          set({
            executionRecord: nextExecution,
            activeSession: nextSession,
            selectedReviewFileId: syncReviewSelection(get().executionRecord, nextExecution, get().selectedReviewFileId),
            bottomPanelExpanded: true,
            bottomPanelTab: 'review',
          })
        },
        onComplete: (status) => {
          nextExecution = {
            ...nextExecution,
            status: status === 'failed' ? 'failed' : 'completed',
            completedAt: now(),
          }
          nextExecution = {
            ...nextExecution,
            reviewUnavailableMessage: deriveReviewUnavailableMessage(nextExecution.output),
            reviewState: deriveExecutionReviewState(nextExecution),
          }
          transcript = appendExecutionUpdate(
            transcript,
            status === 'failed' ? 'Execution failed.' : 'Execution completed successfully.',
            status === 'failed' ? 'failed' : 'completed',
            pendingProposal,
          )
          nextSession = {
            ...nextSession,
            status: status === 'failed' ? 'needs-attention' : nextSession.status,
            transcript,
            recentActivity: {
              label:
                status === 'failed'
                  ? 'Failed'
                  : nextExecution.reviewState === 'ready'
                    ? 'Review ready'
                    : nextExecution.reviewState === 'unavailable'
                      ? 'Attached'
                      : 'Attached',
              summary:
                status === 'failed'
                  ? buildExecutionOutcomeSummary(nextExecution.output, 'Execution failed before completion.')
                  : nextExecution.reviewState === 'ready'
                    ? `Review ready: ${nextExecution.changedFiles.length} changed file${nextExecution.changedFiles.length === 1 ? '' : 's'} ready for inspection.`
                    : nextExecution.reviewState === 'unavailable'
                      ? nextExecution.reviewUnavailableMessage ?? 'Execution completed, but review artifacts were unavailable for this workspace.'
                      : buildExecutionOutcomeSummary(nextExecution.output, 'Execution completed. Ready to continue work.'),
              at: now(),
            },
            lastActivityAt: now(),
          }
          set({
            activeSession: nextSession,
            executionRecord: nextExecution,
            selectedReviewFileId: syncReviewSelection(get().executionRecord, nextExecution, get().selectedReviewFileId),
            currentStageLabel: status === 'failed' ? null : nextExecution.reviewState === 'ready' ? 'Review ready' : null,
          })
        },
        onError: () => {
          nextExecution = {
            ...nextExecution,
            status: 'failed',
            reviewState: 'empty',
            reviewUnavailableMessage: null,
            completedAt: now(),
          }
          transcript = appendExecutionUpdate(transcript, 'Execution failed.', 'failed', pendingProposal)
          nextSession = {
            ...nextSession,
            status: 'needs-attention',
            transcript,
            recentActivity: {
              label: 'Failed',
              summary: buildExecutionOutcomeSummary(nextExecution.output, 'Execution failed before completion.'),
              at: now(),
            },
            lastActivityAt: now(),
          }
          set({
            activeSession: nextSession,
            executionRecord: nextExecution,
            currentStageLabel: null,
            assistantError: 'Execution failed before completion.',
          })
        },
      })

      const persisted = await persistSession(nextSession)
      const snapshot = await persistRecoverySnapshot(persisted)
      set({ activeSession: persisted, lastRecoverySnapshot: snapshot })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch (error) {
      const assistantError = getErrorMessage(error, 'Execution failed before completion.')
      const output = [...nextExecution.output, createExecutionOutput('stderr', assistantError)]
      nextExecution = {
        ...nextExecution,
        status: 'failed',
        reviewState: 'empty',
        reviewUnavailableMessage: null,
        completedAt: now(),
        output,
      }
      transcript = appendExecutionUpdate(transcript, 'Execution failed.', 'failed', pendingProposal)
      nextSession = {
        ...nextSession,
        status: 'needs-attention',
        transcript,
        recentActivity: {
          label: 'Failed',
          summary: assistantError,
          at: now(),
        },
        lastActivityAt: now(),
      }
      const persisted = await persistSession(nextSession)
      const snapshot = await persistRecoverySnapshot(persisted)
      set({
        activeSession: persisted,
        executionRecord: nextExecution,
        selectedReviewFileId: null,
        currentStageLabel: null,
        assistantError,
        lastRecoverySnapshot: snapshot,
      })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    }
  },
  rejectPendingCommand: async () => {
    const state = get()
    const { activeSession, pendingProposal, executionRecord } = state
    if (!activeSession || !pendingProposal || !executionRecord) {
      return
    }

    let transcript = appendApprovalResolution(activeSession.transcript, 'rejected', pendingProposal)
    transcript = appendExecutionUpdate(transcript, 'Command rejected. No execution started.', 'rejected', pendingProposal)
    const nextSession: SessionDetail = {
      ...activeSession,
      transcript,
      recentActivity: {
        label: 'Rejected',
        summary: `Rejected command: ${pendingProposal.summary}`,
        at: now(),
      },
      lastActivityAt: now(),
    }

    const nextExecution: ExecutionRecord = {
      ...executionRecord,
      status: 'rejected',
      reviewState: 'empty',
      reviewUnavailableMessage: null,
      completedAt: now(),
      output: [...executionRecord.output, createExecutionOutput('system', 'Command rejected. No execution started.')],
    }

    const persisted = await persistSession(nextSession)
    const snapshot = await persistRecoverySnapshot(persisted)
    set({
      activeSession: persisted,
      lastRecoverySnapshot: snapshot,
      pendingProposal: null,
      executionRecord: nextExecution,
      selectedExecutionId: nextExecution.id,
      selectedReviewFileId: null,
      currentStageLabel: 'Rejected',
      bottomPanelExpanded: true,
      bottomPanelTab: 'output',
    })
    await get().loadSessionHistory(get().sessionHistoryFilter)
  },
  getDesktopWorkflow: () => buildDesktopWorkflow(get()),
  getDesktopStatus: () => deriveDesktopStatus(get()),
  getDesktopTrayMode: () => deriveTrayMode(get()),
  getChooserView: () => buildChooserView(get()),
  getActiveSessionHeader: () => buildActiveSessionHeader(get()),
}))
