import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../config/options.js';

const PRODUCTS_PATH = '/products';


export const ProductsClient = {
  /**
   * GET /products — Lista todos os produtos com limite opcional.
   * @param {number} limit - Quantidade de produtos por página
   * @param {number} skip - Paginação
   */
  getAll(limit = 10, skip = 0) {
    const url = `${BASE_URL}${PRODUCTS_PATH}?limit=${limit}&skip=${skip}`;
    const response = http.get(url, {
      tags: { endpoint: 'get_all_products' }
    });

    check(response, {
      'GET /products — status 200': (r) => r.status === 200,
      'GET /products — body não vazio': (r) => r.body && r.body.length > 0,
      'GET /products — tem campo products': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.products);
        } catch {
          return false;
        }
      }
    });

    return response;
  },

  /**
   * GET /products/:id — Busca um produto pelo ID.
   * @param {number} id - ID do produto
   */
  getById(id) {
    const url = `${BASE_URL}${PRODUCTS_PATH}/${id}`;
    const response = http.get(url, {
      tags: { endpoint: 'get_product_by_id' }
    });

    check(response, {
      'GET /products/:id — status 200': (r) => r.status === 200,
      'GET /products/:id — tem campo id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return typeof body.id === 'number';
        } catch {
          return false;
        }
      }
    });

    return response;
  },

  /**
   * GET /products/search — Busca produtos por query string.
   * @param {string} query - Termo de busca
   */
  search(query) {
    const url = `${BASE_URL}${PRODUCTS_PATH}/search?q=${encodeURIComponent(query)}`;
    const response = http.get(url, {
      tags: { endpoint: 'search_products' }
    });

    check(response, {
      'GET /products/search — status 200': (r) => r.status === 200
    });

    return response;
  },

  /**
   * GET /products/categories — Lista todas as categorias.
   */
  getCategories() {
    const url = `${BASE_URL}${PRODUCTS_PATH}/categories`;
    const response = http.get(url, {
      tags: { endpoint: 'get_categories' }
    });

    check(response, {
      'GET /products/categories — status 200': (r) => r.status === 200
    });

    return response;
  }
};
