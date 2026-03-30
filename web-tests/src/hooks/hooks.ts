import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';

import { chromium, firefox, webkit, type Browser } from 'playwright';
import { CustomWorld } from './world';
import { config }      from '../config/env.config';
import { setupWebAllure } from '../utils/allure-setup';

import fs   from 'fs';
import path from 'path';

setWorldConstructor(CustomWorld);
setDefaultTimeout(config.timeouts.default);

let sharedBrowser: Browser;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Remove TUDO de execuções anteriores e recria a pasta vazia.
 * setupWebAllure() chamado logo após restaura history/ e reescreve os metadados,
 * portanto a ordem importa: clear ANTES de setup.
 */
function clearAllureResults(): void {
  const dir = 'allure-results';
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolveBrowserType() {
  if (config.browser.type === 'firefox') return firefox;
  if (config.browser.type === 'webkit')  return webkit;
  return chromium;
}

// ── BeforeAll ─────────────────────────────────────────────────────────────────
// Timeout explícito obrigatório — setDefaultTimeout não se aplica a BeforeAll.
BeforeAll({ timeout: 60_000 }, async function () {
  clearAllureResults();
  setupWebAllure();

  ensureDir('test-results');
  ensureDir('test-results/screenshots');

  sharedBrowser = await resolveBrowserType().launch({
    headless: config.browser.headless,
    slowMo:   config.browser.slowMo,
    args:     ['--start-maximized'],
  });
});

// ── Before ────────────────────────────────────────────────────────────────────
Before(async function (this: CustomWorld, { pickle }) {
  this.scenarioName = pickle.name;
  this.browser      = sharedBrowser;

  this.context = await sharedBrowser.newContext({
    viewport:   null,
    locale:     'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeouts.default);

  this.initPages();
});

// ── After ─────────────────────────────────────────────────────────────────────
After(async function (this: CustomWorld, { result, pickle }) {
  if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
    try {
      const screenshot     = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');

      const safeName       = pickle.name.replace(/[^a-z0-9]/gi, '_');
      const screenshotPath = path.join(
        'test-results', 'screenshots',
        `${safeName}_${Date.now()}.png`,
      );
      fs.writeFileSync(screenshotPath, screenshot);
      console.error(`Screenshot salvo: ${screenshotPath}`);
    } catch (err) {
      console.error('Erro ao capturar screenshot:', err);
    }
  }

  await this.context?.close();
});

// ── AfterAll ──────────────────────────────────────────────────────────────────
AfterAll({ timeout: 30_000 }, async function () {
  await sharedBrowser?.close();

  console.log('\nSuíte de testes Web finalizada.');
  console.log('Execute: [yarn test:web:report] → relatório Cucumber');
  console.log('Execute: [yarn test:web:allure] → relatório Allure');
});
