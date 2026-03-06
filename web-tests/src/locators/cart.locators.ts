/**
 * Locators da página do Carrinho de Compras.
 */
export const CartLocators = {
  pageTitle: '.title',
  cartContainer: '.cart_contents_container',
  cartItem: '.cart_item',
  cartItemName: '.inventory_item_name',
  cartItemPrice: '.inventory_item_price',
  cartItemQuantity: '.cart_quantity',
  removeButton: '[data-test^="remove"]',
  continueShoppingButton: '[data-test="continue-shopping"]',
  checkoutButton: '[data-test="checkout"]',
  cartBadge: '.shopping_cart_badge'
} as const;
