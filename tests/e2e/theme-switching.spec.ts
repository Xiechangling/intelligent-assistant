import { test, expect } from '@playwright/test'

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.app-shell')
  })

  test('default theme is dark', async ({ page }) => {
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')
  })

  test('can switch to light theme via settings', async ({ page }) => {
    // Open settings
    await page.click('button[title="Settings"]')
    await page.waitForSelector('.right-panel__drawer-header')

    // Click Light theme button
    await page.click('.right-panel__theme-option:has-text("Light")')

    // Verify theme applied
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('light')

    // Verify active state
    const lightButton = page.locator('.right-panel__theme-option:has-text("Light")')
    await expect(lightButton).toHaveClass(/right-panel__theme-option--active/)
  })

  test('can switch to dark theme via settings', async ({ page }) => {
    // First switch to light
    await page.click('button[title="Settings"]')
    await page.click('.right-panel__theme-option:has-text("Light")')

    // Then switch back to dark
    await page.click('.right-panel__theme-option:has-text("Dark")')

    // Verify theme applied
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('dark')

    // Verify active state
    const darkButton = page.locator('.right-panel__theme-option:has-text("Dark")')
    await expect(darkButton).toHaveClass(/right-panel__theme-option--active/)
  })

  test('can switch to auto theme via settings', async ({ page }) => {
    // Open settings
    await page.click('button[title="Settings"]')

    // Click Auto theme button
    await page.click('.right-panel__theme-option:has-text("Auto")')

    // Verify auto mode selected (theme depends on system)
    const autoButton = page.locator('.right-panel__theme-option:has-text("Auto")')
    await expect(autoButton).toHaveClass(/right-panel__theme-option--active/)

    // Verify theme is either light or dark (follows system)
    const theme = await page.getAttribute('html', 'data-theme')
    expect(['light', 'dark']).toContain(theme)
  })

  test('theme preference persists across page reload', async ({ page }) => {
    // Switch to light theme
    await page.click('button[title="Settings"]')
    await page.click('.right-panel__theme-option:has-text("Light")')

    // Reload page
    await page.reload()
    await page.waitForSelector('.app-shell')

    // Verify theme persisted
    const theme = await page.getAttribute('html', 'data-theme')
    expect(theme).toBe('light')
  })

  test('theme changes have smooth transitions', async ({ page }) => {
    // Get body element
    const body = page.locator('body')

    // Check transition property exists
    const transition = await body.evaluate((el) =>
      window.getComputedStyle(el).transition
    )
    expect(transition).toContain('background-color')
    // Browser reports "0.2s" instead of "200ms"
    expect(transition).toMatch(/0\.2s|200ms/)
  })

  test('light theme uses correct color tokens', async ({ page }) => {
    // Switch to light theme
    await page.click('button[title="Settings"]')
    await page.click('.right-panel__theme-option:has-text("Light")')

    // Verify light theme colors applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-app')
        .trim()
    })

    // Light theme should have light background (not dark)
    expect(bgColor).toMatch(/#f[0-9a-f]{5}/i) // Starts with #f (light color)
  })

  test('dark theme uses correct color tokens', async ({ page }) => {
    // Ensure dark theme
    await page.click('button[title="Settings"]')
    await page.click('.right-panel__theme-option:has-text("Dark")')

    // Verify dark theme colors applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-app')
        .trim()
    })

    // Dark theme should have dark background
    expect(bgColor).toMatch(/#[0-1][0-9a-f]{5}/i) // Starts with #0 or #1 (dark color)
  })

  test('theme selector shows in Appearance section', async ({ page }) => {
    // Open settings
    await page.click('button[title="Settings"]')

    // Verify Appearance section exists
    const appearanceHeading = page.locator('h3:has-text("Appearance")')
    await expect(appearanceHeading).toBeVisible()

    // Verify theme selector exists
    const themeSelector = page.locator('.right-panel__theme-selector')
    await expect(themeSelector).toBeVisible()

    // Verify all three options exist
    await expect(page.locator('.right-panel__theme-option:has-text("Light")')).toBeVisible()
    await expect(page.locator('.right-panel__theme-option:has-text("Dark")')).toBeVisible()
    await expect(page.locator('.right-panel__theme-option:has-text("Auto")')).toBeVisible()
  })
})
