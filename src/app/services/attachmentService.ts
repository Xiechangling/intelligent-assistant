import { open } from '@tauri-apps/plugin-dialog'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useEffect, useState } from 'react'
import type { SessionAttachment } from '../state/types'

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window

interface DragDropFile {
  path: string
  name: string
  size: number
}

function normalizeSelections(selected: string | string[] | null, kind: 'file' | 'image'): SessionAttachment[] {
  if (!selected) {
    return []
  }

  const paths = Array.isArray(selected) ? selected : [selected]
  return paths.map((path) => {
    const normalizedPath = path.replace(/\\/g, '/')
    const name = normalizedPath.split('/').pop() || normalizedPath
    return {
      id: `attachment-${crypto.randomUUID()}`,
      kind,
      name,
      path: normalizedPath,
      source: 'picker',
      status: 'ready',
      mimeType: kind === 'image' ? 'image/*' : undefined,
    }
  })
}

export async function openFileAttachments() {
  if (isBrowserTest) {
    return []
  }

  const selected = await open({
    multiple: true,
    directory: false,
    title: 'Insert files',
  })

  return normalizeSelections(selected, 'file')
}

export async function openImageAttachments() {
  if (isBrowserTest) {
    return []
  }

  const selected = await open({
    multiple: true,
    directory: false,
    title: 'Insert images',
    filters: [
      {
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'],
      },
    ],
  })

  return normalizeSelections(selected, 'image')
}

export function useDragDrop(onFilesDropped: (files: DragDropFile[]) => void) {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isBrowserTest) {
      return
    }

    let unlistenDrop: UnlistenFn | null = null
    let unlistenEnter: UnlistenFn | null = null
    let unlistenLeave: UnlistenFn | null = null

    const setupListeners = async () => {
      unlistenDrop = await listen<string[]>('tauri://drag-drop', (event) => {
        setIsDragging(false)
        const files: DragDropFile[] = event.payload.map((path) => {
          const normalizedPath = path.replace(/\\/g, '/')
          const name = normalizedPath.split('/').pop() || normalizedPath
          return {
            path: normalizedPath,
            name,
            size: 0,
          }
        })
        onFilesDropped(files)
      })

      unlistenEnter = await listen('tauri://drag-enter', () => {
        setIsDragging(true)
      })

      unlistenLeave = await listen('tauri://drag-leave', () => {
        setIsDragging(false)
      })
    }

    setupListeners()

    return () => {
      if (unlistenDrop) unlistenDrop()
      if (unlistenEnter) unlistenEnter()
      if (unlistenLeave) unlistenLeave()
    }
  }, [onFilesDropped])

  return { isDragging }
}

export function validateFileType(path: string): boolean {
  const allowedExtensions = [
    'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'xml',
    'py', 'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'rb', 'php',
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg',
  ]
  const extension = path.split('.').pop()?.toLowerCase()
  return extension ? allowedExtensions.includes(extension) : false
}
