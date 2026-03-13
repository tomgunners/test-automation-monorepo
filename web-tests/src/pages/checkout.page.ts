import { Page } from 'playwright';
import { BasePage } from './base.page';
import { CheckoutLocators } from '../locators/checkout.locators';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}


export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Step 1: Informações pessoais ─────────────────────────────────────────
  /** Preenche campo por campo — usado pelos steps do Cucumber */
  async fillFirstName(firstName: string): Promise<void> {
    await this.page.fill(CheckoutLocators.firstNameInput, firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.page.fill(CheckoutLocators.lastNameInput, lastName);
  }

  async fillPostalCode(postalCode: string): Promise<void> {
    await this.page.fill(CheckoutLocators.postalCodeInput, postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.page.click(CheckoutLocators.continueButton);
  }

async submitCheckoutInfo(info: CheckoutInfo): Promise<void> {
  await this.fillFirstName(info.firstName);
  await this.fillLastName(info.lastName);
  await this.fillPostalCode(info.postalCode);
  await this.clickContinue();
}

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(CheckoutLocators.errorMessage);
    return await this.page.textContent(CheckoutLocators.errorMessage) ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.isVisible(CheckoutLocators.errorMessage);
  }

  // ─── Step 2: Resumo do pedido ──────────────────────────────────────────────

  async getOrderTotal(): Promise<string> {
    return await this.page.textContent(CheckoutLocators.total) ?? '';
  }

  async clickFinish(): Promise<void> {
    await this.page.click(CheckoutLocators.finishButton);
  }

  // ─── Confirmação ──────────────────────────────────────────────────────────

  async waitForConfirmation(): Promise<void> {
    await this.waitForElement(CheckoutLocators.confirmationContainer);
  }

  async getConfirmationHeader(): Promise<string> {
    return await this.page.textContent(CheckoutLocators.confirmationHeader) ?? '';
  }

  async isConfirmationVisible(): Promise<boolean> {
    return this.page.isVisible(CheckoutLocators.confirmationContainer);
  }

  async backToHome(): Promise<void> {
    await this.page.click(CheckoutLocators.backToHomeButton);
  }
}
