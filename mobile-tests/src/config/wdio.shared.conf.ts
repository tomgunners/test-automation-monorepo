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
  maxInstances: 1,

  // ── Framework ──────────────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: Number(process.env.TEST_TIMEOUT ?? 120000)
  },

  // ── Reporters ──────────────────────────────────────────────────────────────
  reporters: [
    ['spec', {
      addConsoleLogs: true,
      realtimeReporting: true,
      color: true
    }],
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
   * Limpa allure-results para evitar contaminação de execuções anteriores
   * e recria os diretórios de saída necessários.
   */
  onPrepare() {
    const fs = require('fs') as typeof import('fs');

    // Limpa allure-results — mesmo padrão do web-tests
    if (fs.existsSync('allure-results')) {
      fs.rmSync('allure-results', { recursive: true, force: true });
    }

    // Recria os diretórios necessários
    for (const dir of ['reports/screenshots', 'allure-results']) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  },

  beforeSuite(suite) {
    console.log(`\nIniciando: ${suite.title}`);
  },

  /**
   * Executado após cada teste.
   * Em falhas: captura screenshot, anexa ao Allure e registra o log de erro.
   */
  async afterTest(test, _ctx, { passed, error }) {
    if (!passed) {
      const testTitle = test.title ?? 'unknown_test';

      // ── Screenshot ────────────────────────────────────────────────────────
      try {
        const screenshotBase64 = await browser.takeScreenshot();

        if (screenshotBase64) {
          const fs   = require('fs')   as typeof import('fs');
          const path = require('path') as typeof import('path');

          const safeTitle     = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const screenshotDir = 'reports/screenshots';

          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }

          const filePath = path.join(screenshotDir, `${safeTitle}_${Date.now()}.png`);
          fs.writeFileSync(filePath, Buffer.from(screenshotBase64, 'base64'));

          // Anexa ao Allure como imagem inline
          await browser.call(async () => {
            const allure = require('@wdio/allure-reporter').default;
            allure.addAttachment(
              `Screenshot — ${testTitle}`,
              Buffer.from(screenshotBase64, 'base64'),
              'image/png'
            );
          });

          console.error(`[afterTest] Screenshot salvo: ${filePath}`);
        }
      } catch (screenshotErr) {
        console.error('[afterTest] Falha ao capturar screenshot:', screenshotErr);
      }

      // ── Error Log ─────────────────────────────────────────────────────────
      try {
        const errorMessage = error?.message ?? 'Erro desconhecido';
        const errorStack   = error?.stack   ?? '';

        await browser.call(async () => {
          const allure = require('@wdio/allure-reporter').default;
          allure.addAttachment(
            `Error Log — ${testTitle}`,
            `Mensagem: ${errorMessage}\n\nStack:\n${errorStack}`,
            'text/plain'
          );
        });

        console.error(`\n[afterTest] Falha em "${testTitle}": ${errorMessage}`);
      } catch (logErr) {
        console.error('[afterTest] Falha ao registrar log no Allure:', logErr);
      }
    }
  },

  onComplete(_exitCode, _config, _caps, results) {
    const failed = results?.failed ?? 0;
    const passed = results?.passed ?? 0;
    const total  = passed + failed;

    console.log('\n════════════════════════════════════════════════');
    console.log('  Suíte Mobile finalizada                       ');
    console.log('════════════════════════════════════════════════');
    console.log(`Passou : ${passed}`);
    console.log(`Falhou : ${failed}`);
    console.log(`Total  : ${total}`);
    console.log('Execute o comando: [yarn test:mobile:allure] para acessar o relatório');
    console.log('════════════════════════════════════════════════\n');
  }
};