import { test as setup } from '@playwright/test';
import { env } from '@config/env';
import { STORAGE_STATE } from '@config/paths';
import { InventoryPage } from '@pages/InventoryPage';
import { LoginPage } from '@pages/LoginPage';

/**
 * Runs once before the UI projects. Logs in through the real UI and saves the
 * session so every UI test starts already authenticated.
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
  await inventoryPage.expectLoaded();

  await page.context().storageState({ path: STORAGE_STATE });
});
