# QA Automation Framework

UI and API test automation in one TypeScript project, built on [Playwright Test](https://playwright.dev).

- **UI tests** use the Page Object Model, a one-time login via saved session, and run on Chromium, Firefox, WebKit and a mobile viewport.
- **API tests** use typed service clients, with every response validated against a [Zod](https://zod.dev) schema, and automatic cleanup of any data a test creates.
- **Shared** fixtures, data factories ([faker](https://fakerjs.dev)), environment config, linting, formatting and a GitHub Actions pipeline.

It ships with working sample tests against two public demo targets, so you can see it run before pointing it at your own product:

| Layer | Demo target                                                   |
| ----- | ------------------------------------------------------------- |
| UI    | [saucedemo.com](https://www.saucedemo.com) (web shop)         |
| API   | [restful-booker](https://restful-booker.herokuapp.com) (REST) |

## Quick start

Requires Node.js 20 or newer.

```bash
npm ci
npx playwright install --with-deps   # one-off: downloads the browsers
cp .env.example .env                 # optional: defaults already work
npm test                             # everything
npm run report                       # open the HTML report
```

## Scripts

| Command                   | What it does                                  |
| ------------------------- | --------------------------------------------- |
| `npm test`                | All projects (setup, UI on 4 browsers, API)   |
| `npm run test:ui`         | UI tests on Chromium only (fast local loop)   |
| `npm run test:ui:all`     | UI tests on Chromium, Firefox and WebKit      |
| `npm run test:api`        | API tests only (no browser needed)            |
| `npm run test:smoke`      | Only tests tagged `@smoke`                    |
| `npm run test:regression` | Only tests tagged `@regression`               |
| `npm run test:headed`     | UI tests with a visible browser               |
| `npm run test:debug`      | UI tests in the Playwright inspector          |
| `npm run codegen`         | Record a new test by clicking through the app |
| `npm run lint` / `format` | ESLint / Prettier                             |
| `npm run typecheck`       | TypeScript check with no emit                 |

Run a single file or test: `npx playwright test tests/api/booking.spec.ts -g "creates a booking"`.

## Project structure

```
src/
  config/
    env.ts               Validated environment variables (Zod) with defaults
    paths.ts             Shared file paths (saved login session)
  api/
    base.client.ts       Base class: asserts status + validates the schema
    schemas/             Zod schemas = runtime contract for each response
    services/            One typed client per API area (booking.service.ts)
  pages/                 Page objects: locators + user-level actions + expect* checks
  fixtures/test.ts       Custom `test`: injects page objects and API clients
  utils/data-factory.ts  Random, valid test data (faker)
tests/
  setup/auth.setup.ts    Logs in once, saves the session for all UI tests
  ui/                    UI specs
  api/                   API specs
  data/                  Static test data (users, product names)
playwright.config.ts     Projects, reporters, retries, timeouts
.github/workflows/       CI pipeline
```

## How it fits together

**Fixtures.** Specs import `test` and `expect` from `@fixtures/test`, never from `@playwright/test`. That gives each test ready-made `loginPage`, `inventoryPage`, `bookingApi` and so on. Fixtures are lazy, so an API spec never launches a browser.

**Authenticated UI tests.** The `setup` project logs in through the real UI once and stores the session in `.auth/user.json`. Every UI project depends on it, so tests start already logged in. A spec that tests the login form itself opts out with `test.use({ storageState: { cookies: [], origins: [] } })`.

**Page objects.** Locators live in the page class, tests describe journeys. Name assertion helpers `expectSomething` (the lint rule counts these as assertions).

**API services.** Methods return typed, schema-validated data. If the API drops or renames a field, the test fails with a precise Zod error instead of a vague `undefined`. `bookingApi` tracks every booking it creates and deletes them after the test, even if the test fails.

**Tags.** Tag tests with `{ tag: '@smoke' }` or `{ tag: '@regression' }` and filter with `--grep`.

## Adding tests

New UI page:

1. Create `src/pages/MyPage.ts` extending `BasePage` (set `path`, add locators and actions).
2. Register it in `src/fixtures/test.ts`.
3. Use it in a spec:

```ts
import { test } from '@fixtures/test';

test('user can update their profile', { tag: '@regression' }, async ({ profilePage }) => {
  await profilePage.goto();
  await profilePage.setDisplayName('Ada');
  await profilePage.expectSaved();
});
```

New API area:

1. Add a schema in `src/api/schemas/`.
2. Add a service in `src/api/services/` extending `BaseApiClient`.
3. Register it in `src/fixtures/test.ts` (with cleanup if it creates data).

## Pointing it at your own application

1. Copy `.env.example` to `.env` and set `UI_BASE_URL`, `API_BASE_URL` and the credentials.
2. In `playwright.config.ts`, set `testIdAttribute` to what your app uses (`data-testid` is the common one).
3. Replace the page objects in `src/pages/`, the schemas and service in `src/api/`, and the specs in `tests/`. The structure, fixtures, config and CI stay as they are.
4. Update `tests/setup/auth.setup.ts` if your login flow differs. If your app has no login, delete the `setup` project and the `storageState` lines in `playwright.config.ts`.

## CI (GitHub Actions)

`.github/workflows/playwright.yml` runs on every push to `main`, every pull request, weekdays at 04:00 UTC, and on demand. Pipeline: lint, format check and type-check first, then API tests and UI tests (Chromium, Firefox, WebKit in parallel). HTML reports and traces are uploaded as artifacts.

In your repo, go to **Settings → Secrets and variables → Actions** and add:

- Variables: `UI_BASE_URL`, `API_BASE_URL`
- Secrets: `UI_USERNAME`, `UI_PASSWORD`, `API_USERNAME`, `API_PASSWORD`

Anything unset falls back to the demo defaults. Never commit real credentials; `.env` is git-ignored.

To run only some tests from the Actions tab, use **Run workflow** and enter a tag such as `@smoke`.

## Pushing to your repository

```bash
git init -b main
git add .
git commit -m "Add Playwright UI and API test framework"
git remote add origin <your-repo-url>
git push -u origin main
```
