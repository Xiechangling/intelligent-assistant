import { invoke } from '@tauri-apps/api/core'
import type {
  SessionActivityUpdate,
  SessionDetail,
  SessionHistoryFilter,
  SessionRecoverySnapshot,
  SessionRecord,
} from '../state/types'

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window

type PlaywrightSessionMocks = {
  sessions: SessionDetail[]
  recoverySnapshot: SessionRecoverySnapshot | null
}

function getSessionMocks(): PlaywrightSessionMocks | null {
  if (!isBrowserTest) {
    return null
  }

  return (window as typeof window & { __PLAYWRIGHT_MOCKS__?: { session?: PlaywrightSessionMocks } }).__PLAYWRIGHT_MOCKS__?.session ?? null
}

function toSessionRecord(session: SessionDetail): SessionRecord {
  return {
    id: session.id,
    projectPath: session.projectPath,
    projectName: session.projectName,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    lastActivityAt: session.lastActivityAt,
    effectiveModelId: session.effectiveModelId,
    title: session.title,
    status: session.status,
    recentActivity: session.recentActivity,
  }
}

interface CreateSessionInput {
  projectPath: string
  projectName: string
  effectiveModelId: SessionRecord['effectiveModelId']
  title: string
  initialTranscript?: SessionDetail['transcript']
  recentActivity?: SessionRecord['recentActivity']
}

export async function createSession(input: CreateSessionInput) {
  const mocks = getSessionMocks()
  if (mocks) {
    const session: SessionDetail = {
      id: `session-${crypto.randomUUID()}`,
      projectPath: input.projectPath,
      projectName: input.projectName,
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      lastActivityAt: Date.now().toString(),
      effectiveModelId: input.effectiveModelId,
      title: input.title,
      status: 'active',
      recentActivity: input.recentActivity ?? null,
      transcript: input.initialTranscript ?? [],
    }
    mocks.sessions.unshift(session)
    return session
  }

  return invoke<SessionDetail>('create_session', { input })
}

export async function listSessions(filter?: SessionHistoryFilter) {
  const mocks = getSessionMocks()
  if (mocks) {
    return mocks.sessions
      .filter((session) => !filter?.projectPath || session.projectPath === filter.projectPath)
      .map(toSessionRecord)
  }

  return invoke<SessionRecord[]>('list_sessions', { filter })
}

export async function loadSession(sessionId: string) {
  const mocks = getSessionMocks()
  if (mocks) {
    const session = mocks.sessions.find((entry) => entry.id === sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }
    return session
  }

  return invoke<SessionDetail>('load_session', { sessionId })
}

export async function updateSessionActivity(sessionId: string, update: SessionActivityUpdate) {
  const mocks = getSessionMocks()
  if (mocks) {
    const index = mocks.sessions.findIndex((entry) => entry.id === sessionId)
    if (index === -1) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    const nextSession: SessionDetail = {
      ...mocks.sessions[index],
      ...update,
      updatedAt: Date.now().toString(),
      lastActivityAt: update.recentActivity?.at ?? mocks.sessions[index].lastActivityAt,
      transcript: update.transcript ?? mocks.sessions[index].transcript,
    }
    mocks.sessions[index] = nextSession
    return nextSession
  }

  return invoke<SessionDetail>('update_session_activity', { sessionId, update })
}

export async function saveRecoverySnapshot(snapshot: SessionRecoverySnapshot | null) {
  const mocks = getSessionMocks()
  if (mocks) {
    mocks.recoverySnapshot = snapshot
    return
  }

  return invoke<void>('save_recovery_snapshot', { snapshot })
}

export async function loadRecoverySnapshot() {
  const mocks = getSessionMocks()
  if (mocks) {
    return mocks.recoverySnapshot
  }

  return invoke<SessionRecoverySnapshot | null>('load_recovery_snapshot')
}
