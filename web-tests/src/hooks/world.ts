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

  // Page Objects
  loginPage!: LoginPage;
  inventoryPage!: InventoryPage;
  cartPage!: CartPage;
  checkoutPage!: CheckoutPage;

  // Dados de cenário
  scenarioName?: string;
  lastErrorMessage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  initPages(): void {

    this.loginPage = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.cartPage = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);

  }
}