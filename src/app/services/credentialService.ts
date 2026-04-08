import { invoke } from '@tauri-apps/api/core'
import type { CredentialStatusSummary } from '../state/types'

interface CredentialStatusResponse {
  status: CredentialStatusSummary
}

export interface AssistantConnectionSettings {
  apiBaseUrl: string | null
}

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window

type PlaywrightCredentialMocks = {
  status: CredentialStatusSummary
  apiBaseUrl: string | null
}

function getCredentialMocks(): PlaywrightCredentialMocks | null {
  if (!isBrowserTest) {
    return null
  }

  return (window as typeof window & { __PLAYWRIGHT_MOCKS__?: { credential?: PlaywrightCredentialMocks } }).__PLAYWRIGHT_MOCKS__?.credential ?? null
}

export async function getCredentialStatus() {
  const mocks = getCredentialMocks()
  if (mocks) {
    return mocks.status
  }

  const response = await invoke<CredentialStatusResponse>('credential_status')
  return response.status
}

export async function saveCredential(apiKey: string) {
  const mocks = getCredentialMocks()
  if (mocks) {
    void apiKey
    return mocks.status
  }

  const response = await invoke<CredentialStatusResponse>('store_api_credential', { apiKey })
  return response.status
}

export async function replaceCredential(apiKey: string) {
  const mocks = getCredentialMocks()
  if (mocks) {
    void apiKey
    return mocks.status
  }

  const response = await invoke<CredentialStatusResponse>('replace_api_credential', { apiKey })
  return response.status
}

export async function clearCredential() {
  const mocks = getCredentialMocks()
  if (mocks) {
    return 'missing'
  }

  const response = await invoke<CredentialStatusResponse>('clear_api_credential')
  return response.status
}

export async function getAssistantConnectionSettings() {
  const mocks = getCredentialMocks()
  if (mocks) {
    return { apiBaseUrl: mocks.apiBaseUrl }
  }

  return invoke<AssistantConnectionSettings>('get_assistant_connection_settings')
}

export async function saveAssistantConnectionSettings(apiBaseUrl: string) {
  const mocks = getCredentialMocks()
  if (mocks) {
    return { apiBaseUrl }
  }

  return invoke<AssistantConnectionSettings>('save_assistant_connection_settings', { apiBaseUrl })
}

export async function clearAssistantConnectionSettings() {
  const mocks = getCredentialMocks()
  if (mocks) {
    return { apiBaseUrl: null }
  }

  return invoke<AssistantConnectionSettings>('clear_assistant_connection_settings')
}
