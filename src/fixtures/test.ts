import { test as base, expect } from '@playwright/test';
import { env } from '@config/env';
import { BookingService } from '@api/services/booking.service';
import type { Booking } from '@api/schemas/booking.schema';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { InventoryPage } from '@pages/InventoryPage';
import { LoginPage } from '@pages/LoginPage';
import { buildBooking } from '@utils/data-factory';

export interface CreatedBooking {
  id: number;
  booking: Booking;
}

interface Fixtures {
  // UI page objects
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  // API
  bookingApi: BookingService;
  createdBooking: CreatedBooking;
}

/**
 * Import `test` and `expect` from here (not from '@playwright/test') so specs
 * get page objects and API clients injected. Fixtures are lazy: API specs never
 * start a browser, and UI specs never touch the API client.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  bookingApi: async ({ request }, use) => {
    const service = new BookingService(request, {
      username: env.API_USERNAME,
      password: env.API_PASSWORD,
    });
    await use(service);
    await service.cleanup(); // removes every booking the test created
  },

  createdBooking: async ({ bookingApi }, use) => {
    const { bookingid, booking } = await bookingApi.create(buildBooking());
    await use({ id: bookingid, booking });
  },
});

export { expect };
