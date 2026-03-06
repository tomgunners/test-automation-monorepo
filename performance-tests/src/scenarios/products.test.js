import { sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { ProductsClient } from '../utils/products.client.js';
import { executionOptions } from '../config/options.js';

// ─── Exporta opções de execução ───────────────────────────────────────────────
export const options = executionOptions;

// ─── Métricas customizadas ────────────────────────────────────────────────────
const listProductsTrend = new Trend('list_products_duration', true);
const getByIdTrend = new Trend('get_product_by_id_duration', true);
const searchTrend = new Trend('search_products_duration', true);
const errorRate = new Rate('custom_error_rate');
const requestCount = new Counter('total_requests');

/**
 * Setup: executado uma vez antes do início do teste.
 * Retorna dados compartilhados entre os VUs.
 */
export function setup() {
  console.log('Iniciando teste de performance — Products API');
  console.log(`Base URL: ${__ENV.BASE_URL || 'https://dummyjson.com'}`);
  return { startTime: new Date().toISOString() };
}

/**
 * Função principal — executada por cada VU a cada iteração.
 * Simula um usuário navegando pela lista de produtos.
 */
export default function () {
  // Cenário 1: Listar produtos (comportamento mais frequente)
  const listResponse = ProductsClient.getAll(10, 0);
  listProductsTrend.add(listResponse.timings.duration);
  errorRate.add(listResponse.status !== 200);
  requestCount.add(1);

  sleep(1); // Pausa de 1s simulando comportamento humano

  // Cenário 2: Buscar produto por ID aleatório (1-100)
  const randomId = Math.floor(Math.random() * 100) + 1;
  const getByIdResponse = ProductsClient.getById(randomId);
  getByIdTrend.add(getByIdResponse.timings.duration);
  errorRate.add(getByIdResponse.status !== 200);
  requestCount.add(1);

  sleep(0.5);

  // Cenário 3: Buscar por termo de pesquisa (50% dos VUs)
  if (Math.random() < 0.5) {
    const searchTerms = ['phone', 'laptop', 'shirt', 'watch', 'bag'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchResponse = ProductsClient.search(term);
    searchTrend.add(searchResponse.timings.duration);
    errorRate.add(searchResponse.status !== 200);
    requestCount.add(1);

    sleep(0.5);
  }

  // Cenário 4: Listar categorias (20% dos VUs)
  if (Math.random() < 0.2) {
    const categoriesResponse = ProductsClient.getCategories();
    errorRate.add(categoriesResponse.status !== 200);
    requestCount.add(1);
  }
}

/**
 * Teardown: executado uma vez após o final do teste.
 */
export function teardown(data) {
  console.log('Suíte de testes de Performance finalizada.');
  console.log(`Início      : ${data.startTime}`);
  console.log('Execute o comando: [yarn test:perf:report] para acessar o relatório');
}

/**
 * handleSummary: gera relatórios em HTML e texto ao final do teste.
 */
export function handleSummary(data) {
  return {
    'results/report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'results/summary.json': JSON.stringify(data, null, 2)
  };
}
