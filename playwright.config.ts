import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/paths';

const isCI = !!process.env.CI;

const uiUse = {
  baseURL: env.UI_BASE_URL,
  storageState: STORAGE_STATE,
};

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // saucedemo uses `data-test`; change this if your app uses `data-testid`.
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Logs in once and saves the session so UI tests don't repeat the login flow.
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.UI_BASE_URL },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...uiUse },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...uiUse },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], ...uiUse },
    },
    {
      name: 'ui-mobile',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], ...uiUse },
    },
    // Pure API tests: no browser is launched.
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
