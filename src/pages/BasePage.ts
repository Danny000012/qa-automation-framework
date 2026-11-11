import { expect, type Page } from '@playwright/test';

/**
 * Base class for page objects. Subclasses declare their `path` and expose
 * locators plus intent-level actions (`login`, `addToCart`) and `expect*`
 * assertions. Tests should read like user journeys, not selector lists.
 */
export abstract class BasePage {
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === this.path);
  }
}
