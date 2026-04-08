import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'intelligent-assistant-input-history'
const MAX_HISTORY_SIZE = 50

// Sensitive data filter
function isSensitive(text: string): boolean {
  const sensitivePatterns = [
    /api[_-]?key/i,
    /password/i,
    /secret/i,
    /token/i,
    /credential/i,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // email
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  ]

  return sensitivePatterns.some(pattern => pattern.test(text))
}

function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save input history:', error)
  }
}

export function useInputHistory(currentValue: string, onChange: (value: string) => void) {
  const [history, setHistory] = useState<string[]>(loadHistory)
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [tempDraft, setTempDraft] = useState<string>('')
  const isNavigating = useRef(false)

  // Add new entry to history
  const addToHistory = (text: string) => {
    if (!text.trim() || isSensitive(text)) {
      return
    }

    setHistory(prev => {
      // Remove duplicates
      const filtered = prev.filter(item => item !== text)
      // Add to beginning
      const updated = [text, ...filtered].slice(0, MAX_HISTORY_SIZE)
      saveHistory(updated)
      return updated
    })

    // Reset navigation state
    setHistoryIndex(-1)
    setTempDraft('')
  }

  // Handle ↑/↓ key navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (history.length === 0) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      isNavigating.current = true

      // First ↑: save current draft
      if (historyIndex === -1) {
        setTempDraft(currentValue)
        setHistoryIndex(0)
        onChange(history[0])
      } else if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1
        setHistoryIndex(nextIndex)
        onChange(history[nextIndex])
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      isNavigating.current = true

      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1
        setHistoryIndex(nextIndex)
        onChange(history[nextIndex])
      } else if (historyIndex === 0) {
        // Return to draft
        setHistoryIndex(-1)
        onChange(tempDraft)
      }
    }
  }

  return {
    addToHistory,
    handleKeyDown,
    historySize: history.length,
  }
}
