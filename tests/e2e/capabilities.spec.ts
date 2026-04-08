import { expect, test } from 'playwright/test'

test('shows product-facing workflow capability toggles next to the presets and connection settings', async ({ page }) => {
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
      rightPanelOpen: true,
      rightPanelView: 'settings',
      skillToggles: [
        {
          id: 'command-approval',
          label: 'Command approval',
          description: 'Ask before impactful commands run.',
          enabled: true,
        },
        {
          id: 'change-review',
          label: 'Change review',
          description: 'Keep changed files ready in the review tray.',
          enabled: true,
        },
        {
          id: 'workspace-context',
          label: 'Workspace context',
          description: 'Keep project context available during work.',
          enabled: false,
        },
      ],
    })
  })

  await expect(page.locator('.right-panel__section').filter({ hasText: 'Connection settings' })).toBeVisible()
  await expect(page.locator('.right-panel__section').filter({ hasText: 'Presets' })).toBeVisible()
  const capabilitySection = page.locator('.right-panel__section').filter({ hasText: 'Workflow capabilities' })
  await expect(capabilitySection).toBeVisible()
  await expect(capabilitySection).toContainText('Command approval')
  await expect(capabilitySection).toContainText('Change review')
  await expect(capabilitySection).toContainText('Workspace context')
  await expect(capabilitySection).toContainText('Ask before impactful commands run.')
  await expect(capabilitySection).toContainText('On')
  await expect(capabilitySection).toContainText('Off')
  await expect(page.locator('.workspace')).not.toContainText('Workflow capabilities')
})

test('toggles capabilities on and off with clear enabled state in the settings surface', async ({ page }) => {
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
      rightPanelOpen: true,
      rightPanelView: 'settings',
      skillToggles: [
        {
          id: 'command-approval',
          label: 'Command approval',
          description: 'Ask before impactful commands run.',
          enabled: true,
        },
      ],
    })
  })

  const toggle = page.getByRole('button', { name: /Command approval/ })
  await expect(page.locator('.right-panel__section').filter({ hasText: 'Workflow capabilities' })).toContainText('Ask before impactful commands run.')
  await expect(toggle).toContainText('Enabled')
  await expect(toggle).toContainText('On')

  await toggle.click()
  await expect(toggle).toContainText('Disabled')
  await expect(toggle).toContainText('Off')

  const state = await page.evaluate(() => {
    const store = (window as Window & {
      __APP_SHELL_STORE__?: {
        getState: () => {
          skillToggles: Array<{ id: string; enabled: boolean }>
        }
      }
    }).__APP_SHELL_STORE__

    return store?.getState().skillToggles
  })

  expect(state?.find((entry) => entry.id === 'command-approval')?.enabled).toBe(false)
})
