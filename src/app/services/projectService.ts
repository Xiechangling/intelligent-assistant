import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import type { ProjectRecord } from '../state/types'

export async function pickProjectDirectory() {
  const selectedPath = await open({
    directory: true,
    multiple: false,
    title: 'Select project folder',
  })

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null
  }

  return invoke<ProjectRecord>('select_project_directory', { selectedPath })
}

export async function getRecentProjects() {
  return invoke<ProjectRecord[]>('list_recent_projects')
}
