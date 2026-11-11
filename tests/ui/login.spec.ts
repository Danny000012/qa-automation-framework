import { test } from '@fixtures/test';
import { users } from '../data/users';

test.describe('Login', () => {
  // These tests exercise the login form itself, so start logged out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await inventoryPage.expectLoaded();
  });

  test('locked out user is rejected', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await loginPage.expectErrorMessage('this user has been locked out');
  });

  const invalidAttempts = [
    {
      name: 'wrong password',
      username: users.standard.username,
      password: 'not-the-password',
      error: 'Username and password do not match',
    },
    {
      name: 'missing username',
      username: '',
      password: users.standard.password,
      error: 'Username is required',
    },
    {
      name: 'missing password',
      username: users.standard.username,
      password: '',
      error: 'Password is required',
    },
  ];

  for (const attempt of invalidAttempts) {
    test(`shows an error for ${attempt.name}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(attempt.username, attempt.password);

      await loginPage.expectErrorMessage(attempt.error);
    });
  }
});
