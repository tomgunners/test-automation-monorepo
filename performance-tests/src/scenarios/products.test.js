import { sleep, check } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { ProductsClient } from '../utils/products.client.js';
import { executionOptions, BASE_URL } from '../config/options.js';

// ─── Exporta opções de execução ───────────────────────────────────────────────
export const options = executionOptions;

// ─── Métricas customizadas ────────────────────────────────────────────────────
const listProductsTrend = new Trend('list_products_duration', true);
const getByIdTrend = new Trend('get_product_by_id_duration', true);
const searchTrend = new Trend('search_products_duration', true);
const categoriesTrend = new Trend('get_categories_duration', true);

// Taxa de erros de negócio — separada de http_req_failed (erro de rede/HTTP)
const errorRate = new Rate('custom_error_rate');

// Contadores por endpoint — mais rastreáveis que um único contador agregado
const listProductsCount = new Counter('total_list_products_requests');
const getByIdCount = new Counter('total_get_by_id_requests');
const searchCount = new Counter('total_search_requests');
const categoriesCount = new Counter('total_categories_requests');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * sleep com jitter — distribui a pausa aleatoriamente entre [min, max].
 * Evita que VUs acordem no mesmo milissegundo (ondas sincronizadas).
 */
function jitter(min, max) {
  sleep(min + Math.random() * (max - min));
}

/**
 * Registra a resposta de um endpoint nas métricas correspondentes.
 * Centraliza trend + counter + check + errorRate.
 * O ProductsClient NÃO executa checks internos — toda lógica de validação
 * está aqui para evitar dupla contagem nas métricas do k6.
 */
function recordMetrics(response, trend, counter, checkLabel) {
  trend.add(response.timings.duration);
  counter.add(1);

  const ok = check(response, {
    [`${checkLabel} → status 200`]: (r) => r.status === 200,
    [`${checkLabel} → body não vazio`]: (r) => r.body && r.body.length > 0,
  });

  errorRate.add(!ok);
}

/**
 * Setup: executado uma vez antes do início do teste.
 * Retorna dados compartilhados entre os VUs.
 */
export function setup() {
  const vus = parseInt(__ENV.VUS, 10);
  const duration = __ENV.DURATION;
  const isCustom = !isNaN(vus) && duration;

  const profileLabel = isCustom
    ? `CUSTOM (VUS=${vus} DURATION=${duration})`
    : (__ENV.STAGES_PROFILE || 'load').toUpperCase();

  console.log('════════════════════════════════════════════════');
  console.log('  Teste de Performance — Products API (k6)      ');
  console.log('════════════════════════════════════════════════');
  console.log(`  Perfil   : ${profileLabel}`);
  console.log(`  Base URL : ${BASE_URL}`);
  console.log(`  Início   : ${new Date().toISOString()}`);
  console.log('════════════════════════════════════════════════');

  // ── Verificação rapida da API ───────────────────────────────────────────────────────────
  const probe = ProductsClient.getAll(1, 0);
  if (probe.status !== 200) {
    throw new Error(
      `[setup] API indisponível antes do teste. Status: ${probe.status}. Abortando.`
    );
  }

  console.log('Smoke check: API OK');

  return {
    startTime: new Date().toISOString(),
    baseUrl: BASE_URL,
    profile: profileLabel,
  };
}

// ─── Função principal — executada por cada VU a cada iteração ────────────────
//
//  Fluxo simulado (jornada de usuário navegando produtos):
//    1. Lista produtos       → sempre        (comportamento mais frequente)
//    2. Busca produto por ID → sempre        (detalhe de item)
//    3. Busca por termo      → 50% iterações (comportamento de busca)
//    4. Lista categorias     → 20% iterações (navegação por categoria)
//
//  Cada etapa tem pausa com jitter para simular tempo de leitura/interação
//  e evitar ondas sincronizadas com 500 VUs concorrentes.
// ─────────────────────────────────────────────────────────────────────────────
export default function () {

  // ── 1. Listar produtos ─────────────────────────────────────────────────────
  const listResponse = ProductsClient.getAll(10, 0);
  recordMetrics(listResponse, listProductsTrend, listProductsCount, 'GET /products');

  jitter(0.8, 1.5);

  // ── 2. Buscar produto por ID aleatório ─────────────────────────────────────
  const randomId = Math.floor(Math.random() * 100) + 1;
  const getByIdResponse = ProductsClient.getById(randomId);
  recordMetrics(getByIdResponse, getByIdTrend, getByIdCount, `GET /products/${randomId}`);

  jitter(0.3, 0.8); // simula tempo de visualização do detalhe

  // ── 3. Busca por termo — 50% das iterações ─────────────────────────────────
  if (Math.random() < 0.5) {
    const searchTerms = ['phone', 'laptop', 'shirt', 'watch', 'bag'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const searchResponse = ProductsClient.search(term);
    recordMetrics(searchResponse, searchTrend, searchCount, `GET /products/search?q=${term}`);

    jitter(0.3, 0.7); 
  }

  // ── 4. Listar categorias — 20% das iterações ───────────────────────────────
  if (Math.random() < 0.2) {
    const categoriesResponse = ProductsClient.getCategories();
    recordMetrics(categoriesResponse, categoriesTrend, categoriesCount, 'GET /products/categories');

    jitter(0.2, 0.5);
  }
}

// ─── Teardown ─────────────────────────────────────────────────────────────────
/**
 * Executado UMA vez após todos os VUs finalizarem.
 * Recebe os dados retornados pelo setup() via parâmetro data.
 */
export function teardown(data) {
  console.log('\n════════════════════════════════════════════════');
  console.log('  Execução finalizada                           ');
  console.log('════════════════════════════════════════════════');
  console.log(`  Perfil  : ${data.profile}`);
  console.log(`  Início  : ${data.startTime}`);
  console.log(`  Fim     : ${new Date().toISOString()}`);
  console.log(`  API     : ${data.baseUrl}`);
  console.log('');
  console.log('  Endpoints monitorados:');
  console.log('    • GET /products            (list_products_duration)');
  console.log('    • GET /products/:id        (get_product_by_id_duration)');
  console.log('    • GET /products/search     (search_products_duration)');
  console.log('    • GET /products/categories (get_categories_duration)');
  console.log('');
  console.log('  Consulte o relatório para análise de gargalos:');
  console.log('    yarn test:perf:report  → sumário no terminal');
  console.log('    results/report.html    → relatório visual completo');
  console.log('════════════════════════════════════════════════\n');
}

// ─── handleSummary ────────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    'results/report.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}
