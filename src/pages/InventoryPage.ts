import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/** "Sauce Labs Backpack" -> "sauce-labs-backpack" (used in add/remove button test ids). */
const toSlug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';

  readonly title = this.page.getByTestId('title');
  readonly items = this.page.getByTestId('inventory-item');
  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly itemPrices = this.page.getByTestId('inventory-item-price');
  readonly sortDropdown = this.page.getByTestId('product-sort-container');
  readonly cartLink = this.page.getByTestId('shopping-cart-link');
  readonly cartBadge = this.page.getByTestId('shopping-cart-badge');

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${toSlug(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${toSlug(productName)}`).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((text) => Number(text.replace('$', '')));
  }

  async expectLoaded(): Promise<void> {
    await this.expectOnPage();
    await expect(this.title).toHaveText('Products');
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
