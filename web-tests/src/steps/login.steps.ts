import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { ErrorMessages } from '../data/messages';
import { config } from '../config/env.config';

// ─── Resolução de credenciais ─────────────────────────────────────────────────
// Mapeia labels semânticos usados nas features para credenciais reais vindas do .env.
// Ao mudar de ambiente, basta atualizar as variáveis — nenhum .feature é alterado.
function resolveUsername(label: string): string {
  const map: Record<string, string> = {
    'standard_user': config.users.standard.username,
    'locked_out_user': config.users.locked.username,
    'invalid_user': config.users.invalid.username,
  };
  return map[label] ?? label;
}

function resolvePassword(label: string): string {
  const map: Record<string, string> = {
    'secret_sauce': config.users.standard.password,
    'wrong_password': config.users.invalid.password,
  };
  return map[label] ?? label;
}

// ─── Given ────────────────────────────────────────────────────────────────────

Given('que estou na página de login', async function (this: CustomWorld) {
  await this.login.navigateTo();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When(
  'informo o usuário {string} e a senha {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.login.fillUsername(resolveUsername(username));
    await this.login.fillPassword(resolvePassword(password));
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
    expect(errorMessage).toContain(ErrorMessages.invalidCredentials);
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
    expect(errorMessage).toContain(ErrorMessages.lockedUser);
    this.lastErrorMessage = errorMessage;
  }
);
