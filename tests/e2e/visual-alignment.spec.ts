import { expect, test } from '@playwright/test'
import { AppShellPage } from './page-objects/AppShellPage'

test.describe('Visual Alignment - Phase 10', () => {
  let appShell: AppShellPage

  test.beforeEach(async ({ page }) => {
    appShell = new AppShellPage(page)

    // Mock initialization
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_SKIP_RECOVERY__ = true
      (window as any).__PLAYWRIGHT_MOCKS__ = {
        project: { selectedProject: null, recentProjects: [] },
        credential: { status: 'configured', apiBaseUrl: null },
        session: { sessions: [] }
      }
    })

    await appShell.goto()
  })

  test('VISUAL-01: Light theme has near-white backgrounds', async () => {
    await appShell.switchTheme('light')

    const theme = await appShell.getTheme()
    expect(theme).toBe('light')

    // Check background color is near white
    const bgColor = await appShell.getBackgroundColor(appShell.appShell)
    // RGB values should be close to (255, 255, 255)
    expect(bgColor).toMatch(/rgb\(25[0-5], 25[0-5], 25[0-5]\)/)
  })

  test('VISUAL-02: Icons use 2px stroke width', async () => {
    // Check icon strokeWidth attributes
    const icons = await appShell.page.locator('svg[stroke-width]').all()

    for (const icon of icons) {
      const strokeWidth = await icon.getAttribute('stroke-width')
      expect(strokeWidth).toBe('2')
    }

    // At least some icons should exist
    expect(icons.length).toBeGreaterThan(0)
  })

  test('VISUAL-03: Cards use 24px border-radius', async () => {
    // Check Composer border-radius
    const composerRadius = await appShell.getBorderRadius(appShell.composer)
    expect(composerRadius).toBe('24px')

    // Check GlobalSearch border-radius (if visible)
    await appShell.page.keyboard.press('Control+f')
    await appShell.globalSearch.waitFor({ state: 'visible' })
    const searchRadius = await appShell.getBorderRadius(appShell.globalSearch)
    expect(searchRadius).toBe('24px')
  })

  test('VISUAL-04: Empty state shows panda mascot', async () => {
    // Ensure in empty state
    await appShell.emptyState.waitFor({ state: 'visible' })

    // Check panda mascot is visible
    await expect(appShell.pandaMascot).toBeVisible()

    // Check mascot image
    const mascotImg = appShell.pandaMascot.locator('img')
    await expect(mascotImg).toHaveAttribute('src', '/panda-mascot.svg')
    await expect(mascotImg).toHaveAttribute('alt', 'Panda mascot')

    // Check title and description
    const title = appShell.page.locator('[data-testid="empty-state-title"]')
    const description = appShell.page.locator('[data-testid="empty-state-description"]')
    await expect(title).toBeVisible()
    await expect(description).toBeVisible()
  })

  test('VISUAL-05: Soft dividers in light theme', async () => {
    await appShell.switchTheme('light')

    // Check divider color (should be soft transparent black)
    const sidebar = appShell.leftSidebar
    const borderColor = await appShell.getComputedStyle(sidebar, 'border-right-color')

    // Should be rgba(0, 0, 0, 0.06-0.12) range
    expect(borderColor).toMatch(/rgba?\(0,\s*0,\s*0/)
  })

  test('VISUAL-06: Transitions use 200ms ease-out', async () => {
    // Check Composer transition
    const composerTransition = await appShell.getTransition(appShell.composer)
    expect(composerTransition).toContain('200ms')
    expect(composerTransition).toContain('ease-out')

    // Check button transition
    const button = appShell.page.locator('button').first()
    const buttonTransition = await appShell.getTransition(button)
    expect(buttonTransition).toContain('200ms')
    expect(buttonTransition).toContain('ease-out')
  })

  test('Theme switching preserves visual alignment', async () => {
    // Switch to light theme
    await appShell.switchTheme('light')
    let theme = await appShell.getTheme()
    expect(theme).toBe('light')

    // Switch to dark theme
    await appShell.switchTheme('dark')
    theme = await appShell.getTheme()
    expect(theme).toBe('dark')

    // Check border-radius remains correct after theme switch
    const composerRadius = await appShell.getBorderRadius(appShell.composer)
    expect(composerRadius).toBe('24px')
  })
})
