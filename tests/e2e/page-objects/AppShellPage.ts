import { Page, Locator } from '@playwright/test'

export class AppShellPage {
  readonly page: Page
  readonly appShell: Locator
  readonly topToolbar: Locator
  readonly leftSidebar: Locator
  readonly centerWorkspace: Locator
  readonly emptyState: Locator
  readonly pandaMascot: Locator
  readonly composer: Locator
  readonly customizeMenu: Locator
  readonly globalSearch: Locator

  constructor(page: Page) {
    this.page = page
    this.appShell = page.locator('[data-testid="app-shell"]')
    this.topToolbar = page.locator('[data-testid="top-toolbar"]')
    this.leftSidebar = page.locator('[data-testid="left-sidebar"]')
    this.centerWorkspace = page.locator('[data-testid="center-workspace"]')
    this.emptyState = page.locator('[data-testid="empty-state"]')
    this.pandaMascot = page.locator('[data-testid="panda-mascot"]')
    this.composer = page.locator('[data-testid="composer"]')
    this.customizeMenu = page.locator('[data-testid="customize-menu"]')
    this.globalSearch = page.locator('[data-testid="global-search"]')
  }

  async goto() {
    await this.page.goto('http://localhost:1420')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getTheme(): Promise<string | null> {
    return await this.appShell.getAttribute('data-theme')
  }

  async getComputedStyle(locator: Locator, property: string): Promise<string> {
    return await locator.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop)
    }, property)
  }

  async getBorderRadius(locator: Locator): Promise<string> {
    return await this.getComputedStyle(locator, 'border-radius')
  }

  async getBackgroundColor(locator: Locator): Promise<string> {
    return await this.getComputedStyle(locator, 'background-color')
  }

  async getTransition(locator: Locator): Promise<string> {
    return await this.getComputedStyle(locator, 'transition')
  }

  async switchTheme(theme: 'light' | 'dark') {
    // Open Customize menu
    await this.page.click('[data-testid="customize-button"]')
    await this.customizeMenu.waitFor({ state: 'visible' })

    // Click theme option
    await this.page.click(`[data-testid="theme-${theme}"]`)

    // Wait for theme to apply
    await this.page.waitForTimeout(300)
  }
}
