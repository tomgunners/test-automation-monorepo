import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';

// ─── Given ────────────────────────────────────────────────────────────────────

Given(
  'que estou logado com o usuário {string} e senha {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.loginPage!.navigateTo();
    await this.loginPage!.login(username, password);
    await this.inventoryPage!.waitForPageLoad();
  }
);

Given('estou na página de inventário', async function (this: CustomWorld) {
  await this.inventoryPage!.waitForPageLoad();
});

Given(
  'já adicionei o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventoryPage!.addProductToCart(productName);
  }
);

Given(
  'adicionei o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventoryPage!.addProductToCart(productName);
  }
);

Given('naveguei para o carrinho', async function (this: CustomWorld) {
  await this.inventoryPage!.goToCart();
  await this.cartPage!.waitForPageLoad();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When(
  'adiciono o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventoryPage!.addProductToCart(productName);
  }
);

When(
  'removo o produto {string} do carrinho',
  async function (this: CustomWorld, productName: string) {
    // Remoção a partir da página de inventário
    await this.inventoryPage!.removeProductFromCart(productName);
  }
);

// ─── Then ─────────────────────────────────────────────────────────────────────

Then(
  'o badge do carrinho deve exibir {string}',
  async function (this: CustomWorld, expectedCount: string) {
    const count = await this.inventoryPage!.getCartBadgeCount();
    expect(count).toBe(Number(expectedCount));
  }
);

Then('o badge do carrinho não deve ser exibido', async function (this: CustomWorld) {
  const count = await this.inventoryPage!.getCartBadgeCount();
  expect(count).toBe(0);
});

Then(
  'o produto {string} deve estar no carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventoryPage!.goToCart();
    await this.cartPage!.waitForPageLoad();
    const isInCart = await this.cartPage!.isProductInCart(productName);
    expect(isInCart).toBeTruthy();
  }
);

Then('o carrinho deve estar vazio', async function (this: CustomWorld) {
  await this.inventoryPage!.goToCart();
  await this.cartPage!.waitForPageLoad();
  const count = await this.cartPage!.getItemCount();
  expect(count).toBe(0);
});

Then(
  'o carrinho deve conter {int} itens',
  async function (this: CustomWorld, expectedCount: number) {
    await this.inventoryPage!.goToCart();
    await this.cartPage!.waitForPageLoad();
    const count = await this.cartPage!.getItemCount();
    expect(count).toBe(expectedCount);
  }
);
