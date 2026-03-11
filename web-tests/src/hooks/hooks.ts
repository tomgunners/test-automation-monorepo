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
let sharedContext: BrowserContext;
let sharedPage: Page;

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
    headless: config.browser.headless,    // removido inversão do headless
    slowMo: config.browser.slowMo,
    args: ['--start-maximized']     //adicionado args para maximizar a tela do browser
  });

  sharedContext = await sharedBrowser.newContext({
    viewport: null,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });

  // usa a mesma aba para todos os testes
  sharedPage = await sharedContext.newPage();
  sharedPage.setDefaultTimeout(config.timeouts.default);
});


Before(async function (this: CustomWorld, { pickle }) {

  this.scenarioName = pickle.name;
  this.browser = sharedBrowser;
  this.context = sharedContext;
  this.page = sharedPage;

  // volta para estado neutro
  if (!sharedPage.isClosed()) {
    await sharedPage.goto('about:blank');
  }

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

  // limpa estado da aplicação (uma única vez)
  try {
    if (this.page && !this.page.isClosed()) {
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await sharedContext.clearCookies();
    }
  } catch {
    // ignorar se a página estiver em about:blank ou navegação pendente
  }
});

AfterAll(async function () {
  await sharedContext?.close();
  await sharedBrowser?.close();

  console.log('\nSuíte de testes Web finalizada.');
  console.log('Execute o comando: [yarn test:web:report] para acessar o relatório pelo cucumber');
  console.log('Execute o comando: [yarn test:web:allure] para acessar o relatório pelo allure');
});