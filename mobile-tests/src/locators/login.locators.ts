//Locators da tela de Login

export const LoginLocators = {
  loginMenu:            '~Login',
  usernameField:        '~input-email',
  passwordField:        '~input-password',
  loginButton:          '~button-LOGIN',
  emailErrorMessage:    '//*[@text="Please enter a valid email address"]',
  passwordErrorMessage: '//*[@text="Please enter at least 8 characters"]'
} as const;