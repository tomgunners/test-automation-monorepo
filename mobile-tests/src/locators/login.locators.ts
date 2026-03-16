//Locators da tela de Login

export const LoginLocators = {
  loginMenu:            '~Login',
  usernameField:        '~input-email',
  passwordField:        '~input-password',
  loginButton:          '~button-LOGIN',
  emailErrorMessage:    '//*[@text="Please enter a valid email address"]',
  passwordErrorMessage: '//*[@text="Please enter at least 8 characters"]',

  // Locators de verificação de sucesso — mantidos no arquivo de locators
  // para facilitar manutenção quando o app mudar IDs/textos.
  successContainer:     'id=com.wdiodemoapp:id/parentPanel',
  successTextElement:   'android.widget.TextView',
} as const;
