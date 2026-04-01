import type { Options } from '@wdio/types';
import allure from '@wdio/allure-reporter';
import path   from 'path';
import dotenv from 'dotenv';
import fs     from 'fs';
import { setupAllure } from '../utils/allure-setup';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function clearAllureResults(): void {
  const dir = 'allure-results';
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// ── Configuração compartilhada ────────────────────────────────────────────────

export const sharedConfig: Partial<Options.Testrunner> = {

  runner: 'local',

  specs:   [path.join(__dirname, '..', 'tests', '**', '*.spec.ts')],
  exclude: [],

  maxInstances: 1,

  framework: 'mocha',
  mochaOpts: {
    ui:      'bdd',
    timeout: Number(process.env.TEST_TIMEOUT ?? 120000),
  },

  reporters: [
    ['spec', {
      addConsoleLogs:    true,
      realtimeReporting: true,
      color:             true,
    }],
    ['allure', {
      outputDir:                            'allure-results',
      disableWebdriverStepsReporting:       false,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter:              false,
    }],
  ],

  /**
   * Executado uma vez antes de todas as sessões.
   *
   * Ordem das operações:
   *   1. clearAllureResults() — apaga resultados anteriores (pasta recriada vazia)
   *   2. setupAllure()        — restaura history/ + escreve environment, executor, categories
   *   3. Recria diretórios de saída
   *
   * A ordem importa: clear ANTES de setup para não apagar os metadados recém-gerados.
   */
  onPrepare() {
    clearAllureResults();
    setupAllure();
    ensureDir('reports/screenshots');
  },

  beforeSuite(suite) {
    console.log(`\nIniciando: ${suite.title}`);
  },

  async afterTest(test, _ctx, { passed, error }) {
    if (passed) return;

    const testTitle = test.title ?? 'unknown_test';
    const safeTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // ── Screenshot ────────────────────────────────────────────────────────────
    try {
      const screenshotBase64 = await browser.takeScreenshot();

      if (screenshotBase64) {
        const screenshotDir = 'reports/screenshots';
        ensureDir(screenshotDir);

        const filePath    = path.join(screenshotDir, `${safeTitle}_${Date.now()}.png`);
        const imageBuffer = Buffer.from(screenshotBase64, 'base64');

        fs.writeFileSync(filePath, imageBuffer);

        await browser.call(async () => {
          allure.addAttachment(
            `Screenshot — ${testTitle}`,
            imageBuffer,
            'image/png',
          );
        });

        console.error(`[afterTest] Screenshot salvo: ${filePath}`);
      }
    } catch (screenshotErr) {
      console.error('[afterTest] Falha ao capturar screenshot:', screenshotErr);
    }

    // ── Log de erro ───────────────────────────────────────────────────────────
    try {
      const errorMessage = error?.message ?? 'Erro desconhecido';
      const errorStack   = error?.stack   ?? '';

      await browser.call(async () => {
        allure.addAttachment(
          `Error Log — ${testTitle}`,
          `Mensagem: ${errorMessage}\n\nStack:\n${errorStack}`,
          'text/plain',
        );
      });

      console.error(`\n[afterTest] Falha em "${testTitle}": ${errorMessage}`);
    } catch (logErr) {
      console.error('[afterTest] Falha ao registrar log no Allure:', logErr);
    }
  },

  onComplete(_exitCode, _config, _caps, results) {
    const failed = results?.failed ?? 0;
    const passed = results?.passed ?? 0;
    const total  = passed + failed;

    console.log('\n════════════════════════════════════════════════');
    console.log('  Suíte Mobile finalizada                       ');
    console.log('════════════════════════════════════════════════');
    console.log(`  Passou : ${passed}`);
    console.log(`  Falhou : ${failed}`);
    console.log(`  Total  : ${total}`);
    console.log('  Execute: [yarn report:allure] → relatório Allure');
    console.log('════════════════════════════════════════════════\n');
  },
};
