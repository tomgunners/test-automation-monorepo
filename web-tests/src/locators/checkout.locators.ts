/**
 * Locators das páginas de Checkout (Step 1, Step 2 e confirmação).
 */
export const CheckoutLocators = {
  // Step 1 — Informações pessoais
  firstNameInput: '[data-test="firstName"]',
  lastNameInput: '[data-test="lastName"]',
  postalCodeInput: '[data-test="postalCode"]',
  continueButton: '[data-test="continue"]',
  cancelButton: '[data-test="cancel"]',
  errorMessage: '[data-test="error"]',

  // Step 2 — Resumo do pedido
  checkoutSummaryContainer: '.checkout_summary_container',
  cartItem: '.cart_item',
  itemTotal: '.summary_subtotal_label',
  tax: '.summary_tax_label',
  total: '.summary_total_label',
  finishButton: '[data-test="finish"]',

  // Confirmação
  confirmationContainer: '.checkout_complete_container',
  confirmationHeader: '.complete-header',
  confirmationText: '.complete-text',
  backToHomeButton: '[data-test="back-to-products"]'
} as const;
