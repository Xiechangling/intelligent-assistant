import { create } from 'zustand'
import { runApprovedCommand, streamAssistantResponse } from '../services/assistantService'
import { createSession, listSessions, loadRecoverySnapshot, loadSession, saveRecoverySnapshot, updateSessionActivity } from '../services/sessionService'
import type {
  AppMode,
  ApprovalDecision,
  ChangedFileReview,
  CommandProposal,
  CredentialStatusSummary,
  ExecutionOutputEntry,
  ExecutionRecord,
  ExecutionStatus,
  ModelId,
  ProjectRecord,
  ReviewPreset,
  RightPanelView,
  SessionDetail,
  SessionHistoryFilter,
  SessionRecord,
  SessionTranscriptEvent,
  ShellView,
  SkillToggle,
} from './types'

type SessionHistoryStatus = 'idle' | 'loading' | 'ready' | 'error'
type RecoveryStatus = 'idle' | 'recovering' | 'restored' | 'error'
type ResumeStatus = 'idle' | 'loading'
type AssistantStatus = 'idle' | 'streaming' | 'error'
type BottomPanelTab = 'output' | 'review'

interface AppShellState {
  mode: AppMode
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
  resumeStatus: ResumeStatus
  rightPanelView: RightPanelView
  rightPanelOpen: boolean
  bottomPanelExpanded: boolean
  bottomPanelTab: BottomPanelTab
  credentialStatus: CredentialStatusSummary
  projectWarning: string | null
  draftPrompt: string
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
  setMode: (mode: AppMode) => void
  setActiveProject: (project: ProjectRecord | null) => void
  setRecentProjects: (projects: ProjectRecord[]) => void
  setShellView: (view: ShellView) => void
  setGlobalDefaultModel: (model: ModelId) => void
  setActiveSessionModelOverride: (model: ModelId | null) => void
  setRightPanelView: (view: RightPanelView) => void
  setRightPanelOpen: (open: boolean) => void
  setBottomPanelExpanded: (expanded: boolean) => void
  setBottomPanelTab: (tab: BottomPanelTab) => void
  setCredentialStatus: (status: CredentialStatusSummary) => void
  setDraftPrompt: (prompt: string) => void
  selectReviewFile: (fileId: string) => void
  savePreset: (name: string) => void
  applyPreset: (presetId: string) => void
  toggleSkill: (skillId: string) => void
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
}

const defaultProject: ProjectRecord = {
  name: 'No project selected',
  path: null,
  warning: 'none',
}

const defaultSkillToggles: SkillToggle[] = [
  { id: 'project-analysis', label: 'Project analysis', enabled: true },
  { id: 'safe-execution', label: 'Safe execution', enabled: true },
  { id: 'review-surfaces', label: 'Review surfaces', enabled: true },
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
    label: 'Assistant active',
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

function buildExecutionRecord(proposal: CommandProposal): ExecutionRecord {
  return {
    id: `execution-${crypto.randomUUID()}`,
    proposalId: proposal.id,
    summary: proposal.summary,
    command: proposal.command,
    projectPath: proposal.projectPath,
    workingDirectory: proposal.workingDirectory,
    status: 'awaiting-approval',
    output: [],
    changedFiles: [],
    startedAt: null,
    completedAt: null,
  }
}

async function rehydrateSession(sessionId: string) {
  const session = await loadSession(sessionId)
  await saveRecoverySnapshot({
    sessionId: session.id,
    projectPath: session.projectPath,
    projectName: session.projectName,
    effectiveModelId: session.effectiveModelId,
    restoredAt: now(),
    lastActivityAt: session.lastActivityAt,
    recentActivity: session.recentActivity,
  })
  return session
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

function ensureConversationSession(state: AppShellState) {
  if (state.activeSession) {
    return state.activeSession
  }

  return null
}

function appendApprovalResolution(transcript: SessionTranscriptEvent[], decision: ApprovalDecision, proposal: CommandProposal) {
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

function appendExecutionUpdate(transcript: SessionTranscriptEvent[], body: string, status: ExecutionStatus, proposal?: CommandProposal) {
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

export const useAppShellStore = create<AppShellState>((set, get) => ({
  mode: 'project',
  activeProjectPath: null,
  recentProjects: [defaultProject],
  activeShellView: 'project-home',
  globalDefaultModel: 'claude-sonnet',
  activeSessionModelOverride: null,
  activeSession: null,
  sessionHistory: [],
  sessionHistoryFilter: {},
  sessionHistoryStatus: 'idle',
  sessionHistoryError: null,
  recoveryStatus: 'idle',
  recoveryMessage: null,
  resumeStatus: 'idle',
  rightPanelView: 'context',
  rightPanelOpen: false,
  bottomPanelExpanded: false,
  bottomPanelTab: 'output',
  credentialStatus: 'missing',
  projectWarning: null,
  draftPrompt: '',
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
  setMode: (mode) =>
    set((state) => ({
      mode,
      activeShellView: mode === 'project' ? 'project-home' : 'conversation-home',
      activeSession:
        state.activeSession && (mode === 'conversation' || state.activeSession.projectPath === state.activeProjectPath)
          ? state.activeSession
          : mode === 'project'
            ? null
            : state.activeSession,
      assistantStatus: 'idle',
      assistantError: null,
      currentStageLabel: null,
      pendingProposal: mode === 'conversation' ? null : state.pendingProposal,
      rightPanelOpen: mode === 'conversation' ? false : state.rightPanelOpen,
    })),
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
  setBottomPanelExpanded: (bottomPanelExpanded) => set({ bottomPanelExpanded }),
  setBottomPanelTab: (bottomPanelTab) => set({ bottomPanelTab }),
  setCredentialStatus: (credentialStatus) => set({ credentialStatus }),
  setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
  selectReviewFile: (selectedReviewFileId) => set({ selectedReviewFileId, bottomPanelTab: 'review', bottomPanelExpanded: true }),
  savePreset: (name) =>
    set((state) => {
      const preset: ReviewPreset = {
        id: `preset-${crypto.randomUUID()}`,
        name,
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
  loadSessionHistory: async (filter) => {
    const nextFilter = filter ?? get().sessionHistoryFilter
    set({ sessionHistoryStatus: 'loading', sessionHistoryError: null, sessionHistoryFilter: nextFilter })

    try {
      const sessionHistory = await listSessions(nextFilter)
      set({ sessionHistory, sessionHistoryStatus: 'ready' })
    } catch {
      set({ sessionHistoryStatus: 'error', sessionHistoryError: 'We couldn’t load session history.' })
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
        label: 'Active',
        summary: 'Ready to continue work.',
        at: now(),
      },
    })

    set({
      activeSession: session,
      activeSessionModelOverride: session.effectiveModelId,
      activeShellView: 'project-sessions',
      recoveryStatus: 'idle',
      recoveryMessage: null,
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

    await saveRecoverySnapshot({
      sessionId: session.id,
      projectPath: session.projectPath,
      projectName: session.projectName,
      effectiveModelId: session.effectiveModelId,
      restoredAt: now(),
      lastActivityAt: session.lastActivityAt,
      recentActivity: session.recentActivity,
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
        label: 'Active',
        summary: 'Ready for a direct conversation.',
        at: now(),
      },
    })

    set({
      mode: 'conversation',
      activeSession: session,
      activeSessionModelOverride: session.effectiveModelId,
      activeShellView: 'conversation-home',
      recoveryStatus: 'idle',
      recoveryMessage: null,
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

    await saveRecoverySnapshot({
      sessionId: session.id,
      projectPath: session.projectPath,
      projectName: session.projectName,
      effectiveModelId: session.effectiveModelId,
      restoredAt: now(),
      lastActivityAt: session.lastActivityAt,
      recentActivity: session.recentActivity,
    })
    await get().loadSessionHistory({})
  },
  resumeSession: async (sessionId) => {
    set({ resumeStatus: 'loading', recoveryMessage: 'Restoring session' })

    try {
      const session = await rehydrateSession(sessionId)
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
    } catch {
      set({
        resumeStatus: 'idle',
        recoveryStatus: 'error',
        recoveryMessage: 'Unable to restore that session right now.',
      })
    }
  },
  attemptRecovery: async () => {
    set({ recoveryStatus: 'recovering', recoveryMessage: null })

    try {
      const snapshot = await loadRecoverySnapshot()
      if (!snapshot) {
        set({ recoveryStatus: 'idle' })
        await get().loadSessionHistory(get().sessionHistoryFilter)
        return
      }

      const session = await rehydrateSession(snapshot.sessionId)
      const isConversation = session.projectPath === '__conversation__'
      set({
        activeSession: session,
        activeProjectPath: isConversation ? get().activeProjectPath : session.projectPath,
        activeSessionModelOverride: session.effectiveModelId,
        activeShellView: isConversation ? 'conversation-home' : 'project-sessions',
        mode: isConversation ? 'conversation' : 'project',
        recoveryStatus: 'restored',
        recoveryMessage: `Session restored for ${session.projectName}.`,
        pendingProposal: null,
        executionRecord: null,
        selectedExecutionId: null,
        selectedReviewFileId: null,
        rightPanelOpen: false,
      })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch {
      set({
        recoveryStatus: 'error',
        recoveryMessage: 'Recovery failed. You can keep working and reload session history.',
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

    const userEvent = createEvent({
      kind: 'user-message',
      displayRole: 'user',
      body: prompt,
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

    set({
      activeSession: nextSession,
      assistantStatus: 'streaming',
      assistantError: null,
      currentStageLabel: state.mode === 'project' ? 'Understanding request' : 'Responding',
      draftPrompt: '',
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
        },
        {
          onStage: (stageLabel, body) => {
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
              recentActivity: createAssistantActivity(stageLabel),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession, currentStageLabel: stageLabel })
          },
          onAssistantStart: () => {
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
              recentActivity: createAssistantActivity('Assistant is responding'),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession })
          },
          onAssistantChunk: (chunk) => {
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
              recentActivity: createAssistantActivity('Streaming assistant response'),
              lastActivityAt: now(),
            }
            set({ activeSession: nextSession })
          },
          onCommandProposal: (proposalPayload) => {
            const proposal: CommandProposal = {
              id: `proposal-${crypto.randomUUID()}`,
              ...proposalPayload,
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
                label: 'Approval required',
                summary: proposal.summary,
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
            })
          },
          onToolSummary: (toolLabel, toolSummary) => {
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
          },
          onComplete: () => {
            nextSession = {
              ...nextSession,
              transcript,
              recentActivity: {
                label: state.mode === 'project' && get().pendingProposal ? 'Approval required' : 'Complete',
                summary:
                  state.mode === 'project' && get().pendingProposal
                    ? 'Waiting for command approval before execution.'
                    : state.mode === 'project'
                      ? 'Project response complete.'
                      : 'Conversation response complete.',
                at: now(),
              },
              lastActivityAt: now(),
            }
            set({
              activeSession: nextSession,
              currentStageLabel: state.mode === 'project' && get().pendingProposal ? 'Awaiting approval' : state.mode === 'project' ? 'Done' : null,
            })
          },
        },
      )

      const persisted = await persistSession(nextSession)
      set({
        activeSession: persisted,
        assistantStatus: 'idle',
        currentStageLabel: get().pendingProposal ? 'Awaiting approval' : null,
      })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch {
      const failedSession = {
        ...nextSession,
        status: 'needs-attention' as const,
        recentActivity: {
          label: 'Needs attention',
          summary: 'Assistant response failed before completion.',
          at: now(),
        },
        lastActivityAt: now(),
      }
      const persisted = await persistSession(failedSession)
      set({
        activeSession: persisted,
        assistantStatus: 'error',
        assistantError: 'The assistant could not finish this response.',
        currentStageLabel: null,
      })
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
        label: 'Execution running',
        summary: pendingProposal.summary,
        at: now(),
      },
      lastActivityAt: now(),
    }

    let nextExecution: ExecutionRecord = {
      ...executionRecord,
      status: 'running',
      startedAt: now(),
      output: [createExecutionOutput('system', 'Approval accepted. Starting execution...')],
    }

    set({
      activeSession: nextSession,
      pendingProposal: null,
      executionRecord: nextExecution,
      selectedExecutionId: nextExecution.id,
      currentStageLabel: 'Execution running',
      bottomPanelExpanded: true,
      bottomPanelTab: 'output',
    })

    nextSession = await persistSession(nextSession)
    set({ activeSession: nextSession })

    try {
      await runApprovedCommand(nextExecution.command, {
        onStatus: (label) => {
          set({ currentStageLabel: label })
        },
        onOutput: (stream, text) => {
          nextExecution = {
            ...nextExecution,
            output: [...nextExecution.output, createExecutionOutput(stream, text)],
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
          }
          transcript = appendReviewAvailable(transcript, changedFiles.length)
          nextSession = {
            ...nextSession,
            transcript,
            recentActivity: {
              label: 'Review ready',
              summary: `${changedFiles.length} changed file${changedFiles.length === 1 ? '' : 's'} ready for inspection.`,
              at: now(),
            },
            lastActivityAt: now(),
          }
          set({
            executionRecord: nextExecution,
            activeSession: nextSession,
            selectedReviewFileId: changedFiles[0]?.id ?? null,
            bottomPanelExpanded: true,
            bottomPanelTab: 'review',
          })
        },
        onComplete: () => {
          nextExecution = {
            ...nextExecution,
            status: 'completed',
            completedAt: now(),
          }
          transcript = appendExecutionUpdate(transcript, 'Execution completed successfully.', 'completed', pendingProposal)
          nextSession = {
            ...nextSession,
            transcript,
            recentActivity: {
              label: 'Execution complete',
              summary: pendingProposal.summary,
              at: now(),
            },
            lastActivityAt: now(),
          }
          set({
            activeSession: nextSession,
            executionRecord: nextExecution,
            currentStageLabel: 'Execution complete',
          })
        },
        onError: () => {
          nextExecution = {
            ...nextExecution,
            status: 'failed',
            completedAt: now(),
          }
          transcript = appendExecutionUpdate(transcript, 'Execution failed.', 'failed', pendingProposal)
          nextSession = {
            ...nextSession,
            status: 'needs-attention',
            transcript,
            recentActivity: {
              label: 'Execution failed',
              summary: pendingProposal.summary,
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
      set({ activeSession: persisted })
      await get().loadSessionHistory(get().sessionHistoryFilter)
    } catch {
      nextExecution = {
        ...nextExecution,
        status: 'failed',
        completedAt: now(),
      }
      transcript = appendExecutionUpdate(transcript, 'Execution failed.', 'failed', pendingProposal)
      nextSession = {
        ...nextSession,
        status: 'needs-attention',
        transcript,
        recentActivity: {
          label: 'Execution failed',
          summary: pendingProposal.summary,
          at: now(),
        },
        lastActivityAt: now(),
      }
      const persisted = await persistSession(nextSession)
      set({
        activeSession: persisted,
        executionRecord: nextExecution,
        currentStageLabel: null,
        assistantError: 'Execution failed before completion.',
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

    const transcript = appendApprovalResolution(activeSession.transcript, 'rejected', pendingProposal)
    const nextSession: SessionDetail = {
      ...activeSession,
      transcript,
      recentActivity: {
        label: 'Command rejected',
        summary: pendingProposal.summary,
        at: now(),
      },
      lastActivityAt: now(),
    }

    const nextExecution: ExecutionRecord = {
      ...executionRecord,
      status: 'rejected',
      completedAt: now(),
      output: [...executionRecord.output, createExecutionOutput('system', 'Command rejected. No execution started.')],
    }

    const persisted = await persistSession(nextSession)
    set({
      activeSession: persisted,
      pendingProposal: null,
      executionRecord: nextExecution,
      selectedExecutionId: nextExecution.id,
      currentStageLabel: null,
      bottomPanelExpanded: true,
      bottomPanelTab: 'output',
    })
    await get().loadSessionHistory(get().sessionHistoryFilter)
  },
}))
