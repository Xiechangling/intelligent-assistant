import { expect, test } from 'playwright/test'

async function bootChooser(page: Parameters<typeof test>[0]['page']) {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: {
        selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
        recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
      },
      credential: { status: 'configured', apiBaseUrl: null },
      session: {
        recoverySnapshot: null,
        sessions: [
          {
            id: 'session-attach',
            projectPath: 'E:/work/ai/agent/sample-workspace',
            projectName: 'sample-workspace',
            createdAt: '1712400000000',
            updatedAt: '1712400300000',
            lastActivityAt: '1712400300000',
            effectiveModelId: 'claude-sonnet',
            title: 'Align startup flow',
            status: 'active',
            recentActivity: { label: 'Awaiting approval', summary: 'Awaiting command approval', at: '1712400300000' },
            transcript: [],
          },
          {
            id: 'session-review',
            projectPath: 'E:/work/ai/agent/sample-workspace',
            projectName: 'sample-workspace',
            createdAt: '1712400000000',
            updatedAt: '1712400400000',
            lastActivityAt: '1712400400000',
            effectiveModelId: 'claude-opus',
            title: 'Polish approval tray',
            status: 'complete',
            recentActivity: { label: 'Review ready', summary: 'Review artifacts available', at: '1712400400000' },
            transcript: [],
          },
        ],
      },
      assistant: {
        assistantTurnResponse: { stages: [], assistantMessage: 'Ready.', commandProposal: null, toolSummary: null },
        executeCommandResponse: { status: 'completed', startedAt: '1712400410000', completedAt: '1712400420000', output: [], changedFiles: [] },
      },
    }
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void; setActiveProject: (project: { name: string; path: string; warning: 'none' | 'non-standard' }) => void; loadSessionHistory: (filter?: { projectPath?: string | null }) => Promise<void> } } }).__APP_SHELL_STORE__
    const state = store?.getState()
    state?.setMode('project')
    state?.setActiveProject({ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' })
    return state?.loadSessionHistory({ projectPath: 'E:/work/ai/agent/sample-workspace' })
  })
}

test('shows chooser rows and exact actions for recent sessions', async ({ page }) => {
  await bootChooser(page)

  await expect(page.getByRole('heading', { name: 'Choose where to continue work' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Choose a coding session' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Align startup flow/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Align startup flow/ }).first()).toContainText('Awaiting command approval')
  await expect(page.getByRole('button', { name: /Polish approval tray/ }).first()).toContainText('Review artifacts available')
  await expect(page.getByRole('button', { name: 'Start new session' }).first()).toBeVisible()
})
