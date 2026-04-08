import { open } from '@tauri-apps/plugin-dialog'
import type { SessionAttachment } from '../state/types'

const isBrowserTest = typeof window !== 'undefined' && '__PLAYWRIGHT_MOCKS__' in window

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
