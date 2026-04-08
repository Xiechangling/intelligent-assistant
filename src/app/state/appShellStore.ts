import { create } from 'zustand'
import { openFileAttachments, openImageAttachments } from '../services/attachmentService'
import { streamAssistantResponse } from '../services/assistantService'
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
  ExecutionStatus,
  ModelId,
  ProjectRecord,
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
  navigationHistory: string[]
  navigationIndex: number
  sidebarSessionsExpanded: boolean
  sidebarProjectsExpanded: boolean
  credentialStatus: CredentialStatusSummary
  projectWarning: string | null
  draftPrompt: string
  pendingAttachments: SessionAttachment[]
  assistantStatus: AssistantStatus
  assistantError: string | null
  currentStageLabel: string | null
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
  setSidebarSessionsExpanded: (expanded: boolean) => void
  setSidebarProjectsExpanded: (expanded: boolean) => void
  setCredentialStatus: (status: CredentialStatusSummary) => void
  setDraftPrompt: (prompt: string) => void
  addFileAttachments: () => Promise<void>
  addImageAttachments: () => Promise<void>
  removePendingAttachment: (attachmentId: string) => void
  setKeybindingsEnabled: (enabled: boolean) => void
  setMacOSOptionMappingEnabled: (enabled: boolean) => void
  goBack: () => void
  goForward: () => void
  pushNavigation: (sessionId: string) => void
  loadSessionHistory: (filter?: SessionHistoryFilter) => Promise<void>
  applySessionHistoryFilter: (projectPath: string | null) => Promise<void>
  createProjectSession: () => Promise<void>
  createConversationSession: () => Promise<void>
  resumeSession: (sessionId: string) => Promise<void>
  attemptRecovery: () => Promise<void>
  clearRecoveryMessage: () => void
  submitPrompt: () => Promise<void>
  getDesktopWorkflow: () => DesktopWorkflowViewModel
  getChooserView: () => DesktopChooserViewModel
  getActiveSessionHeader: () => DesktopSessionHeader | null
}

const defaultProject: ProjectRecord = {
  name: 'No project selected',
  path: null,
  warning: 'none',
}

const defaultSkillToggles: SkillToggle[] = []

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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
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
): DesktopSessionAttention {
  const summary = session.recentActivity?.summary?.toLowerCase() ?? ''
  const label = session.recentActivity?.label?.toLowerCase() ?? ''

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
      const attention = deriveSessionAttention(session)

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
          isWorking: isActive && state.assistantStatus === 'streaming',
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

function deriveDesktopStatus(state: AppShellState): DesktopWorkflowStatus {
  if (state.recoveryStatus === 'recovering' || state.resumeStatus === 'loading' || state.sessionHistoryStatus === 'loading') {
    return 'Connecting'
  }

  if (state.assistantError) {
    return state.activeSession?.status === 'needs-attention' ? 'Needs attention' : 'Failed'
  }

  if (state.assistantStatus === 'streaming') {
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

  const attention = deriveSessionAttention(session)

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
  const recovery = buildRecoveryView(state)
  const chooser = buildChooserView(state)
  const activeWorkspace = buildWorkspaceSummary(state)
  const activeSessionHeader = buildActiveSessionHeader(state)
  const desktopStatus = deriveDesktopStatus(state)

  // Determine tray mode based on state (stub for now - will be implemented in Phase 9)
  const trayMode: DesktopTrayMode = 'collapsed'

  // Determine active session attention
  const activeSessionAttention: DesktopSessionAttention = null

  return {
    startupState,
    desktopStatus,
    trayMode,
    recovery,
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
  navigationHistory: [],
  navigationIndex: -1,
  sidebarSessionsExpanded: true,
  sidebarProjectsExpanded: true,
  credentialStatus: 'missing',
  projectWarning: null,
  draftPrompt: '',
  pendingAttachments: [],
  assistantStatus: 'idle',
  assistantError: null,
  currentStageLabel: null,
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
      }
    }),
  setRecentProjects: (recentProjects) => set({ recentProjects }),
  setShellView: (activeShellView) => set({ activeShellView }),
  setGlobalDefaultModel: (globalDefaultModel) => set({ globalDefaultModel }),
  setActiveSessionModelOverride: (activeSessionModelOverride) => set({ activeSessionModelOverride }),
  setSidebarSessionsExpanded: (sidebarSessionsExpanded) => set({ sidebarSessionsExpanded }),
  setSidebarProjectsExpanded: (sidebarProjectsExpanded) => set({ sidebarProjectsExpanded }),
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
  setKeybindingsEnabled: (enabled) => set({ keybindingsEnabled: enabled }),
  setMacOSOptionMappingEnabled: (enabled) => set({ macOSOptionMappingEnabled: enabled }),
  goBack: () => {
    const state = get()
    if (state.navigationIndex > 0) {
      const newIndex = state.navigationIndex - 1
      const sessionId = state.navigationHistory[newIndex]
      set({ navigationIndex: newIndex })
      get().resumeSession(sessionId).catch(() => undefined)
    }
  },
  goForward: () => {
    const state = get()
    if (state.navigationIndex < state.navigationHistory.length - 1) {
      const newIndex = state.navigationIndex + 1
      const sessionId = state.navigationHistory[newIndex]
      set({ navigationIndex: newIndex })
      get().resumeSession(sessionId).catch(() => undefined)
    }
  },
  pushNavigation: (sessionId: string) => {
    set((state) => {
      const history = state.navigationHistory.slice(0, state.navigationIndex + 1)
      history.push(sessionId)
      if (history.length > 50) {
        history.shift()
      }
      return {
        navigationHistory: history,
        navigationIndex: history.length - 1,
      }
    })
  },
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
    })

    get().pushNavigation(session.id)
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
    })

    get().pushNavigation(session.id)
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
      })
      get().pushNavigation(sessionId)
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
            // Silently ignore command proposals in new UI
            console.log('Command proposal received but approval UI removed:', proposal.summary)
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
                label: state.mode === 'project' ? 'Attached' : 'Connected',
                summary: state.mode === 'project'
                  ? 'Ready to continue work.'
                  : 'Ready for the next message.',
                at: now(),
              },
              lastActivityAt: now(),
            }
            set({
              activeSession: nextSession,
              currentStageLabel: null,
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
          currentStageLabel: null,
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
  getDesktopWorkflow: () => buildDesktopWorkflow(get()),
  getChooserView: () => buildChooserView(get()),
  getActiveSessionHeader: () => buildActiveSessionHeader(get()),
}))
