import { expect, test } from 'playwright/test'

async function openProjectApprovalFlow(page: import('playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    const store = (window as Window & { __APP_SHELL_STORE__?: { getState: () => { setMode: (mode: 'project' | 'conversation') => void; setActiveProject: (project: { name: string; path: string; warning: 'none' | 'non-standard' }) => void; createProjectSession: () => Promise<void> } } }).__APP_SHELL_STORE__
    const state = store?.getState()
    state?.setMode('project')
    state?.setActiveProject({ name: 'sample-workspace', path: 'E:/work/ai/agent/sample-workspace', warning: 'none' })
    return state?.createProjectSession()
  })

  await page.locator('#assistant-prompt').fill('Run the local build and summarize the result.')
  await page.getByLabel('Send instruction').click()
}

test('auto-focuses approval flow with exact action labels and context fields', async ({ page }) => {
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
        sessions: [],
      },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'I can run a local build.',
          commandProposal: {
            id: 'proposal-approval',
            summary: 'Run local build for the selected workspace.',
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
          output: [{ stream: 'system', text: 'Build started.', createdAt: '1712400411000' }],
          changedFiles: [],
        },
      },
    }
  })

  await openProjectApprovalFlow(page)

  await expect(page.locator('.toolbar__status-chip')).toHaveText('Awaiting approval')
  await expect(page.getByRole('main').getByRole('button', { name: 'Approve and run' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('button', { name: 'Reject command' })).toBeVisible()
  await expect(page.getByText('Workspace path', { exact: true })).toBeVisible()
  await expect(page.getByText('Working directory', { exact: true })).toBeVisible()
  await expect(page.getByText('Impact', { exact: true })).toBeVisible()
  await expect(page.locator('.bottom-panel__approval-field--command code')).toHaveText('npm run build')
  await expect(page.locator('.bottom-panel')).toHaveAttribute('data-collapsed', 'false')

  const transcriptText = await page.locator('.conversation-transcript').innerText()
  expect(transcriptText).toContain('AWAITING APPROVAL')
  expect(transcriptText).toContain('Approval required: Run local build for the selected workspace.')
})

test('blocks mode switching while approval is pending so the proposal stays actionable', async ({ page }) => {
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
        sessions: [],
      },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'I can run a local build.',
          commandProposal: {
            id: 'proposal-switch-block',
            summary: 'Run local build for the selected workspace.',
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
          output: [{ stream: 'system', text: 'Build started.', createdAt: '1712400411000' }],
          changedFiles: [],
        },
      },
    }
  })

  await openProjectApprovalFlow(page)
  await page.getByRole('button', { name: 'Conversation' }).click()

  const approvalState = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: { getState: () => { mode: 'project' | 'conversation'; pendingProposal: { id: string } | null; executionRecord: { status: string } | null } }
    }).__APP_SHELL_STORE__
    const state = store?.getState()
    return {
      mode: state?.mode,
      pendingProposalId: state?.pendingProposal?.id ?? null,
      executionStatus: state?.executionRecord?.status ?? null,
    }
  })

  expect(approvalState).toEqual({
    mode: 'project',
    pendingProposalId: 'proposal-switch-block',
    executionStatus: 'awaiting-approval',
  })
  await expect(page.locator('.toolbar__status-chip')).toHaveText('Awaiting approval')
  await expect(page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Approve and run' })).toBeVisible()
})

test('rejecting a proposal keeps the session active and records a rejected timeline state', async ({ page }) => {
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
        sessions: [],
      },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'I can run a local build.',
          commandProposal: {
            id: 'proposal-reject',
            summary: 'Run local build for the selected workspace.',
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
          output: [{ stream: 'system', text: 'Build started.', createdAt: '1712400411000' }],
          changedFiles: [],
        },
      },
    }
  })

  await openProjectApprovalFlow(page)
  await page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Reject command' }).click()

  await expect(page.locator('.bottom-panel__status')).toHaveText('Ready')
  await expect(page.locator('.workspace__session-header-card')).toContainText('Rejected')
  await expect(page.locator('.conversation-transcript')).toContainText('Rejected')
  await expect(page.locator('.conversation-transcript')).toContainText('Command rejected before execution.')
  await expect(page.locator('.conversation-transcript')).toContainText('Command rejected. No execution started.')
  await expect(page.locator('#assistant-prompt')).toBeEnabled()
})

test('approving a proposal records approval before execution result states', async ({ page }) => {
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
        sessions: [],
      },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'I can run a local build.',
          commandProposal: {
            id: 'proposal-approve',
            summary: 'Run local build for the selected workspace.',
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
          output: [{ stream: 'system', text: 'Build completed successfully.', createdAt: '1712400411000' }],
          changedFiles: [],
        },
      },
    }
  })

  await openProjectApprovalFlow(page)
  await page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Approve and run' }).click()

  await expect(page.locator('.bottom-panel__status')).toHaveText('Execution complete')
  await expect(page.locator('.workspace__session-header-card')).toContainText('Build completed successfully.')
  await expect(page.locator('.right-panel__row').filter({ hasText: 'Status' })).toContainText('Execution complete')
  await expect(page.locator('.bottom-panel__status')).toHaveText('Execution complete')
  const transcriptText = await page.locator('.conversation-transcript').innerText()
  expect(transcriptText.indexOf('Approval required: Run local build for the selected workspace.')).toBeGreaterThan(-1)
  expect(transcriptText.indexOf('Command approved for execution.')).toBeGreaterThan(transcriptText.indexOf('Approval required: Run local build for the selected workspace.'))
  expect(transcriptText.indexOf('Execution started.')).toBeGreaterThan(transcriptText.indexOf('Command approved for execution.'))
  expect(transcriptText.indexOf('Execution completed successfully.')).toBeGreaterThan(transcriptText.indexOf('Execution started.'))
})

test('failed execution keeps the session attached to the same context with visible failure state', async ({ page }) => {
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
        sessions: [],
      },
      assistant: {
        assistantTurnResponse: {
          stages: [{ label: 'Working', body: 'Preparing command approval.' }],
          assistantMessage: 'I can run a command that may fail.',
          commandProposal: {
            id: 'proposal-fail',
            summary: 'Run a command that exits with an error.',
            command: 'npm run missing-script',
            projectPath: 'E:/work/ai/agent/sample-workspace',
            workingDirectory: 'E:/work/ai/agent/sample-workspace',
            requiresApproval: true,
          },
          toolSummary: null,
        },
        executeCommandResponse: {
          status: 'failed',
          startedAt: '1712400610000',
          completedAt: '1712400620000',
          output: [
            { stream: 'system', text: 'Execution started for workspace E:/work/ai/agent/sample-workspace in working directory E:/work/ai/agent/sample-workspace.', createdAt: '1712400611000' },
            { stream: 'stderr', text: 'npm ERR! Missing script: "missing-script"', createdAt: '1712400611500' },
            { stream: 'system', text: 'Execution failed before completion.', createdAt: '1712400612000' },
          ],
          changedFiles: [],
        },
      },
    }
  })

  await openProjectApprovalFlow(page)
  await page.locator('.bottom-panel__approval-actions').getByRole('button', { name: 'Approve and run' }).click()

  await expect(page.locator('.bottom-panel__status')).toHaveText('Failed')
  await expect(page.locator('.workspace__session-header-card')).toContainText('Execution failed before completion.')
  await expect(page.locator('.conversation-transcript')).toContainText('Execution failed.')
  await expect(page.locator('.bottom-panel__status')).toHaveText('Failed')
  await expect(page.locator('.bottom-panel__log-line--stderr')).toContainText('npm ERR! Missing script: "missing-script"')
  await expect(page.locator('.right-panel__row').filter({ hasText: 'Status' })).toContainText('Failed')
  await expect(page.locator('#assistant-prompt')).toBeEnabled()
})
