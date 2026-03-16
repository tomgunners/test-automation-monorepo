import http from 'k6/http';
import { BASE_URL } from '../config/options.js';

const PRODUCTS_PATH = '/products';

// O ProductsClient executa APENAS as requisições HTTP e retorna a Response.
// Toda a lógica de check() e métricas está centralizada em recordMetrics()
// no arquivo de cenário — evita dupla contagem nas métricas do k6.
export const ProductsClient = {
  /**
   * GET /products — Lista todos os produtos com limite opcional.
   * @param {number} limit - Quantidade de produtos por página
   * @param {number} skip - Paginação
   */
  getAll(limit = 10, skip = 0) {
    const url = `${BASE_URL}${PRODUCTS_PATH}?limit=${limit}&skip=${skip}`;
    return http.get(url, {
      tags: { endpoint: 'get_all_products' }
    });
  },

  /**
   * GET /products/:id — Busca um produto pelo ID.
   * @param {number} id - ID do produto
   */
  getById(id) {
    const url = `${BASE_URL}${PRODUCTS_PATH}/${id}`;
    return http.get(url, {
      tags: { endpoint: 'get_product_by_id' }
    });
  },

  /**
   * GET /products/search — Busca produtos por query string.
   * @param {string} query - Termo de busca
   */
  search(query) {
    const url = `${BASE_URL}${PRODUCTS_PATH}/search?q=${encodeURIComponent(query)}`;
    return http.get(url, {
      tags: { endpoint: 'search_products' }
    });
  },

  /**
   * GET /products/categories — Lista todas as categorias.
   */
  getCategories() {
    const url = `${BASE_URL}${PRODUCTS_PATH}/categories`;
    return http.get(url, {
      tags: { endpoint: 'get_categories' }
    });
  }
};
