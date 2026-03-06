import { Page } from 'playwright';
import { BasePage } from './base.page';
import { LoginLocators } from '../locators/login.locators';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateTo(): Promise<void> {
    await this.navigate('/');
    await this.waitForElement(LoginLocators.loginButton);
  }

  async fillUsername(username: string): Promise<void> {
    await this.page.fill(LoginLocators.usernameInput, username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.fill(LoginLocators.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.page.click(LoginLocators.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(LoginLocators.errorMessage);
    return this.page.textContent(LoginLocators.errorMessage) ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.isVisible(LoginLocators.errorMessage);
  }

  async closeError(): Promise<void> {
    await this.page.click(LoginLocators.errorCloseButton);
  }
}
