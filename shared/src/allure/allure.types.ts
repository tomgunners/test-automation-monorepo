/**
 * Tipos do módulo Allure compartilhado.
 * Define contratos usados por web-tests e mobile-tests.
 */

/** Status possíveis de um resultado Allure */
export type AllureStatus = 'failed' | 'broken' | 'passed' | 'skipped';

/** Uma categoria de classificação de falha no Allure */
export interface AllureCategory {
  name: string;
  matchedStatuses: AllureStatus[];
  messageRegex?: string;
  traceRegex?: string;
}

/**
 * Opções de configuração para setupAllure().
 * Cada workspace passa suas propriedades específicas de ambiente
 * e suas categorias de erro.
 */
export interface AllureSetupOptions {
  /** Variáveis exibidas na aba "Environment" do relatório Allure */
  environment: Record<string, string>;
  /**
   * Categorias de falha exibidas na aba "Categories".
   * Se omitido, aplica as categorias comuns (timeout, assertion, etc.).
   */
  categories?: AllureCategory[];
}
