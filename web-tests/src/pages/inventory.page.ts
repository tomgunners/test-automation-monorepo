import { Page } from 'playwright';
import { BasePage } from './base.page';
import { InventoryLocators } from '../locators/inventory.locators';

/**
 * Page Object para a página de Inventário (produtos).
 */
export class InventoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(InventoryLocators.inventoryContainer);
  }

  async getPageTitle(): Promise<string> {
    return this.page.textContent(InventoryLocators.pageTitle) ?? '';
  }

  async addProductToCart(productName: string): Promise<void> {
    const selector = InventoryLocators.addToCartByName(productName);
    await this.page.click(selector);
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const selector = InventoryLocators.removeByName(productName);
    await this.page.click(selector);
  }

  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.page.isVisible(InventoryLocators.cartBadge);
    if (!isVisible) return 0;
    const text = await this.page.textContent(InventoryLocators.cartBadge);
    return Number(text ?? 0);
  }

  async goToCart(): Promise<void> {
    await this.page.click(InventoryLocators.cartLink);
  }

  async getAllProductNames(): Promise<string[]> {
    return this.page.$$eval(
      InventoryLocators.itemName,
      (elements) => elements.map((el) => el.textContent?.trim() ?? '')
    );
  }
}
