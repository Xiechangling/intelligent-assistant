import { create } from 'zustand'
import type {
  AppMode,
  CredentialStatusSummary,
  ModelId,
  ProjectRecord,
  RightPanelView,
  ShellView,
} from './types'

interface AppShellState {
  mode: AppMode
  activeProjectPath: string | null
  recentProjects: ProjectRecord[]
  activeShellView: ShellView
  globalDefaultModel: ModelId
  activeSessionModelOverride: ModelId | null
  rightPanelView: RightPanelView
  bottomPanelExpanded: boolean
  credentialStatus: CredentialStatusSummary
  setMode: (mode: AppMode) => void
  setActiveProject: (project: ProjectRecord | null) => void
  setShellView: (view: ShellView) => void
  setGlobalDefaultModel: (model: ModelId) => void
  setActiveSessionModelOverride: (model: ModelId | null) => void
  setRightPanelView: (view: RightPanelView) => void
  setBottomPanelExpanded: (expanded: boolean) => void
  setCredentialStatus: (status: CredentialStatusSummary) => void
}

const defaultProject: ProjectRecord = {
  name: 'No project selected',
  path: null,
  warning: 'none',
}

export const useAppShellStore = create<AppShellState>((set) => ({
  mode: 'project',
  activeProjectPath: null,
  recentProjects: [defaultProject],
  activeShellView: 'project-home',
  globalDefaultModel: 'claude-sonnet',
  activeSessionModelOverride: null,
  rightPanelView: 'context',
  bottomPanelExpanded: false,
  credentialStatus: 'missing',
  setMode: (mode) =>
    set({
      mode,
      activeShellView: mode === 'project' ? 'project-home' : 'conversation-home',
    }),
  setActiveProject: (project) =>
    set((state) => {
      if (!project) {
        return {
          activeProjectPath: null,
          activeShellView: 'project-home',
        }
      }

      const filteredProjects = state.recentProjects.filter((entry) => entry.path !== project.path)

      return {
        activeProjectPath: project.path,
        activeShellView: 'project-sessions',
        recentProjects: [project, ...filteredProjects],
      }
    }),
  setShellView: (activeShellView) => set({ activeShellView }),
  setGlobalDefaultModel: (globalDefaultModel) => set({ globalDefaultModel }),
  setActiveSessionModelOverride: (activeSessionModelOverride) => set({ activeSessionModelOverride }),
  setRightPanelView: (rightPanelView) => set({ rightPanelView }),
  setBottomPanelExpanded: (bottomPanelExpanded) => set({ bottomPanelExpanded }),
  setCredentialStatus: (credentialStatus) => set({ credentialStatus }),
}))
