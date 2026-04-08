import { expect, test } from 'playwright/test'

const statuses = ['Ready', 'Connecting', 'Connected', 'Attached', 'Working', 'Awaiting approval', 'Review ready', 'Failed'] as const

test('shows canonical status labels in session header as exact copy', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __PLAYWRIGHT_SKIP_RECOVERY__?: boolean }).__PLAYWRIGHT_SKIP_RECOVERY__ = true
    ;(window as Window & { __PLAYWRIGHT_MOCKS__?: unknown }).__PLAYWRIGHT_MOCKS__ = {
      project: { selectedProject: null, recentProjects: [] },
      credential: { status: 'missing', apiBaseUrl: null },
      session: { recoverySnapshot: null, sessions: [] },
      assistant: {
        assistantTurnResponse: { stages: [], assistantMessage: 'Ready.', commandProposal: null, toolSummary: null },
        executeCommandResponse: { status: 'completed', startedAt: '1', completedAt: '2', output: [], changedFiles: [] },
      },
    }
  })

  await page.goto('/')

  for (const status of statuses) {
    await page.evaluate((nextStatus) => {
      const store = (window as Window & { __APP_SHELL_STORE__?: { setState: (next: object) => void } }).__APP_SHELL_STORE__
      const baseSession = {
        id: 'session-status',
        projectPath: 'E:/work/ai/agent/sample-workspace',
        projectName: 'sample-workspace',
        createdAt: '1',
        updatedAt: '2',
        lastActivityAt: '3',
        effectiveModelId: 'claude-sonnet',
        title: 'Status fixture',
        status: nextStatus === 'Failed' ? 'needs-attention' : 'active',
        recentActivity: { label: nextStatus, summary: `${nextStatus} summary`, at: '4' },
        transcript: [],
      }

      store?.setState({
        mode: 'project',
        activeProjectPath: ['Connected', 'Attached', 'Working', 'Awaiting approval', 'Review ready', 'Failed'].includes(nextStatus)
          ? 'E:/work/ai/agent/sample-workspace'
          : null,
        credentialStatus: ['Connected', 'Attached', 'Working', 'Awaiting approval', 'Review ready', 'Failed'].includes(nextStatus)
          ? 'configured'
          : 'missing',
        activeSession: ['Attached', 'Working', 'Awaiting approval', 'Review ready', 'Failed'].includes(nextStatus) ? baseSession : null,
        recoveryStatus: nextStatus === 'Connecting' ? 'recovering' : 'idle',
        sessionHistoryStatus: nextStatus === 'Connecting' ? 'loading' : 'ready',
        assistantStatus: nextStatus === 'Working' ? 'streaming' : 'idle',
        assistantError: nextStatus === 'Failed' ? 'Execution failed before completion.' : null,
        pendingProposal: nextStatus === 'Awaiting approval' ? { id: 'proposal-1', summary: 'Approval request', command: 'npm test', projectPath: 'E:/work/ai/agent/sample-workspace', workingDirectory: 'E:/work/ai/agent/sample-workspace', requiresApproval: true } : null,
        executionRecord: nextStatus === 'Review ready'
          ? { id: 'exec-1', proposalId: 'proposal-1', summary: 'Run review', command: 'npm test', projectPath: 'E:/work/ai/agent/sample-workspace', workingDirectory: 'E:/work/ai/agent/sample-workspace', status: 'completed', reviewState: 'ready', reviewUnavailableMessage: null, output: [], changedFiles: [{ id: 'file-1', path: 'src/app/layout/BottomPanel.tsx', summary: 'Review file', diff: '+ diff' }], startedAt: '1', completedAt: '2' }
          : nextStatus === 'Working'
            ? { id: 'exec-2', proposalId: 'proposal-2', summary: 'Run work', command: 'npm run build', projectPath: 'E:/work/ai/agent/sample-workspace', workingDirectory: 'E:/work/ai/agent/sample-workspace', status: 'running', output: [], changedFiles: [], startedAt: '1', completedAt: null }
            : nextStatus === 'Failed'
                ? { id: 'exec-3', proposalId: 'proposal-3', summary: 'Run fail', command: 'npm run build', projectPath: 'E:/work/ai/agent/sample-workspace', workingDirectory: 'E:/work/ai/agent/sample-workspace', status: 'failed', output: [], changedFiles: [], startedAt: '1', completedAt: '2' }
                : null,
        currentStageLabel: null,
      })
    }, status)

    const expectedToolbarStatus = status === 'Failed' ? 'Needs attention' : status
    // Status chip only appears when there's an active session
    const hasActiveSession = ['Attached', 'Working', 'Awaiting approval', 'Review ready', 'Failed'].includes(status)
    if (hasActiveSession) {
      await expect(page.locator('.workspace__session-header .workspace__status-pill')).toHaveText(expectedToolbarStatus)
    } else {
      // For statuses without active session (Ready, Connecting, Connected), no status chip is displayed
      await expect(page.locator('.workspace__session-header')).not.toBeVisible()
    }
  }
})
