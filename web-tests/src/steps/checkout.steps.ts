import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';

// ─── Given ────────────────────────────────────────────────────────────────────

Given('cliquei em "Checkout"', async function (this: CustomWorld) {
  await this.cartPage!.proceedToCheckout();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When('preencho o primeiro nome {string}', async function (this: CustomWorld, firstName: string) {
  await this.page!.fill('[data-test="firstName"]', firstName);
});

When('preencho o sobrenome {string}', async function (this: CustomWorld, lastName: string) {
  await this.page!.fill('[data-test="lastName"]', lastName);
});

When('preencho o CEP {string}', async function (this: CustomWorld, postalCode: string) {
  await this.page!.fill('[data-test="postalCode"]', postalCode);
});

When('deixo o primeiro nome em branco', async function (this: CustomWorld) {
  // Não faz nada — campo permanece vazio
});

When('clico em "Continue"', async function (this: CustomWorld) {
  await this.checkoutPage!.clickContinue();
});

When(
  'clico em "Continue" sem preencher nenhum campo',
  async function (this: CustomWorld) {
    await this.checkoutPage!.clickContinue();
  }
);

When('clico em "Finish"', async function (this: CustomWorld) {
  await this.checkoutPage!.clickFinish();
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('devo ver a tela de confirmação do pedido', async function (this: CustomWorld) {
  await this.checkoutPage!.waitForConfirmation();
  const isVisible = await this.checkoutPage!.isConfirmationVisible();
  expect(isVisible).toBeTruthy();
});

Then(
  'a mensagem de confirmação deve ser {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    const header = await this.checkoutPage!.getConfirmationHeader();
    expect(header.trim()).toBe(expectedMessage);
  }
);

Then(
  'devo ver um erro informando que o primeiro nome é obrigatório',
  async function (this: CustomWorld) {
    const isErrorVisible = await this.checkoutPage!.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();

    const errorMessage = await this.checkoutPage!.getErrorMessage();
    expect(errorMessage).toContain('First Name is required');
  }
);
