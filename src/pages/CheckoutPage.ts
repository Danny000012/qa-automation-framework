import { expect } from '@playwright/test';
import type { CheckoutInfo } from '@utils/data-factory';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly path = '/checkout-step-one.html';

  readonly firstNameInput = this.page.getByTestId('firstName');
  readonly lastNameInput = this.page.getByTestId('lastName');
  readonly postalCodeInput = this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly finishButton = this.page.getByTestId('finish');
  readonly errorMessage = this.page.getByTestId('error');
  readonly completeHeader = this.page.getByTestId('complete-header');

  async fillInformation(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
