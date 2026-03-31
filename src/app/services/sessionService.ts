import { invoke } from '@tauri-apps/api/core'
import type {
  SessionActivityUpdate,
  SessionDetail,
  SessionHistoryFilter,
  SessionRecoverySnapshot,
  SessionRecord,
} from '../state/types'

interface CreateSessionInput {
  projectPath: string
  projectName: string
  effectiveModelId: SessionRecord['effectiveModelId']
  title: string
  initialTranscript?: SessionDetail['transcript']
  recentActivity?: SessionRecord['recentActivity']
}

export async function createSession(input: CreateSessionInput) {
  return invoke<SessionDetail>('create_session', { input })
}

export async function listSessions(filter?: SessionHistoryFilter) {
  return invoke<SessionRecord[]>('list_sessions', { filter })
}

export async function loadSession(sessionId: string) {
  return invoke<SessionDetail>('load_session', { sessionId })
}

export async function updateSessionActivity(sessionId: string, update: SessionActivityUpdate) {
  return invoke<SessionDetail>('update_session_activity', { sessionId, update })
}

export async function saveRecoverySnapshot(snapshot: SessionRecoverySnapshot | null) {
  return invoke<void>('save_recovery_snapshot', { snapshot })
}

export async function loadRecoverySnapshot() {
  return invoke<SessionRecoverySnapshot | null>('load_recovery_snapshot')
}
