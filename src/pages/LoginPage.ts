import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/';

  readonly usernameInput = this.page.getByTestId('username');
  readonly passwordInput = this.page.getByTestId('password');
  readonly loginButton = this.page.getByTestId('login-button');
  readonly errorMessage = this.page.getByTestId('error');

  async login(username: string, password: string): Promise<void> {
    // fill('') is a no-op-safe way to submit an intentionally empty field.
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }
}
