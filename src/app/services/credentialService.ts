import { invoke } from '@tauri-apps/api/core'
import type { CredentialStatusSummary } from '../state/types'

interface CredentialStatusResponse {
  status: CredentialStatusSummary
}

export async function getCredentialStatus() {
  const response = await invoke<CredentialStatusResponse>('credential_status')
  return response.status
}

export async function saveCredential(apiKey: string) {
  const response = await invoke<CredentialStatusResponse>('store_api_credential', { apiKey })
  return response.status
}

export async function replaceCredential(apiKey: string) {
  const response = await invoke<CredentialStatusResponse>('replace_api_credential', { apiKey })
  return response.status
}

export async function clearCredential() {
  const response = await invoke<CredentialStatusResponse>('clear_api_credential')
  return response.status
}
