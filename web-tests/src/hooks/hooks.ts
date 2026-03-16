import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
  setDefaultTimeout,
  Status
} from '@cucumber/cucumber';

import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { CustomWorld } from './world';
import { config } from '../config/env.config';

import * as fs from 'fs';
import * as path from 'path';

setWorldConstructor(CustomWorld);
setDefaultTimeout(config.timeouts.default);

let sharedBrowser: Browser;

function clearDir(dir: string): void {
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      fs.rmSync(path.join(dir, file), { recursive: true, force: true });
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

BeforeAll(async function () {
  clearDir('allure-results');

  for (const dir of ['test-results', 'test-results/screenshots']) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const browserType =
    config.browser.type === 'firefox'
      ? firefox
      : config.browser.type === 'webkit'
        ? webkit
        : chromium;

  sharedBrowser = await browserType.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: ['--start-maximized']
  });
});

// Cada cenário recebe um novo BrowserContext + nova Page para isolamento total.
// O browser em si é reutilizado entre cenários para reduzir tempo de inicialização.
Before(async function (this: CustomWorld, { pickle }) {
  this.scenarioName = pickle.name;
  this.browser = sharedBrowser;

  this.context = await sharedBrowser.newContext({
    viewport: null,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeouts.default);

  this.initPages();
});

After(async function (this: CustomWorld, { result, pickle }) {
  if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
      const safeName = pickle.name.replace(/[^a-z0-9]/gi, '_');
      const screenshotPath = path.join(
        'test-results',
        'screenshots',
        `${safeName}_${Date.now()}.png`
      );
      fs.writeFileSync(screenshotPath, screenshot);
      console.error(`Screenshot salvo: ${screenshotPath}`);
    } catch (err) {
      console.error('Erro ao capturar screenshot', err);
    }
  }

  // Fecha o contexto ao final de cada cenário — descarta cookies, storage e estado.
  // Não é necessário limpar manualmente localStorage/sessionStorage pois o contexto
  // é destruído e recriado a cada cenário.
  await this.context?.close();
});

AfterAll(async function () {
  await sharedBrowser?.close();

  console.log('\nSuíte de testes Web finalizada.');
  console.log('Execute o comando: [yarn test:web:report] para acessar o relatório pelo cucumber');
  console.log('Execute o comando: [yarn test:web:allure] para acessar o relatório pelo allure');
});
