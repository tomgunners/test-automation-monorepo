/**
 * Locators da página de Login.
 * Separados da Page Object para facilitar manutenção.
 */
export const LoginLocators = {
  usernameInput:   '[data-test="username"]',
  passwordInput:   '[data-test="password"]',
  loginButton:     '[data-test="login-button"]',
  errorMessage:    '[data-test="error"]',
  errorCloseButton: '.error-button',
} as const;
