/**
 * BasePage — classe abstrata base para todas as Screen Objects.
 *
 * Centraliza as operações comuns de espera, interação e verificação,
 * eliminando repetição nas screens e garantindo mensagens de erro
 * claras quando elementos não são encontrados no tempo esperado.
 */
export abstract class BasePage {

  // ── Timeout padrão ────────────────────────────────────────────────────────

  protected get timeout(): number {
    return Number(process.env.ELEMENT_TIMEOUT ?? 15000);
  }

  // ── Espera ────────────────────────────────────────────────────────────────

  /**
   * Aguarda o elemento ficar visível e retorna-o.
   * Lança erro com mensagem clara se o timeout for atingido.
   */
  async waitForDisplayed(
    selector: string,
    timeout = this.timeout,
  ): Promise<WebdriverIO.Element> {
    const el = await $(selector);
    await el.waitForDisplayed({
      timeout,
      timeoutMsg: `Elemento não apareceu em ${timeout}ms: ${selector}`,
    });
    return el;
  }

  /**
   * Aguarda o elemento existir na hierarquia (não necessariamente visível).
   */
  async waitForExist(
    selector: string,
    timeout = this.timeout,
  ): Promise<WebdriverIO.Element> {
    const el = await $(selector);
    await el.waitForExist({
      timeout,
      timeoutMsg: `Elemento não existe após ${timeout}ms: ${selector}`,
    });
    return el;
  }

  // ── Verificações ──────────────────────────────────────────────────────────

  /**
   * Retorna true se o elemento estiver visível, sem lançar erro.
   */
  async isDisplayed(selector: string): Promise<boolean> {
    try {
      const el = await $(selector);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Retorna o texto de um elemento visível.
   */
  async getText(selector: string): Promise<string> {
    const el = await this.waitForDisplayed(selector);
    return el.getText();
  }

  // ── Ações ─────────────────────────────────────────────────────────────────

  /**
   * Toca em um elemento (aguarda visibilidade antes).
   */
  async tap(selector: string): Promise<void> {
    const el = await this.waitForDisplayed(selector);
    await el.click();
  }

  /**
   * Limpa e preenche um campo de texto, ocultando o teclado após a entrada.
   */
  async fill(selector: string, value: string): Promise<void> {
    const el = await this.waitForDisplayed(selector);
    await el.clearValue();
    await el.setValue(value);
    await this.dismissKeyboard();
  }

  // ── Utilitários ───────────────────────────────────────────────────────────

  /**
   * Oculta o teclado virtual (silenciosamente se não estiver aberto).
   */
  async dismissKeyboard(): Promise<void> {
    try {
      await browser.hideKeyboard();
    } catch {
      // Nenhum teclado visível — sem problema
    }
  }

  /**
   * Captura screenshot e salva em reports/screenshots/.
   */
  async screenshot(name: string): Promise<void> {
    const safe = name.replace(/\W+/g, '_');
    await browser.saveScreenshot(`./reports/screenshots/${safe}_${Date.now()}.png`);
  }

  // ── Flags de plataforma ───────────────────────────────────────────────────

  /** true quando conectado a um dispositivo Android */
  get isAndroid(): boolean { return browser.isAndroid; }

  /** true quando conectado a um dispositivo iOS */
  get isIOS(): boolean { return browser.isIOS; }
}
