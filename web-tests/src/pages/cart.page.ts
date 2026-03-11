import { Page } from 'playwright';
import { BasePage } from './base.page';
import { CartLocators } from '../locators/cart.locators';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(CartLocators.cartContainer);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.textContent(CartLocators.pageTitle) ?? '';
  }

  async getItemCount(): Promise<number> {
    const items = await this.page.$$(CartLocators.cartItem);
    return items.length;
  }

  async getItemNames(): Promise<string[]> {
    return this.page.$$eval(
      CartLocators.cartItemName,
      (elements) => elements.map((el) => el.textContent?.trim() ?? '')
    );
  }

  async removeItem(productName: string): Promise<void> {
    const selector = `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.page.click(selector);
  }

  async isProductInCart(productName: string): Promise<boolean> {
    const names = await this.getItemNames();
    return names.some((name) => name === productName);
  }

  async continueShopping(): Promise<void> {
    await this.page.click(CartLocators.continueShoppingButton);
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.click(CartLocators.checkoutButton);
  }

  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.page.isVisible(CartLocators.cartBadge);
    if (!isVisible) return 0;
    const text = await this.page.textContent(CartLocators.cartBadge);
    return Number(text ?? 0);
  }
}
