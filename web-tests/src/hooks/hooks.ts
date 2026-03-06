import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
  setDefaultTimeout,
  Status
} from '@cucumber/cucumber';
import { chromium, firefox, webkit } from 'playwright';
import { CustomWorld } from './world';
import { config } from '../config/env.config';
import * as fs from 'fs';
import * as path from 'path';

setWorldConstructor(CustomWorld);
setDefaultTimeout(config.timeouts.default);

function clearDir(dir: string): void {
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      fs.rmSync(path.join(dir, file), { recursive: true, force: true });
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

BeforeAll(function () {
  clearDir('allure-results');

  const dirs = ['test-results', 'test-results/screenshots'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});


Before(async function (this: CustomWorld, { pickle }) {
  this.scenarioName = pickle.name;

  const browserType =
    config.browser.type === 'firefox'
      ? firefox
      : config.browser.type === 'webkit'
        ? webkit
        : chromium;

  this.browser = await browserType.launch({
    headless: !config.browser.headless,
    slowMo: config.browser.slowMo
  });

  this.context = await this.browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeouts.default);

  this.initPages();
});

After(async function (this: CustomWorld, { result, pickle }) {
  if (result?.status === Status.FAILED && this.page) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });

      if (screenshot) {
        await this.attach(screenshot, 'image/png');

        const safeName = pickle.name.replace(/[^a-z0-9]/gi, '_');
        const screenshotPath = path.join(
          'test-results', 'screenshots',
          `${safeName}_${Date.now()}.png`
        );
        fs.writeFileSync(screenshotPath, screenshot);
        console.error(`Screenshot salvo: ${screenshotPath}`);
      }
    } catch (err) {
      console.error('Não foi possível capturar screenshot:', err);
    }
  }

  await this.context?.close();
  await this.browser?.close();
});

// ─── AfterAll: log final ──────────────────────────────────────────────────────
AfterAll(function () {
  console.log('\n Suíte de testes Web finalizada.');
  console.log('Execute o comando: [yarn test:web:report] para acessar o relatório pelo cucumber');
  console.log('AExecute o comando: [yarn test:web:allure] para acessar o relatório pelo allure');
});