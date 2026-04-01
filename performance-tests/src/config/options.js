/**
 * Configuração central do k6
 *
 * Todas as variáveis de carga são lidas do .env via k6-runner.js,
 * que as injeta como --env KEY=VALUE antes de executar o k6.
 *
 * Variáveis de ambiente:
 *
 *   BASE_URL       — URL alvo            (padrão: https://dummyjson.com)
 *   STAGES_PROFILE — Perfil ativo:
 *                      smoke → 2 VUs / 30s — sanity check rápido (padrão no CI)
 *                      load  → 500 VUs / 5m — baseline de performance
 *                      spike → pico de 1000 VUs — teste de burst
 *                      soak  → 200 VUs / 30m — endurance / memory leak
 *   VUS + DURATION — Modo custom: sobrescreve o perfil selecionado
 */

export const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

// ─── Thresholds de SLA — perfis de carga real ─────────────────────────────────
//
//  Usados pelos perfis load, spike e soak.
//  abortOnFail: true + delayAbortEval: '30s' garante abort imediato
//  ao detectar violação, evitando falso positivo no ramp-up.
// ─────────────────────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  http_req_duration: [
    { threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '30s' },
    { threshold: 'p(99)<5000', abortOnFail: true, delayAbortEval: '30s' },
  ],
  http_req_failed: [
    { threshold: 'rate<0.02', abortOnFail: true, delayAbortEval: '30s' },
  ],
  http_reqs: [
    { threshold: 'rate>100', abortOnFail: true, delayAbortEval: '30s' },
  ],
  list_products_duration: [
    { threshold: 'p(95)<1500', abortOnFail: true, delayAbortEval: '30s' },
  ],
  get_product_by_id_duration: [
    { threshold: 'p(95)<1500', abortOnFail: true, delayAbortEval: '30s' },
  ],
  search_products_duration: [
    { threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '30s' },
  ],
  get_categories_duration: [
    { threshold: 'p(95)<1500', abortOnFail: true, delayAbortEval: '30s' },
  ],
  custom_error_rate: [
    { threshold: 'rate<0.02', abortOnFail: true, delayAbortEval: '30s' },
  ],
};

// ─── Thresholds do perfil SMOKE ───────────────────────────────────────────────
//
//  Objetivo: verificar que a API está respondendo corretamente, não medir
//  performance. Thresholds intencionalmente relaxados — a finalidade é
//  detectar falhas funcionais (status != 200, body vazio), não SLA.
//
//  Não possui threshold de throughput (rate>N) pois com 2 VUs o volume
//  de requisições é propositalmente baixo.
// ─────────────────────────────────────────────────────────────────────────────
export const SMOKE_THRESHOLDS = {
  http_req_duration: [
    { threshold: 'p(95)<5000', abortOnFail: true },
  ],
  http_req_failed: [
    { threshold: 'rate<0.05', abortOnFail: true },
  ],
  custom_error_rate: [
    { threshold: 'rate<0.05', abortOnFail: true },
  ],
};

// ─── Perfis de carga ──────────────────────────────────────────────────────────

// ── SMOKE — sanity check rápido (padrão no CI) ────────────────────────────────
//
//  2 VUs por 30 segundos em modo constant-vus.
//  Objetivo: confirmar que todos os endpoints respondem com status 200
//  e body não vazio — sem simular carga real.
//  Tempo de execução: ~30s
const PROFILE_SMOKE = {
  executor: 'constant-vus',
  vus:      parseInt(__ENV.SMOKE_VUS      || '2'),
  duration: __ENV.SMOKE_DURATION          || '30s',
  gracefulStop: '5s',
};

// ── LOAD — carga sustentada ───────────────────────────────────────────────────
//  500 VUs por 5 min. Detecta gargalos sob tráfego normal.
//  Tempo de execução: ~6m30s
const PROFILE_LOAD = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: __ENV.LOAD_RAMPUP_DURATION   || '1m',  target: parseInt(__ENV.LOAD_MAX_VUS || '500') },
    { duration: __ENV.LOAD_SUSTAIN_DURATION  || '5m',  target: parseInt(__ENV.LOAD_MAX_VUS || '500') },
    { duration: __ENV.LOAD_RAMPDOWN_DURATION || '30s', target: 0 },
  ],
  gracefulRampDown: '30s',
};

// ── SPIKE — pico repentino ────────────────────────────────────────────────────
//  1000 VUs por 30s. Detecta rate limiting, pool esgotado, GC pressure.
//  Tempo de execução: ~2m30s
const PROFILE_SPIKE = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: __ENV.SPIKE_BASELINE_DURATION || '30s', target: parseInt(__ENV.SPIKE_BASELINE_VUS || '50')   },
    { duration: __ENV.SPIKE_PEAK_DURATION     || '30s', target: parseInt(__ENV.SPIKE_PEAK_VUS    || '1000') },
    { duration: __ENV.SPIKE_RECOVERY_DURATION || '30s', target: parseInt(__ENV.SPIKE_BASELINE_VUS || '50')   },
    { duration: __ENV.SPIKE_RECOVERY_DURATION || '30s', target: parseInt(__ENV.SPIKE_BASELINE_VUS || '50')   },
    { duration: '15s',                                  target: 0 },
  ],
  gracefulRampDown: '10s',
};

// ── SOAK — endurance ──────────────────────────────────────────────────────────
//  200 VUs por 30 min. Detecta memory leak, degradação temporal.
//  Tempo de execução: ~32m
const PROFILE_SOAK = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: __ENV.SOAK_RAMPUP_DURATION   || '2m',  target: parseInt(__ENV.SOAK_MAX_VUS || '200') },
    { duration: __ENV.SOAK_SUSTAIN_DURATION  || '28m', target: parseInt(__ENV.SOAK_MAX_VUS || '200') },
    { duration: __ENV.SOAK_RAMPDOWN_DURATION || '2m',  target: 0 },
  ],
  gracefulRampDown: '30s',
};

// ─── Seleção de perfil ────────────────────────────────────────────────────────

function selectProfile() {
  const name = (__ENV.STAGES_PROFILE || 'smoke').toLowerCase();

  const profiles = {
    smoke: PROFILE_SMOKE,
    load:  PROFILE_LOAD,
    spike: PROFILE_SPIKE,
    soak:  PROFILE_SOAK,
  };

  if (!profiles[name]) {
    console.warn(`[k6] Perfil desconhecido: "${name}". Usando "smoke".`);
    return PROFILE_SMOKE;
  }

  return profiles[name];
}

// ─── Suporte a VUS/DURATION custom ───────────────────────────────────────────
//  Sobrescreve qualquer perfil quando ambas as variáveis estão definidas.

function buildScenario() {
  const vus      = parseInt(__ENV.VUS, 10);
  const duration = __ENV.DURATION;

  if (!isNaN(vus) && duration) {
    return { executor: 'constant-vus', vus, duration, gracefulStop: '30s' };
  }

  return selectProfile();
}

// ─── Seleciona thresholds de acordo com o perfil ─────────────────────────────

function selectThresholds() {
  const vus      = parseInt(__ENV.VUS, 10);
  const duration = __ENV.DURATION;
  const name     = (__ENV.STAGES_PROFILE || 'smoke').toLowerCase();

  // Custom VUS/DURATION: usa thresholds de carga real
  if (!isNaN(vus) && duration) return THRESHOLDS;

  return name === 'smoke' ? SMOKE_THRESHOLDS : THRESHOLDS;
}

// ─── Exporta opções finais ────────────────────────────────────────────────────
export const executionOptions = {
  scenarios:  { products_api: buildScenario() },
  thresholds: selectThresholds(),
};
