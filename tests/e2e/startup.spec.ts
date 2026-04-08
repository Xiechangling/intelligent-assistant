import { expect, test } from 'playwright/test'

type MockSession = {
  id: string
  projectPath: string
  projectName: string
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  effectiveModelId: 'claude-opus' | 'claude-sonnet' | 'claude-haiku'
  title: string
  status: 'active' | 'idle' | 'needs-attention' | 'complete'
  recentActivity: { label: string; summary: string; at: string } | null
  transcript: Array<{ id: string; kind: string; body: string; createdAt: string; displayRole?: 'user' | 'assistant' }>
}

function baseSession(overrides: Partial<MockSession> = {}): MockSession {
  return {
    id: 'session-recovery',
    projectPath: 'E:/work/ai/agent/sample-workspace',
    projectName: 'sample-workspace',
    createdAt: '1712400000000',
    updatedAt: '1712400300000',
    lastActivityAt: '1712400300000',
    effectiveModelId: 'claude-sonnet',
    title: 'Refine review workflow',
    status: 'active',
    recentActivity: {
      label: 'Attached',
      summary: 'Ready to continue work.',
      at: '1712400300000',
    },
    transcript: [],
    ...overrides,
  }
}

async function boot(page: Parameters<typeof test>[0]['page'], options?: { selectedProject?: unknown; recentProjects?: unknown; sessions?: MockSession[]; recoverySnapshot?: unknown; credentialStatus?: 'missing' | 'configured' | 'error' }) {
  const sessions = options?.sessions ?? []
  await page.addInitScript((payload) => {
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown; __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = false
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: {
        selectedProject: payload.selectedProject,
        recentProjects: payload.recentProjects,
      },
      credential: {
        status: payload.credentialStatus,
        apiBaseUrl: null,
      },
      session: {
        sessions: payload.sessions,
        recoverySnapshot: payload.recoverySnapshot,
      },
      assistant: {
        assistantTurnResponse: {
          stages: [],
          assistantMessage: 'Ready.',
          commandProposal: null,
          toolSummary: null,
        },
        executeCommandResponse: {
          status: 'completed',
          startedAt: '1712400310000',
          completedAt: '1712400320000',
          output: [],
          changedFiles: [],
        },
      },
    }
  }, {
    selectedProject: options?.selectedProject ?? null,
    recentProjects: options?.recentProjects ?? [],
    sessions,
    recoverySnapshot: options?.recoverySnapshot ?? null,
    credentialStatus: options?.credentialStatus ?? 'configured',
  })

  await page.goto('/')
}

test('shows recovery card with exact resume and chooser actions', async ({ page }) => {
  const session = baseSession()
  const recoverySnapshot = {
    sessionId: session.id,
    projectPath: session.projectPath,
    projectName: session.projectName,
    effectiveModelId: session.effectiveModelId,
    restoredAt: '1712400350000',
    lastActivityAt: session.lastActivityAt,
    recentActivity: session.recentActivity,
  }

  await boot(page, {
    selectedProject: { name: 'sample-workspace', path: session.projectPath, warning: 'none' },
    recentProjects: [{ name: 'sample-workspace', path: session.projectPath, warning: 'none' }],
    sessions: [session],
    recoverySnapshot,
  })

  await page.evaluate((payload) => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => { setMode: (mode: 'project' | 'conversation') => void }
        setState: (next: object) => void
      }
    }).__APP_SHELL_STORE__

    store?.getState()?.setMode('project')
    store?.setState({
      recentProjects: [{ name: payload.projectName, path: payload.projectPath, warning: 'none' }],
      activeProjectPath: payload.projectPath,
      lastRecoverySnapshot: payload.recoverySnapshot,
      recoveryStatus: 'idle',
      activeSession: null,
      activeShellView: 'project-home',
    })
  }, {
    projectName: session.projectName,
    projectPath: session.projectPath,
    recoverySnapshot,
  })

  await expect(page.locator('.workspace__recovery')).toContainText('Recovery available')
  await expect(page.getByRole('button', { name: 'Resume session' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open session chooser' })).toBeVisible()
})

test('shows no workspace entry state with exact copy', async ({ page }) => {
  await boot(page)

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void } } }).__APP_SHELL_STORE__
    store?.getState()?.setMode('project')
  })

  await expect(page.getByRole('heading', { name: 'No workspace selected' })).toBeVisible()
  await expect(page.getByText('Open a local workspace to resume a coding session, attach to recent work, or start a new session.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open workspace' })).toBeVisible()
})

test('shows a desktop model selector and updates the future default model from the toolbar', async ({ page }) => {
  await boot(page, {
    selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
    recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
  })

  await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        setState: (next: object) => void
        getState: () => { setMode: (mode: 'project' | 'conversation') => void }
      }
    }).__APP_SHELL_STORE__

    store?.getState()?.setMode('project')
    store?.setState({
      globalDefaultModel: 'claude-sonnet',
      activeSessionModelOverride: null,
      activeSession: null,
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
    })
  })

  const modelSelect = page.locator('.toolbar__model-select')
  await expect(modelSelect).toBeVisible()
  await expect(modelSelect).toHaveValue('claude-sonnet')
  await modelSelect.selectOption('claude-opus')

  const storeState = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          globalDefaultModel: string
          activeSessionModelOverride: string | null
        }
      }
    }).__APP_SHELL_STORE__

    return store?.getState()
  })

  expect(storeState?.globalDefaultModel).toBe('claude-opus')
  expect(storeState?.activeSessionModelOverride).toBeNull()
})

test('toolbar model selector keeps current session model stable while updating the future default model', async ({ page }) => {
  await boot(page, {
    selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
    recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
  })

  await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        setState: (next: object) => void
        getState: () => { setMode: (mode: 'project' | 'conversation') => void }
      }
    }).__APP_SHELL_STORE__

    store?.getState()?.setMode('project')
    store?.setState({
      globalDefaultModel: 'claude-sonnet',
      activeSessionModelOverride: 'claude-haiku',
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
      activeSession: {
        id: 'session-model-stability',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-haiku',
        title: 'Current session stays on haiku',
        status: 'active',
        recentActivity: { label: 'Attached', summary: 'Ready to continue work.', at: '4' },
        transcript: [],
      },
    })
  })

  const modelSelect = page.locator('.toolbar__model-select')
  await expect(modelSelect).toHaveValue('claude-sonnet')
  await modelSelect.selectOption('claude-opus')

  const storeState = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          globalDefaultModel: string
          activeSessionModelOverride: string | null
          activeSession: { effectiveModelId: string } | null
        }
      }
    }).__APP_SHELL_STORE__

    return store?.getState()
  })

  expect(storeState?.globalDefaultModel).toBe('claude-opus')
  expect(storeState?.activeSessionModelOverride).toBe('claude-haiku')
  expect(storeState?.activeSession?.effectiveModelId).toBe('claude-haiku')
})

test('shows recovery failure with exact chooser and new-session actions', async ({ page }) => {
  await boot(page, {
    selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
    recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
  })

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void; setActiveProject: (project: { name: string; path: string; warning: 'none' | 'non-standard' }) => void; attemptRecovery: () => Promise<void> } } }).__APP_SHELL_STORE__
    const state = store?.getState()
    state?.setMode('project')
    state?.setActiveProject({ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' })
    void state?.attemptRecovery()
  })

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      recoveryStatus: 'error',
      recoveryMessage: 'We couldn’t load local session data. Retry the chooser, or start a new session for this workspace.',
      lastRecoverySnapshot: null,
      activeSession: null,
      mode: 'project',
      activeShellView: 'project-home',
    })
  })

  await expect(page.getByRole('heading', { name: 'Session recovery failed' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open session chooser' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start new session' })).toBeVisible()
})
