/**
 * Locators da página de Inventário (lista de produtos).
 */
export const InventoryLocators = {
  pageTitle: '.title',
  inventoryContainer: '.inventory_container',
  inventoryItem: '.inventory_item',
  itemName: '.inventory_item_name',
  itemPrice: '.inventory_item_price',
  addToCartButton: '[data-test^="add-to-cart"]',
  removeFromCartButton: '[data-test^="remove"]',
  cartBadge: '.shopping_cart_badge',
  cartLink: '.shopping_cart_link',
  sortDropdown: '[data-test="product_sort_container"]',

  // Seletor dinâmico por nome de produto
  addToCartByName: (productName: string) =>
    `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,

  removeByName: (productName: string) =>
    `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`
} as const;
