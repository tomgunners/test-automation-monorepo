/**
 * Configuração central do k6
 * 
 * Todas as variáveis de carga são lidas do .env via k6-runner.js,
 * que as injeta como --env KEY=VALUE antes de executar o k6.
 *
 * Variáveis de ambiente disponíveis:
 *
 *   BASE_URL              — URL alvo (padrão: https://dummyjson.com)
 *   STAGES_PROFILE        — Perfil ativo: load | spike | soak (padrão: load)
 *   VUS + DURATION        — Modo custom: sobrescreve o perfil selecionado
 */

export const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

// ─── Thresholds de SLA ────────────────────────────────────────────────────────
//
//  abortOnFail: true     → aborta o teste imediatamente ao detectar violação
//                          e sai com exit code 99 (quebra o pipeline no CI)
//  delayAbortEval: '30s' → aguarda 30s antes de avaliar — evita falso positivo
//                          durante o ramp-up quando há poucos dados amostrados
// ─────────────────────────────────────────────────────────────────────────────
export const THRESHOLDS = {

  // ── Latência HTTP nativa do k6 ──────────────────────────────────────────────
  http_req_duration: [
    { threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '30s' },
    { threshold: 'p(99)<5000', abortOnFail: true, delayAbortEval: '30s' },
  ],

  // ── Confiabilidade ──────────────────────────────────────────────────────────
  http_req_failed: [
    { threshold: 'rate<0.02',  abortOnFail: true, delayAbortEval: '30s' },
  ],

  // ── Throughput mínimo ───────────────────────────────────────────────────────
  http_reqs: [
    { threshold: 'rate>100',   abortOnFail: true, delayAbortEval: '30s' },
  ],

  // ── Métricas customizadas por endpoint ─────────────────────────────────────
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

  // ── Taxa de erros de negócio ────────────────────────────────────────────────
  custom_error_rate: [
    { threshold: 'rate<0.02',  abortOnFail: true, delayAbortEval: '30s' },
  ],
};

// ─── Perfis de carga ──────────────────────────────────────────────────────────
//  Todos os valores são lidos do __ENV (injetados pelo k6-runner.js via .env).
//  Os fallbacks (|| 'valor') garantem funcionamento mesmo sem o .env,
//  mantendo os mesmos valores padrão documentados no arquivo.
// ─────────────────────────────────────────────────────────────────────────────


const PROFILE_LOAD = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    {
      duration: __ENV.LOAD_RAMPUP_DURATION   || '1m',
      target:   parseInt(__ENV.LOAD_MAX_VUS  || '500'),  // ramp-up gradual
    },
    {
      duration: __ENV.LOAD_SUSTAIN_DURATION  || '5m',
      target:   parseInt(__ENV.LOAD_MAX_VUS  || '500'),  // carga plena sustentada
    },
    {
      duration: __ENV.LOAD_RAMPDOWN_DURATION || '30s',
      target:   0,                                        // ramp-down controlado
    },
  ],
  gracefulRampDown: '30s',
};

const PROFILE_SPIKE = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    {
      duration: __ENV.SPIKE_BASELINE_DURATION || '30s',
      target:   parseInt(__ENV.SPIKE_BASELINE_VUS || '50'),   // baseline estável
    },
    {
      duration: __ENV.SPIKE_PEAK_DURATION     || '30s',
      target:   parseInt(__ENV.SPIKE_PEAK_VUS || '1000'),     // pico abrupto
    },
    {
      duration: __ENV.SPIKE_RECOVERY_DURATION || '30s',
      target:   parseInt(__ENV.SPIKE_BASELINE_VUS || '50'),   // queda rápida
    },
    {
      duration: __ENV.SPIKE_RECOVERY_DURATION || '30s',
      target:   parseInt(__ENV.SPIKE_BASELINE_VUS || '50'),   // observa recuperação
    },
    {
      duration: '15s',
      target:   0,                                             // encerramento
    },
  ],
  gracefulRampDown: '10s',
};

const PROFILE_SOAK = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    {
      duration: __ENV.SOAK_RAMPUP_DURATION   || '2m',
      target:   parseInt(__ENV.SOAK_MAX_VUS  || '200'),  // aquecimento devagar
    },
    {
      duration: __ENV.SOAK_SUSTAIN_DURATION  || '28m',
      target:   parseInt(__ENV.SOAK_MAX_VUS  || '200'),  // carga sustentada
    },
    {
      duration: __ENV.SOAK_RAMPDOWN_DURATION || '2m',
      target:   0,                                        // resfriamento
    },
  ],
  gracefulRampDown: '30s',
};

// ─── Seleciona o perfil via variável de ambiente ──────────────────────────────
function selectProfile() {
  const profileName = (__ENV.STAGES_PROFILE || 'load').toLowerCase();

  const profiles = {
    load:  PROFILE_LOAD,
    spike: PROFILE_SPIKE,
    soak:  PROFILE_SOAK,
  };

  const profile = profiles[profileName];

  if (!profile) {
    console.warn(`[k6] Perfil desconhecido: "${profileName}". Usando "load".`);
    return PROFILE_LOAD;
  }

  return profile;
}

// ─── Suporte a VUS/DURATION custom (sobrescreve o perfil) ────────────────────
function buildScenario() {
  const vus      = parseInt(__ENV.VUS, 10);
  const duration = __ENV.DURATION;

  if (!isNaN(vus) && duration) {
    return {
      executor:     'constant-vus',
      vus,
      duration,
      gracefulStop: '30s',
    };
  }

  return selectProfile();
}

// ─── Exporta as opções finais ─────────────────────────────────────────────────
export const executionOptions = {
  scenarios: {
    products_api: buildScenario(),
  },
  thresholds: THRESHOLDS,
};