import { expect, test } from 'playwright/test'

test('saves a compact preset from current shell state and keeps it in the right panel settings surface', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {}
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        setState: (next: object) => void
      }
    }).__APP_SHELL_STORE__

    store?.setState({
      mode: 'project',
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
      globalDefaultModel: 'claude-opus',
      bottomPanelTab: 'review',
      rightPanelOpen: true,
      rightPanelView: 'settings',
      activeSession: {
        id: 'session-preset-save',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'Preset session',
        status: 'active',
        recentActivity: { label: 'Attached', summary: 'Ready to continue work.', at: '4' },
        transcript: [],
      },
    })
  })

  await expect(page.locator('.right-panel__heading').filter({ hasText: 'Presets' })).toBeVisible()
  await expect(page.locator('.right-panel__section').filter({ hasText: 'Connection settings' })).toBeVisible()
  await expect(page.locator('.workspace')).not.toContainText('Presets')

  await page.getByRole('button', { name: 'Save current' }).click()

  const preset = page.locator('.right-panel__settings-item--active').first()
  await expect(preset).toContainText('Preset 1')
  await expect(preset).toContainText('Workspace')
  await expect(preset).toContainText('claude-opus')
  await expect(preset).toContainText('Review open')
  await expect(preset).toContainText('Active')
})

test('applying a preset updates future defaults without rewriting current session history', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {}
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        setState: (next: object) => void
      }
    }).__APP_SHELL_STORE__

    store?.setState({
      mode: 'conversation',
      globalDefaultModel: 'claude-haiku',
      bottomPanelTab: 'output',
      rightPanelOpen: true,
      rightPanelView: 'settings',
      presets: [
        {
          id: 'preset-focus',
          name: 'Focus review',
          mode: 'project',
          modelId: 'claude-opus',
          openReviewByDefault: true,
        },
      ],
      activeSession: {
        id: 'session-preserve-history',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'Existing session stays the same',
        status: 'active',
        recentActivity: { label: 'Attached', summary: 'Keep current session identity.', at: '4' },
        transcript: [
          {
            id: 'event-1',
            kind: 'assistant-message',
            body: 'Historical transcript entry.',
            createdAt: '5',
            displayRole: 'assistant',
          },
        ],
      },
      activeSessionModelOverride: 'claude-sonnet',
    })
  })

  await page.getByRole('button', { name: /Focus review/ }).click()

  await expect(page.locator('.right-panel')).toContainText('Workspace')
  await expect(page.locator('.right-panel')).toContainText('claude-opus')
  await expect(page.locator('.right-panel')).toContainText('Review open')

  const storeState = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          mode: 'project' | 'conversation'
          globalDefaultModel: string
          bottomPanelTab: string
          activePresetId: string | null
          activeSessionModelOverride: string | null
          activeSession: {
            effectiveModelId: string
            title: string
            transcript: Array<{ body: string }>
          } | null
        }
      }
    }).__APP_SHELL_STORE__

    return store?.getState()
  })

  expect(storeState?.mode).toBe('project')
  expect(storeState?.globalDefaultModel).toBe('claude-opus')
  expect(storeState?.bottomPanelTab).toBe('review')
  expect(storeState?.activePresetId).toBe('preset-focus')
  expect(storeState?.activeSessionModelOverride).toBe('claude-sonnet')
  expect(storeState?.activeSession?.effectiveModelId).toBe('claude-sonnet')
  expect(storeState?.activeSession?.title).toBe('Existing session stays the same')
  expect(storeState?.activeSession?.transcript[0]?.body).toBe('Historical transcript entry.')
})
