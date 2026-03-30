import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { resolveUser } from '../utils/user.utils';

// ─── Given ────────────────────────────────────────────────────────────────────

// Step de login via label semântico — credenciais resolvidas do .env
Given(
  'que estou logado como {string}',
  async function (this: CustomWorld, userLabel: string) {
    const { username, password } = resolveUser(userLabel);
    await this.login.navigateTo();
    await this.login.login(username, password);
    await this.inventory.waitForPageLoad();
  }
);

Given('estou na página de inventário', async function (this: CustomWorld) {
  await this.inventory.waitForPageLoad();
});

Given(
  'já adicionei o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventory.addProductToCart(productName);
  }
);

Given(
  'adicionei o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventory.addProductToCart(productName);
  }
);

Given('naveguei para o carrinho', async function (this: CustomWorld) {
  await this.inventory.goToCart();
  await this.cart.waitForPageLoad();
});

// ─── When ─────────────────────────────────────────────────────────────────────

When(
  'adiciono o produto {string} ao carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventory.addProductToCart(productName);
  }
);

When(
  'removo o produto {string} do carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventory.removeProductFromCart(productName);
  }
);

// ─── Then ─────────────────────────────────────────────────────────────────────

Then(
  'o badge do carrinho deve exibir {string}',
  async function (this: CustomWorld, expectedCount: string) {
    const count = await this.inventory.getCartBadgeCount();
    expect(count).toBe(Number(expectedCount));
  }
);

Then('o badge do carrinho não deve ser exibido', async function (this: CustomWorld) {
  const count = await this.inventory.getCartBadgeCount();
  expect(count).toBe(0);
});

Then(
  'o produto {string} deve estar no carrinho',
  async function (this: CustomWorld, productName: string) {
    await this.inventory.goToCart();
    await this.cart.waitForPageLoad();
    const isInCart = await this.cart.isProductInCart(productName);
    expect(isInCart).toBeTruthy();
  }
);

Then('o carrinho deve estar vazio', async function (this: CustomWorld) {
  await this.inventory.goToCart();
  await this.cart.waitForPageLoad();
  const count = await this.cart.getItemCount();
  expect(count).toBe(0);
});

Then(
  'o carrinho deve conter {int} itens',
  async function (this: CustomWorld, expectedCount: number) {
    await this.inventory.goToCart();
    await this.cart.waitForPageLoad();
    const count = await this.cart.getItemCount();
    expect(count).toBe(expectedCount);
  }
);
