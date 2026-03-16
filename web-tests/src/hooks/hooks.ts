import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';

import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { CustomWorld } from './world';
import { config }      from '../config/env.config';
import { setupAllure } from '../utils/allure-setup';

import * as fs   from 'fs';
import * as path from 'path';

setWorldConstructor(CustomWorld);
setDefaultTimeout(config.timeouts.default);

let sharedBrowser: Browser;

// ── Limpeza completa de allure-results ───────────────────────────────────────
// Remove TUDO de execuções anteriores. O setupAllure() chamado logo após
// restaura history/ de allure-report/history e reescreve os metadados.
function clearAllureResults(): void {
  const dir = 'allure-results';
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// ── BeforeAll ─────────────────────────────────────────────────────────────────
// Timeout explícito obrigatório — setDefaultTimeout não se aplica a BeforeAll.
//
// Ordem das operações:
//   1. clearAllureResults() — apaga resultados anteriores (pasta recriada vazia)
//   2. setupAllure()        — restaura history/ + escreve environment, executor, categories
//   3. Cria demais diretórios e inicia o browser
//
// A ordem importa: se setupAllure() viesse antes, o clearAllureResults()
// apagaria environment.properties, executor.json e categories.json recém-criados.
BeforeAll({ timeout: 60_000 }, async function () {
  // 1. Limpa tudo — pasta allure-results/ recriada vazia
  clearAllureResults();

  // 2. Setup do Allure: restaura history/ de allure-report/history + gera metadados
  setupAllure();

  // 3. Cria diretórios de saída
  for (const dir of ['test-results', 'test-results/screenshots']) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // 4. Inicia o browser
  const browserType =
    config.browser.type === 'firefox'
      ? firefox
      : config.browser.type === 'webkit'
        ? webkit
        : chromium;

  sharedBrowser = await browserType.launch({
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
