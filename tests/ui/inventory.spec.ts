import { expect, test } from '@fixtures/test';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists all products', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sorts by price, low to high', { tag: '@regression' }, async ({ inventoryPage }) => {
    const original = await inventoryPage.getProductPrices();

    await inventoryPage.sortBy('lohi');

    await expect
      .poll(() => inventoryPage.getProductPrices())
      .toEqual([...original].sort((a, b) => a - b));
  });

  test('sorts by name, Z to A', { tag: '@regression' }, async ({ inventoryPage }) => {
    const original = await inventoryPage.getProductNames();

    await inventoryPage.sortBy('za');

    await expect
      .poll(() => inventoryPage.getProductNames())
      .toEqual([...original].sort((a, b) => b.localeCompare(a)));
  });
});
