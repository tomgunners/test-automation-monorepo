import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';

// ─── Given ────────────────────────────────────────────────────────────────────

Given('que estou na página de login', async function (this: CustomWorld) {
await this.login.navigateTo();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When(
  'informo o usuário {string} e a senha {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.login.fillUsername(username);
    await this.login.fillPassword(password);
  }
);

When('clico no botão de login', async function (this: CustomWorld) {
  await this.login.clickLoginButton();
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('devo ser redirecionado para a página de inventário', async function (this: CustomWorld) {
  await this.inventory.waitForPageLoad();
  const url = this.page!.url();
  expect(url).toContain('/inventory.html');
});

Then(
  'o título da página deve ser {string}',
  async function (this: CustomWorld, expectedTitle: string) {
    const title = await this.inventory.getPageTitle();
    expect(title.trim()).toBe(expectedTitle);
  }
);

Then(
  'devo ver uma mensagem de erro de credenciais inválidas',
  async function (this: CustomWorld) {
    const errorMessage = await this.login.getErrorMessage();
    expect(errorMessage).toContain('Username and password do not match');
    this.lastErrorMessage = errorMessage;
  }
);

Then('permaneço na página de login', async function (this: CustomWorld) {
  const url = this.page!.url();
  expect(url).not.toContain('/inventory.html');
});

Then(
  'devo ver uma mensagem informando que o usuário está bloqueado',
  async function (this: CustomWorld) {
    const errorMessage = await this.login.getErrorMessage();
    expect(errorMessage).toContain('Sorry, this user has been locked out');
    this.lastErrorMessage = errorMessage;
  }
);
