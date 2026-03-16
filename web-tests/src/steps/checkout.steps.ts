import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { ErrorMessages } from '../data/messages';

// ─── Given ────────────────────────────────────────────────────────────────────

Given('cliquei em "Checkout"', async function (this: CustomWorld) {
  await this.cart.proceedToCheckout();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When('preencho o primeiro nome {string}', async function (this: CustomWorld, firstName: string) {
  await this.checkout.fillFirstName(firstName);
});

When('preencho o sobrenome {string}', async function (this: CustomWorld, lastName: string) {
  await this.checkout.fillLastName(lastName);
});

When('preencho o CEP {string}', async function (this: CustomWorld, postalCode: string) {
  await this.checkout.fillPostalCode(postalCode);
});

When('deixo o primeiro nome em branco', async function (this: CustomWorld) {
  // Não faz nada — campo permanece vazio
});

When('clico em "Continue"', async function (this: CustomWorld) {
  await this.checkout.clickContinue();
});

When(
  'clico em "Continue" sem preencher nenhum campo',
  async function (this: CustomWorld) {
    await this.checkout.clickContinue();
  }
);

When('clico em "Finish"', async function (this: CustomWorld) {
  await this.checkout.clickFinish();
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('devo ver a tela de confirmação do pedido', async function (this: CustomWorld) {
  await this.checkout.waitForConfirmation();
  const isVisible = await this.checkout.isConfirmationVisible();
  expect(isVisible).toBeTruthy();
});

Then(
  'a mensagem de confirmação deve ser {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    const header = await this.checkout.getConfirmationHeader();
    expect(header.trim()).toBe(expectedMessage);
  }
);

Then(
  'devo ver um erro informando que o primeiro nome é obrigatório',
  async function (this: CustomWorld) {
    const isErrorVisible = await this.checkout.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();

    const errorMessage = await this.checkout.getErrorMessage();
    expect(errorMessage).toContain(ErrorMessages.firstNameRequired);
  }
);
