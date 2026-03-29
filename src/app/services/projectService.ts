import { invoke } from '@tauri-apps/api/core'
import type { ProjectRecord } from '../state/types'

export async function pickProjectDirectory(selectedPath: string) {
  return invoke<ProjectRecord>('select_project_directory', { selectedPath })
}

export async function getRecentProjects() {
  return invoke<ProjectRecord[]>('list_recent_projects')
}
