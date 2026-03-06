import type { Options } from '@wdio/types';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sharedConfig: Partial<Options.Testrunner> = {

  // ── Runner ─────────────────────────────────────────────────────────────────
  runner: 'local',

  // ── Specs ──────────────────────────────────────────────────────────────────
  specs: [path.join(__dirname, '..', 'tests', '**', '*.spec.ts')],
  exclude: [],

  // ── Paralelismo ────────────────────────────────────────────────────────────
  // 1 instância para testes locais com emulador/simulador único
  maxInstances: 1,

  // ── Framework ──────────────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: Number(process.env.TEST_TIMEOUT ?? 120000)
  },

  // ── Reporters ──────────────────────────────────────────────────────────────
  reporters: [
    // Saída no terminal durante a execução
    ['spec', {
      addConsoleLogs: true,
      realtimeReporting: true,
      color: true
    }],
    // Relatório Allure (gere com: yarn allure:generate)
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: false
    }]
  ],

  // ── Hooks ──────────────────────────────────────────────────────────────────

  /**
   * Executado uma vez antes de todas as sessões.
   * Cria os diretórios de saída necessários.
   */
  onPrepare() {
    const fs = require('fs') as typeof import('fs');

    if (fs.existsSync('allure-results')) {
      fs.rmSync('allure-results', { recursive: true, force: true });
    }

    for (const dir of ['reports/screenshots', 'allure-results']) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  },

  beforeSuite(suite) {
    console.log(`\nIniciando: ${suite.title}`);
  },

  /**
   * Executado após cada teste.
   * Captura screenshot automaticamente em falhas e anexa ao Allure.
   */
  async afterTest(_test, _ctx, { passed, error }) {
    if (!passed) {
      try {
        await browser.takeScreenshot();
        console.error(`\nFalha: ${error?.message ?? 'erro desconhecido'}`);
      } catch {
      }
    }
  },

  onComplete(_exitCode, _config, _caps, results) {
    const passed = results.passed ?? 0;
    const failed = results.failed ?? 0;
    console.log(`\nExecução finalizada — ${passed} passou(ram), ${failed} falhou(aram)`);
    if (failed > 0) {
      console.log('Relatório: yarn allure:generate && yarn allure:open');
    }
  }
};
