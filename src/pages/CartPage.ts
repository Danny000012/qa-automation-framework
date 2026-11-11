import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly path = '/cart.html';

  readonly items = this.page.getByTestId('inventory-item');
  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly checkoutButton = this.page.getByTestId('checkout');
  readonly continueShoppingButton = this.page.getByTestId('continue-shopping');

  async removeItem(productName: string): Promise<void> {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`remove-${slug}`).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectItems(productNames: string[]): Promise<void> {
    await this.expectOnPage();
    await expect(this.itemNames).toHaveText(productNames);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.items).toHaveCount(0);
  }
}
