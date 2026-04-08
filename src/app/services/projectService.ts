import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import type { ProjectRecord } from '../state/types'

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window

type PlaywrightProjectMocks = {
  selectedProject: ProjectRecord | null
  recentProjects: ProjectRecord[]
}

function getProjectMocks(): PlaywrightProjectMocks | null {
  if (!isBrowserTest) {
    return null
  }

  return (window as typeof window & { __PLAYWRIGHT_MOCKS__?: { project?: PlaywrightProjectMocks } }).__PLAYWRIGHT_MOCKS__?.project ?? null
}

export async function pickProjectDirectory() {
  const mocks = getProjectMocks()
  if (mocks) {
    return mocks.selectedProject
  }

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
  const mocks = getProjectMocks()
  if (mocks) {
    return mocks.recentProjects
  }

  return invoke<ProjectRecord[]>('list_recent_projects')
}
