import { BasePage }    from './base.page';
import { HomeLocators } from '../locators/home.locators';

/**
 * Screen Object da tela inicial (Home).
 * Gerencia o menu de navegação inferior do app.
 */
export class HomeScreen extends BasePage {

  /** Aguarda a tela inicial ficar visível. */
  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(HomeLocators.homeTitle);
  }

  // ── Navegação via menu inferior ───────────────────────────────────────────

  async goToLogin(): Promise<void> {
    await this.tap(HomeLocators.loginMenu);
  }

  async goToForms(): Promise<void> {
    await this.tap(HomeLocators.formsMenu);
  }

  async goToWebView(): Promise<void> {
    await this.tap(HomeLocators.webViewMenu);
  }

  async goToSwipe(): Promise<void> {
    await this.tap(HomeLocators.swipeMenu);
  }

  async goToDrag(): Promise<void> {
    await this.tap(HomeLocators.dragMenu);
  }

  // ── Verificações ──────────────────────────────────────────────────────────

  /** true se o item de menu estiver visível. */
  async isMenuItemVisible(menuItem: string): Promise<boolean> {
    return this.isDisplayed(menuItem);
  }
}
