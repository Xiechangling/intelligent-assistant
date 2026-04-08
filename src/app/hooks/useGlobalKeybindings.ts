import { useEffect } from 'react'
import { useAppShellStore } from '../state/appShellStore'
import { pickProjectDirectory } from '../services/projectService'

interface KeybindingConfig {
  enabled: boolean
  macOSOptionMapping: boolean
}

export function useGlobalKeybindings(config: KeybindingConfig = { enabled: true, macOSOptionMapping: true }) {
  const { createProjectSession, setRightPanelOpen, setRightPanelView, setActiveProject } = useAppShellStore()

  useEffect(() => {
    if (!config.enabled) {
      return
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      // macOS Option key mapping: Option+t = †, Option+o = ø, Option+e = ´ or é
      const isMacOptionT = config.macOSOptionMapping && event.key === '†'
      const isMacOptionO = config.macOSOptionMapping && event.key === 'ø'
      const isMacOptionE = config.macOSOptionMapping && (event.key === '´' || event.key === 'é')

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

      // ctrl+e: 打开设置
      if ((event.ctrlKey && event.key === 'e') || isMacOptionE) {
        event.preventDefault()
        setRightPanelView('settings')
        setRightPanelOpen(true)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config.enabled, config.macOSOptionMapping, createProjectSession, setRightPanelOpen, setRightPanelView, setActiveProject])
}
