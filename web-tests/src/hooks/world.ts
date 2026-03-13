import { IWorldOptions, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';

import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

export class CustomWorld extends World {

  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page Objects — acesso via getters com guarda
  private loginPage?: LoginPage;
  private inventoryPage?: InventoryPage;
  private cartPage?: CartPage;
  private checkoutPage?: CheckoutPage;

  // Dados de cenário
  scenarioName?: string;
  lastErrorMessage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  initPages(): void {
    this.loginPage    = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.cartPage     = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
  }

  // ── Getters com guarda ────────────────────────────────────────────────────
  // Substituem o uso de ! nos steps — lançam erro claro se initPages()
  // não tiver sido chamado antes do acesso.

  get login(): LoginPage {
    if (!this.loginPage) throw new Error('LoginPage não inicializado — verifique o hook Before');
    return this.loginPage;
  }

  get inventory(): InventoryPage {
    if (!this.inventoryPage) throw new Error('InventoryPage não inicializado — verifique o hook Before');
    return this.inventoryPage;
  }

  get cart(): CartPage {
    if (!this.cartPage) throw new Error('CartPage não inicializado — verifique o hook Before');
    return this.cartPage;
  }

  get checkout(): CheckoutPage {
    if (!this.checkoutPage) throw new Error('CheckoutPage não inicializado — verifique o hook Before');
    return this.checkoutPage;
  }
}