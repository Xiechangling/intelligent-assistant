import { useEffect } from 'react'
import { useAppShellStore } from '../state/appShellStore'
import { pickProjectDirectory } from '../services/projectService'

interface KeybindingConfig {
  enabled: boolean
  macOSOptionMapping: boolean
}

export function useGlobalKeybindings(config: KeybindingConfig = { enabled: true, macOSOptionMapping: true }) {
  const { createProjectSession, setActiveProject } = useAppShellStore()

  useEffect(() => {
    if (!config.enabled) {
      return
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      // macOS Option key mapping: Option+t = †, Option+o = ø
      const isMacOptionT = config.macOSOptionMapping && event.key === '†'
      const isMacOptionO = config.macOSOptionMapping && event.key === 'ø'

      // ctrl+t: 新建会话
      if ((event.ctrlKey && event.key === 't') || isMacOptionT) {
        event.preventDefault()
        await createProjectSession()
        return
      }

      // ctrl+o: 打开项目
      if ((event.ctrlKey && event.key === 'o') || isMacOptionO) {
        event.preventDefault()
        try {
          const project = await pickProjectDirectory()
          if (project) {
            setActiveProject(project)
          }
        } catch (error) {
          console.error('Failed to pick project:', error)
        }
        return
      }

      // ctrl+e: Settings removed in Phase 8 - keybinding disabled
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config.enabled, config.macOSOptionMapping, createProjectSession, setActiveProject])
}
