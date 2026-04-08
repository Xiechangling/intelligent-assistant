import { expect, test } from 'playwright/test'

async function waitForStore(page: import('playwright/test').Page) {
  await page.waitForFunction(() => Boolean((window as Window & { __APP_SHELL_STORE__?: unknown }).__APP_SHELL_STORE__))
}

test('ignores stale stream updates after switching to another conversation session', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: {
        selectedProject: null,
        recentProjects: [],
      },
      credential: { status: 'configured', apiBaseUrl: null },
      session: { recoverySnapshot: null, sessions: [] },
    }

    const callbacks = new Map<number, (event: unknown) => void>()
    const listeners = new Map<number, { event: string; handler: number }>()
    let callbackId = 0
    let listenerId = 0

    const emitAssistantEvent = (payload: unknown) => {
      for (const [id, listener] of listeners.entries()) {
        if (listener.event !== 'assistant-turn-event') {
          continue
        }
        const callback = callbacks.get(listener.handler)
        callback?.({ event: listener.event, id, payload })
      }
    }

    ;(window as Window & { __TAURI_EVENT_PLUGIN_INTERNALS__?: { unregisterListener: () => void } }).__TAURI_EVENT_PLUGIN_INTERNALS__ = {
      unregisterListener: () => {},
    }

    ;(window as Window & {
      __TAURI_INTERNALS__?: {
        transformCallback: (callback: (event: unknown) => void) => number
        unregisterCallback: (id: number) => void
        invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>
      }
    }).__TAURI_INTERNALS__ = {
      transformCallback: (callback) => {
        callbackId += 1
        callbacks.set(callbackId, callback)
        return callbackId
      },
      unregisterCallback: (id) => {
        callbacks.delete(id)
      },
      invoke: async (cmd, args) => {
        if (cmd === 'plugin:event|listen') {
          listenerId += 1
          listeners.set(listenerId, {
            event: (args?.event as string) ?? '',
            handler: args?.handler as number,
          })
          return listenerId
        }

        if (cmd === 'plugin:event|unlisten') {
          listeners.delete((args?.eventId as number) ?? -1)
          return null
        }

        if (cmd === 'start_assistant_turn_stream') {
          setTimeout(() => {
            emitAssistantEvent({ kind: 'assistant-start', turnId: 'turn-stale' })
            emitAssistantEvent({ kind: 'assistant-delta', turnId: 'turn-stale', delta: 'stale text' })
            emitAssistantEvent({ kind: 'complete', turnId: 'turn-stale' })
          }, 50)
          return { turnId: 'turn-stale' }
        }

        throw new Error(`Unexpected invoke: ${cmd}`)
      },
    }
  })

  await page.goto('/')
  await waitForStore(page)
  await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          setMode: (mode: 'project' | 'conversation') => void
        }
      }
    }).__APP_SHELL_STORE__
    store?.getState().setMode('conversation')
  })

  await page.evaluate(async () => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          createConversationSession: () => Promise<void>
          setDraftPrompt: (prompt: string) => void
          submitPrompt: () => Promise<void>
        }
        setState: (next: object) => void
      }
    }).__APP_SHELL_STORE__

    const state = store?.getState()
    await state?.createConversationSession()
    state?.setDraftPrompt('First stream')
    const submitPromise = state?.submitPrompt()

    await new Promise((resolve) => setTimeout(resolve, 10))

    await state?.createConversationSession()
    const secondState = store?.getState()
    const secondSession = secondState?.activeSession
    if (secondSession) {
      store?.setState({
        activeSession: {
          ...secondSession,
          title: 'Second conversation',
        },
      })
    }

    await submitPromise
  })

  const finalState = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          activeSession: { id: string; title: string; transcript: Array<{ body: string }> } | null
          assistantStatus: 'idle' | 'streaming' | 'error'
        }
      }
    }).__APP_SHELL_STORE__
    const state = store?.getState()
    return {
      sessionId: state?.activeSession?.id ?? null,
      title: state?.activeSession?.title ?? null,
      transcriptBodies: state?.activeSession?.transcript.map((event) => event.body) ?? [],
      assistantStatus: state?.assistantStatus ?? 'idle',
    }
  })

  expect(finalState.sessionId).not.toBeNull()
  expect(finalState.title).toBe('Second conversation')
  expect(finalState.transcriptBodies.join('\n')).not.toContain('stale text')
  expect(finalState.assistantStatus).toBe('idle')
})


