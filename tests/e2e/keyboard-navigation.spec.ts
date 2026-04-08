import { test, expect } from '@playwright/test'

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420')
    await page.waitForSelector('.app-shell', { timeout: 10000 })
  })

  test.describe('Sidebar Navigation', () => {
    test('sidebar has no brand area', async ({ page }) => {
      // Verify brand area removed
      const brandArea = page.locator('.sidebar__section--brand')
      await expect(brandArea).toHaveCount(0)
    })

    test('sidebar has no expand/collapse buttons', async ({ page }) => {
      // Verify no toggle buttons
      const toggleButtons = page.locator('.sidebar__section-toggle')
      await expect(toggleButtons).toHaveCount(0)
    })

    test('sidebar shows project picker at top', async ({ page }) => {
      // Verify project picker in sidebar
      const projectPicker = page.locator('.sidebar__project-picker')
      await expect(projectPicker).toBeVisible()

      const projectButton = page.locator('.sidebar__project-button')
      await expect(projectButton).toBeVisible()
      await expect(projectButton).toContainText('Open workspace')
    })

    test('sidebar always shows project and session lists', async ({ page }) => {
      // Verify lists always visible
      const sections = page.locator('.sidebar__section')
      await expect(sections).toHaveCount(2) // Workspaces + Recent sessions
    })

    test('topbar has no project breadcrumb', async ({ page }) => {
      // Verify topbar no breadcrumb
      const breadcrumb = page.locator('.toolbar__breadcrumb')
      await expect(breadcrumb).toHaveCount(0)
    })

    test('topbar only has model selector and settings', async ({ page }) => {
      // Verify topbar simplified
      const modelSelect = page.locator('.toolbar__model-select')
      const settingsButton = page.locator('.toolbar__icon-button')

      await expect(modelSelect).toBeVisible()
      await expect(settingsButton).toBeVisible()
    })
  })

  test.describe('Global Keybindings', () => {
    test('ctrl+t creates new session', async ({ page }) => {
      // Record initial session count
      const initialSessions = await page.locator('.sidebar__list .sidebar__item').count()

      // Press ctrl+t
      await page.keyboard.press('Control+t')

      // Wait for new session
      await page.waitForTimeout(500)

      // Verify session count increased
      const newSessions = await page.locator('.sidebar__list .sidebar__item').count()
      expect(newSessions).toBeGreaterThan(initialSessions)
    })

    test('ctrl+e opens settings panel', async ({ page }) => {
      // Ensure right panel initially closed
      const rightPanel = page.locator('.app-shell__drawer--open')
      await expect(rightPanel).toHaveCount(0)

      // Press ctrl+e
      await page.keyboard.press('Control+e')

      // Verify settings panel opened
      await expect(rightPanel).toHaveCount(1)

      // Verify settings content visible
      const settingsHeading = page.locator('.right-panel__heading').first()
      await expect(settingsHeading).toBeVisible()
    })

    test('keybindings can be disabled in settings', async ({ page }) => {
      // Open settings
      await page.keyboard.press('Control+e')

      // Find keybindings toggle
      const keybindingsItem = page.locator('.right-panel__settings-item', { hasText: 'Enable global keyboard shortcuts' })
      await expect(keybindingsItem).toBeVisible()

      // Disable keybindings
      await keybindingsItem.click()
      await page.waitForTimeout(200)

      // Close settings panel
      const closeButton = page.locator('.right-panel__close')
      if (await closeButton.isVisible()) {
        await closeButton.click()
      } else {
        await page.keyboard.press('Escape')
      }

      // Verify ctrl+e no longer works
      await page.keyboard.press('Control+e')
      await page.waitForTimeout(300)
      const rightPanel = page.locator('.app-shell__drawer--open')
      await expect(rightPanel).toHaveCount(0)
    })
  })

  test.describe('Input History Navigation', () => {
    test('up arrow loads previous input', async ({ page }) => {
      // Find input
      const input = page.locator('.composer__input')
      await expect(input).toBeVisible()

      // Input and submit first message
      await input.fill('First message')
      await page.keyboard.press('Control+Enter')
      await page.waitForTimeout(500)

      // Input and submit second message
      await input.fill('Second message')
      await page.keyboard.press('Control+Enter')
      await page.waitForTimeout(500)

      // Clear input
      await input.fill('')

      // Press ↑
      await input.focus()
      await page.keyboard.press('ArrowUp')

      // Verify loaded previous message
      await expect(input).toHaveValue('Second message')

      // Press ↑ again
      await page.keyboard.press('ArrowUp')

      // Verify loaded earlier message
      await expect(input).toHaveValue('First message')
    })

    test('down arrow navigates forward in history', async ({ page }) => {
      const input = page.locator('.composer__input')

      // Input and submit two messages
      await input.fill('Message 1')
      await page.keyboard.press('Control+Enter')
      await page.waitForTimeout(500)

      await input.fill('Message 2')
      await page.keyboard.press('Control+Enter')
      await page.waitForTimeout(500)

      // Clear and navigate to history
      await input.fill('')
      await input.focus()
      await page.keyboard.press('ArrowUp') // Message 2
      await page.keyboard.press('ArrowUp') // Message 1

      // Press ↓ to go forward
      await page.keyboard.press('ArrowDown')
      await expect(input).toHaveValue('Message 2')

      // Press ↓ again to return to blank
      await page.keyboard.press('ArrowDown')
      await expect(input).toHaveValue('')
    })

    test('history persists across page reload', async ({ page }) => {
      const input = page.locator('.composer__input')

      // Input and submit message
      await input.fill('Persistent message')
      await page.keyboard.press('Control+Enter')
      await page.waitForTimeout(500)

      // Reload page
      await page.reload()
      await page.waitForSelector('.app-shell', { timeout: 10000 })

      // Verify history still exists
      const inputAfterReload = page.locator('.composer__input')
      await inputAfterReload.focus()
      await page.keyboard.press('ArrowUp')

      await expect(inputAfterReload).toHaveValue('Persistent message')
    })
  })
})
