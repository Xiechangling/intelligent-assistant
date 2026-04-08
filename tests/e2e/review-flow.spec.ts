import { expect, test } from 'playwright/test'

test('shows review-ready tray with file rail and diff preview', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: {
        selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
        recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
      },
      credential: { status: 'configured', apiBaseUrl: null },
      session: { recoverySnapshot: null, sessions: [] },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'Review will be ready after execution.',
          commandProposal: {
            id: 'proposal-review',
            summary: 'Run local build and open review artifacts.',
            command: 'npm run build',
            projectPath: 'E:/work/ai/agent/sample-workspace',
            workingDirectory: 'E:/work/ai/agent/sample-workspace',
            requiresApproval: true,
          },
          toolSummary: null,
        },
        executeCommandResponse: {
          status: 'completed',
          startedAt: '1712400410000',
          completedAt: '1712400420000',
          output: [
            { stream: 'system', text: 'Execution started for workspace E:/work/ai/agent/sample-workspace in working directory E:/work/ai/agent/sample-workspace.', createdAt: '1712400411000' },
            { stream: 'stdout', text: 'Build completed.', createdAt: '1712400411500' },
            { stream: 'stderr', text: 'warning: sample stderr line', createdAt: '1712400411700' },
            { stream: 'system', text: 'Execution finished successfully.', createdAt: '1712400412000' },
          ],
          changedFiles: [
            { path: 'src/app/layout/BottomPanel.tsx', summary: 'Refine review tray', diff: '+ Open review\n+ No changed files are available yet.' },
            { path: 'src/app/layout/CenterWorkspace.tsx', summary: 'Inline review summary', diff: '+ Review ready' },
          ],
        },
      },
    }
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void; setActiveProject: (project: { name: string; path: string; warning: 'none' | 'non-standard' }) => void; createProjectSession: () => Promise<void> } } }).__APP_SHELL_STORE__
    const state = store?.getState()
    state?.setMode('project')
    state?.setActiveProject({ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' })
    return state?.createProjectSession()
  })

  await page.locator('#assistant-prompt').fill('Run the reviewable build flow.')
  await page.getByLabel('Send instruction').click()
  await page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Approve and run' }).click()

  await expect(page.locator('.bottom-panel__status')).toHaveText('Review ready')
  await expect(page.locator('.workspace__inline-surface--review')).toContainText('Review ready')
  await expect(page.locator('.bottom-panel')).toHaveAttribute('data-collapsed', 'false')
  await expect(page.locator('.bottom-panel__review-file.bottom-panel__review-file--active')).toContainText('src/app/layout/BottomPanel.tsx')
  await expect(page.locator('.bottom-panel__review-diff pre')).toContainText('Open review')

  await page.locator('.bottom-panel__review-file').filter({ hasText: 'src/app/layout/CenterWorkspace.tsx' }).click()
  await expect(page.locator('.bottom-panel__review-file.bottom-panel__review-file--active')).toContainText('src/app/layout/CenterWorkspace.tsx')
  await expect(page.locator('.bottom-panel__review-diff pre')).toContainText('Review ready')

  await page.getByRole('button', { name: 'Output' }).click()
  await expect(page.locator('.bottom-panel__log-line--system').first()).toContainText('Approval accepted. Starting execution...')
  await expect(page.locator('.bottom-panel__log-line--stdout')).toContainText('Build completed.')
  await expect(page.locator('.bottom-panel__log-line--stderr')).toContainText('warning: sample stderr line')
})

test('keeps manual review selection until a new execution replaces the review set', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {}
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      mode: 'project',
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
      activeSession: {
        id: 'session-review',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'Review session',
        status: 'active',
        recentActivity: { label: 'Review ready', summary: 'Review ready: 2 changed files ready for inspection.', at: '4' },
        transcript: [],
      },
      executionRecord: {
        id: 'exec-1',
        proposalId: 'proposal-1',
        summary: 'First execution',
        command: 'npm run build',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'ready',
        reviewUnavailableMessage: null,
        output: [],
        changedFiles: [
          { id: 'file-1', path: 'src/first.ts', summary: 'First file', diff: '+ first diff' },
          { id: 'file-2', path: 'src/second.ts', summary: 'Second file', diff: '+ second diff' },
        ],
        startedAt: '1',
        completedAt: '2',
      },
      selectedReviewFileId: 'file-1',
      bottomPanelExpanded: true,
      bottomPanelTab: 'review',
      rightPanelOpen: false,
    })
  })

  await page.locator('.bottom-panel__review-file').filter({ hasText: 'src/second.ts' }).click()
  await expect(page.locator('.bottom-panel__review-file.bottom-panel__review-file--active')).toContainText('src/second.ts')
  await expect(page.locator('.bottom-panel__review-diff pre')).toContainText('second diff')

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      executionRecord: {
        id: 'exec-1',
        proposalId: 'proposal-1',
        summary: 'First execution',
        command: 'npm run build',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'ready',
        reviewUnavailableMessage: null,
        output: [],
        changedFiles: [
          { id: 'file-1', path: 'src/first.ts', summary: 'First file', diff: '+ first diff' },
          { id: 'file-2', path: 'src/second.ts', summary: 'Second file', diff: '+ second diff' },
        ],
        startedAt: '1',
        completedAt: '2',
      },
    })
  })

  await expect(page.locator('.bottom-panel__review-file.bottom-panel__review-file--active')).toContainText('src/second.ts')

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      executionRecord: {
        id: 'exec-2',
        proposalId: 'proposal-2',
        summary: 'Replacement execution',
        command: 'npm run test',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'ready',
        reviewUnavailableMessage: null,
        output: [],
        changedFiles: [
          { id: 'file-3', path: 'src/new.ts', summary: 'Replacement file', diff: '+ replacement diff' },
        ],
        startedAt: '5',
        completedAt: '6',
      },
      selectedReviewFileId: 'file-3',
    })
  })

  await expect(page.locator('.bottom-panel__review-file.bottom-panel__review-file--active')).toContainText('src/new.ts')
  await expect(page.locator('.bottom-panel__review-diff pre')).toContainText('replacement diff')
})

test('shows degraded review messaging when execution succeeds without review artifacts', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: {
        selectedProject: { name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' },
        recentProjects: [{ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' }],
      },
      credential: { status: 'configured', apiBaseUrl: null },
      session: { recoverySnapshot: null, sessions: [] },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'Execution can still complete without review artifacts.',
          commandProposal: {
            id: 'proposal-review-degraded',
            summary: 'Run build in a workspace without git review support.',
            command: 'npm run build',
            projectPath: 'E:/work/ai/agent/sample-workspace',
            workingDirectory: 'E:/work/ai/agent/sample-workspace',
            requiresApproval: true,
          },
          toolSummary: null,
        },
        executeCommandResponse: {
          status: 'completed',
          startedAt: '1712400510000',
          completedAt: '1712400520000',
          output: [
            { stream: 'system', text: 'Execution started for workspace E:/work/ai/agent/sample-workspace in working directory E:/work/ai/agent/sample-workspace.', createdAt: '1712400511000' },
            { stream: 'stdout', text: 'Build completed.', createdAt: '1712400511500' },
            { stream: 'system', text: 'Review unavailable after execution: current folder is not a git repository', createdAt: '1712400511700' },
            { stream: 'system', text: 'Execution finished successfully.', createdAt: '1712400512000' },
          ],
          changedFiles: [],
        },
      },
    }
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void; setActiveProject: (project: { name: string; path: string; warning: 'none' | 'non-standard' }) => void; createProjectSession: () => Promise<void> } } }).__APP_SHELL_STORE__
    const state = store?.getState()
    state?.setMode('project')
    state?.setActiveProject({ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' })
    return state?.createProjectSession()
  })

  await page.locator('#assistant-prompt').fill('Run the degraded review flow.')
  await page.getByLabel('Send instruction').click()
  await page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Approve and run' }).click()

  await expect(page.locator('.bottom-panel__status')).toHaveText('Review unavailable')
  await expect(page.locator('.bottom-panel__degraded-review')).toContainText('Review unavailable')
  await expect(page.locator('.bottom-panel__degraded-review')).toContainText('current folder is not a git repository')
  await expect(page.locator('.bottom-panel__status')).toHaveText('Review unavailable')
  await expect(page.locator('.workspace__inline-surface--status')).toContainText('Review unavailable after execution: current folder is not a git repository')
  await page.locator('.bottom-panel__tab').filter({ hasText: 'Review' }).click()
  await expect(page.locator('.bottom-panel__review-diff')).toContainText('Execution output is still available in the Output tab for this session action.')
  await expect(page.locator('.bottom-panel__review-files')).toContainText('Review artifacts are unavailable for this execution.')
})

test('right panel distinguishes completed execution states for empty and unavailable review results', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {}
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      mode: 'project',
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
      activeSession: {
        id: 'session-right-panel-review-states',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'Right panel review states',
        status: 'active',
        recentActivity: { label: 'Attached', summary: 'Execution finished without changed files.', at: '4' },
        transcript: [],
      },
      executionRecord: {
        id: 'exec-right-panel-empty',
        proposalId: 'proposal-right-panel-empty',
        summary: 'Execution with no changes',
        command: 'npm run lint',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'empty',
        reviewUnavailableMessage: null,
        output: [{ id: 'out-1', stream: 'system', text: 'Execution finished successfully.', createdAt: '1' }],
        changedFiles: [],
        startedAt: '1',
        completedAt: '2',
      },
      rightPanelOpen: true,
      rightPanelView: 'context',
    })
  })

  await expect(page.locator('.right-panel__row').filter({ hasText: 'Status' })).toContainText('Execution complete')

  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      executionRecord: {
        id: 'exec-right-panel-unavailable',
        proposalId: 'proposal-right-panel-unavailable',
        summary: 'Execution without review artifacts',
        command: 'npm run build',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'unavailable',
        reviewUnavailableMessage: 'Review unavailable after execution: current folder is not a git repository',
        output: [{ id: 'out-2', stream: 'system', text: 'Review unavailable after execution: current folder is not a git repository', createdAt: '2' }],
        changedFiles: [],
        startedAt: '1',
        completedAt: '2',
      },
    })
  })

  await expect(page.locator('.right-panel__row').filter({ hasText: 'Status' })).toContainText('Review unavailable')
})

test('distinguishes no changed files from degraded review state', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {}
  })

  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
    store?.setState({
      mode: 'project',
      activeProjectPath: 'E:/work/ai/agent/sample-workspace',
      activeSession: {
        id: 'session-empty-review',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'No changed files session',
        status: 'active',
        recentActivity: { label: 'Attached', summary: 'Execution finished without changed files.', at: '4' },
        transcript: [],
      },
      executionRecord: {
        id: 'exec-empty',
        proposalId: 'proposal-empty',
        summary: 'Execution with no changes',
        command: 'npm run lint',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        workingDirectory: 'E:/work/ai/agent/sample-workspace',
        status: 'completed',
        reviewState: 'empty',
        reviewUnavailableMessage: null,
        output: [{ id: 'out-1', stream: 'system', text: 'Execution finished successfully.', createdAt: '1' }],
        changedFiles: [],
        startedAt: '1',
        completedAt: '2',
      },
      bottomPanelExpanded: true,
      bottomPanelTab: 'review',
      rightPanelOpen: false,
    })
  })

  await expect(page.locator('.workspace__inline-surface--status')).toContainText('Execution finished without changed files.')
  await expect(page.locator('.bottom-panel__review-files')).toContainText('No changed files are available yet.')
  await expect(page.locator('.bottom-panel__review-diff')).toContainText('No changed files')
  await expect(page.locator('.bottom-panel__review-diff')).toContainText('No changed files are available yet.')
  await expect(page.locator('.bottom-panel__review-diff')).not.toContainText('Review unavailable')
})
