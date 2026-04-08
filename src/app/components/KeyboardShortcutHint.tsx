import React from 'react'

interface KeyboardShortcutHintProps {
  shortcut: string
  action?: string
  parens?: boolean
}

export function KeyboardShortcutHint({ shortcut, action, parens = false }: KeyboardShortcutHintProps) {
  const isMac = typeof window !== 'undefined' && window.navigator.platform.toLowerCase().includes('mac')

  const formatShortcut = (shortcut: string): string => {
    const parts = shortcut.toLowerCase().split('+')

    const formatted = parts.map(part => {
      if (part === 'ctrl') {
        return isMac ? '⌘' : 'Ctrl'
      }
      if (part === 'alt') {
        return isMac ? '⌥' : 'Alt'
      }
      if (part === 'shift') {
        return isMac ? '⇧' : 'Shift'
      }
      // Capitalize first letter for other keys
      return part.charAt(0).toUpperCase() + part.slice(1)
    })

    return formatted.join(isMac ? '' : '+')
  }

  const formattedShortcut = formatShortcut(shortcut)
  const content = (
    <>
      <kbd className="keyboard-hint__key">{formattedShortcut}</kbd>
      {action && <span className="keyboard-hint__action"> {action}</span>}
    </>
  )

  return (
    <span className="keyboard-hint">
      {parens ? `(${content})` : content}
    </span>
  )
}
