/**
 * Cucumber profiles disponíveis:
 *
 *   default    — todos os cenários (usado pelo CI e por `yarn test`)
 *   smoke      — apenas cenários marcados com @smoke (críticos, rápidos)
 *   regression — todos os cenários marcados com @regression (cobertura completa)
 *   allure     — igual ao default, mas sem retry (útil para gerar relatório limpo)
 *
 * Como rodar por tag na linha de comando:
 *   yarn test             → perfil default (todos)
 *   yarn test:smoke       → apenas @smoke
 *   yarn test:regression  → apenas @regression
 *
 * Ou passando a tag diretamente:
 *   cd web-tests && npx cucumber-js --tags "@smoke"
 *   cd web-tests && npx cucumber-js --tags "@regression and not @wip"
 *
 * Nota: o formatter `verbose` foi removido no @cucumber/cucumber v10.
 * Usando `progress` (steps em tempo real) + `summary` (resultado completo ao final).
 */

const BASE_FORMAT = [
  'progress',
  'summary',
  'html:test-results/cucumber-report.html',
  'json:test-results/cucumber-report.json',
  'allure-cucumberjs/reporter',
];

const BASE_FORMAT_OPTIONS = { resultsDir: 'allure-results' };

const BASE_REQUIRES = {
  paths: ['src/features/**/*.feature'],
  require: ['src/hooks/**/*.ts', 'src/steps/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: BASE_FORMAT,
  formatOptions: BASE_FORMAT_OPTIONS,
  publish: false,
};

module.exports = {
  // ── Perfil padrão: todos os cenários ─────────────────────────────────────
  default: {
    ...BASE_REQUIRES,
    retry: 1,
  },

  // ── Smoke: cenários críticos, execução rápida (ex.: validação pós-deploy) ─
  smoke: {
    ...BASE_REQUIRES,
    tags: '@smoke',
    retry: 0,
  },

  // ── Regression: cobertura completa (ex.: antes de releases) ──────────────
  regression: {
    ...BASE_REQUIRES,
    tags: '@regression',
    retry: 1,
  },

  // ── Allure: igual ao default, sem retry (útil para relatório estável) ────
  allure: {
    ...BASE_REQUIRES,
    retry: 0,
  },
};