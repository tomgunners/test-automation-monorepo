/**
 * Locators da tela de Formulários.
 */
export const FormsLocators = {
  formsMenu: '~Forms',

  // ── Campo de texto ─────────────────────────────────────────────────────────
  inputField:  '~text-input',
  inputResult: '~input-text-result',

  // ── Switch ─────────────────────────────────────────────────────────────────
  switchToggle:      '~switch',
  switchActiveText:  '//*[@text="Click to turn the switch OFF"]',
  switchInactiveText: '//*[@text="Click to turn the switch ON"]',

  // ── Dropdown ───────────────────────────────────────────────────────────────
  dropdownTrigger:     '~Dropdown',
  dropdownOptionOne:   '//*[@text="webdriver.io is awesome"]',
  dropdownOptionTwo:   '//*[@text="Appium is awesome"]',
  dropdownOptionThree: '//*[@text="This app is awesome"]',
  dropdownSelected:    '//android.widget.EditText[contains(@resource-id,"text_input")]',

  // ── Botões de estado ───────────────────────────────────────────────────────
  activeButton:   '~button-Active',
  inactiveButton: '~button-Inactive',
} as const;
