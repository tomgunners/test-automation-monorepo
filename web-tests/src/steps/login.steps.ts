import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { config } from '../config/env.config';

// ── Resolução de credenciais ─────────────────────────────────────────────────
// Mapeia o label semântico do Gherkin para as credenciais reais vindas do .env.
// Centraliza aqui para que feature files nunca contenham valores sensíveis.
function resolveUser(label: string): { username: string; password: string } {
  const user = config.users[label];
  if (!user) {
    throw new Error(
      `[resolveUser] Label "${label}" não encontrado em config.users. ` +
      `Labels disponíveis: ${Object.keys(config.users).join(', ')}`
    );
  }
  return user;
}

// ─── Given ────────────────────────────────────────────────────────────────────

Given('que estou na página de login', async function (this: CustomWorld) {
  await this.login.navigateTo();
});

// ─── When ─────────────────────────────────────────────────────────────────────

// Step unificado: recebe o label semântico e resolve para as credenciais do .env
When(
  'informo as credenciais do {string}',
  async function (this: CustomWorld, userLabel: string) {
    const { username, password } = resolveUser(userLabel);
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
