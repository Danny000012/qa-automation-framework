import { test } from '@fixtures/test';
import { buildCheckoutInfo } from '@utils/data-factory';
import { products } from '../data/users';

test.describe('Cart and checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'user can buy a product end to end',
    { tag: '@smoke' },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.expectCartCount(1);

      await inventoryPage.openCart();
      await cartPage.expectItems([products.backpack]);

      await cartPage.checkout();
      await checkoutPage.fillInformation(buildCheckoutInfo());
      await checkoutPage.continue();
      await checkoutPage.finish();

      await checkoutPage.expectOrderComplete();
    },
  );

  test(
    'cart keeps several products',
    { tag: '@regression' },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.addToCart(products.bikeLight);
      await inventoryPage.expectCartCount(2);

      await inventoryPage.openCart();

      await cartPage.expectItems([products.backpack, products.bikeLight]);
    },
  );

  test(
    'removing the only item empties the cart',
    { tag: '@regression' },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(products.boltTShirt);
      await inventoryPage.openCart();

      await cartPage.removeItem(products.boltTShirt);

      await cartPage.expectEmpty();
    },
  );

  test(
    'checkout requires a first name',
    { tag: '@regression' },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.openCart();
      await cartPage.checkout();

      await checkoutPage.fillInformation(buildCheckoutInfo({ firstName: '' }));
      await checkoutPage.continue();

      await checkoutPage.expectErrorMessage('First Name is required');
    },
  );
});
