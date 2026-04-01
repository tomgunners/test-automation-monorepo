import { BasePage }      from './base.page';
import { LoginLocators } from '../locators/login.locators';
import { UserCredentials } from '../types/mobile.types';

/**
 * Screen Object da tela de Login.
 */
export class LoginScreen extends BasePage {

  /** Navega para a tela de Login via menu inferior. */
  async waitForScreen(): Promise<void> {
    await this.tap(LoginLocators.loginMenu);
  }

  /** Preenche usuário e senha e submete o formulário. */
  async login(credentials: UserCredentials): Promise<void> {
    await this.fill(LoginLocators.usernameField, credentials.username);
    await this.fill(LoginLocators.passwordField, credentials.password);
    await this.tap(LoginLocators.loginButton);
  }

  /** Submete o formulário sem preencher nenhum campo. */
  async tapLoginWithoutCredentials(): Promise<void> {
    await this.tap(LoginLocators.loginButton);
  }

  /** Aguarda e verifica que o login foi bem-sucedido. */
  async verifyLoginSuccess(): Promise<void> {
    const container    = await $(LoginLocators.successContainer);
    const textElements = await container.$$(LoginLocators.successTextElement);
    const allTexts     = await Promise.all(
      Array.from(textElements).map(el => el.getText()),
    );

    expect(allTexts).toContain('Success');
    expect(allTexts).toContain('You are logged in!');
  }

  /**
   * Retorna o texto do primeiro erro de campo visível.
   * Retorna string vazia se nenhum erro estiver visível.
   */
  async getErrorMessage(): Promise<string> {
    const [emailVisible, passwordVisible] = await Promise.all([
      this.isDisplayed(LoginLocators.emailErrorMessage),
      this.isDisplayed(LoginLocators.passwordErrorMessage),
    ]);

    if (emailVisible)   return this.getText(LoginLocators.emailErrorMessage);
    if (passwordVisible) return this.getText(LoginLocators.passwordErrorMessage);

    return '';
  }

  /** true se qualquer mensagem de erro de campo estiver visível. */
  async hasError(): Promise<boolean> {
    const [emailVisible, passwordVisible] = await Promise.all([
      this.isDisplayed(LoginLocators.emailErrorMessage),
      this.isDisplayed(LoginLocators.passwordErrorMessage),
    ]);

    return emailVisible || passwordVisible;
  }

  /** true se o botão de login estiver visível (tela está ativa). */
  async isActive(): Promise<boolean> {
    return this.isDisplayed(LoginLocators.loginButton);
  }
}
