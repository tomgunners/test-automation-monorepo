import { Page } from 'playwright';
import { config } from '../config/env.config';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = config.baseUrl;
  }

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation
    });
  }

  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout ?? config.timeouts.default
    });
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
