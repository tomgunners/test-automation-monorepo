import { setupAllure, type AllureCategory } from '@automation/shared';

/** Categorias específicas de erros dos testes Web E2E */
const WEB_CATEGORIES: AllureCategory[] = [
  {
    name: 'Authentication Errors',
    matchedStatuses: ['failed'],
    messageRegex: '.*login.*|.*senha.*|.*password.*|.*credencial.*',
  },
  {
    name: 'Timeout Errors',
    matchedStatuses: ['broken'],
    messageRegex: '.*[Tt]imeout.*|.*timed out.*',
  },
  {
    name: 'Assertion Failures',
    matchedStatuses: ['failed'],
    traceRegex: '.*AssertionError.*',
  },
  {
    name: 'Application Errors',
    matchedStatuses: ['broken'],
    traceRegex: '.*TypeError.*|.*ReferenceError.*',
  },
  {
    name: 'Element Not Found',
    matchedStatuses: ['failed', 'broken'],
    messageRegex: '.*locator.*|.*selector.*|.*waitForSelector.*|.*not visible.*',
  },
  {
    name: 'Skipped Tests',
    matchedStatuses: ['skipped'],
  },
];

/**
 * Inicializa o Allure para a suite Web E2E.
 * Chamado no BeforeAll do Cucumber (hooks.ts), após a limpeza de allure-results/.
 */
export function setupWebAllure(): void {
  setupAllure({
    environment: {
      Browser:          process.env.BROWSER        ?? 'Chromium',
      'Browser.Version': process.env.BROWSER_VERSION ?? 'Latest',
      'Base.URL':        process.env.BASE_URL        ?? 'https://www.saucedemo.com',
      'Project.Type':    'Web E2E',
    },
    categories: WEB_CATEGORIES,
  });
}
