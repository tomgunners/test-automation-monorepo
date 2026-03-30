import { setupAllure, type AllureCategory } from '@automation/shared';

/** Categorias específicas de erros dos testes de API */
const API_CATEGORIES: AllureCategory[] = [
  {
    name: 'Assertion Failures',
    matchedStatuses: ['failed'],
    traceRegex: '.*AssertionError.*',
  },
  {
    name: 'Timeout Errors',
    matchedStatuses: ['broken'],
    messageRegex: '.*[Tt]imeout.*|.*timed out.*|.*ECONNRESET.*|.*ECONNREFUSED.*',
  },
  {
    name: 'HTTP Status Errors',
    matchedStatuses: ['failed'],
    messageRegex: '.*Status esperado.*|.*expected.*to equal.*',
  },
  {
    name: 'Schema Validation Errors',
    matchedStatuses: ['failed'],
    messageRegex: '.*expected.*to have property.*|.*to be a.*|.*to be an.*',
  },
  {
    name: 'Application Errors',
    matchedStatuses: ['broken'],
    traceRegex: '.*TypeError.*|.*ReferenceError.*',
  },
  {
    name: 'Skipped Tests',
    matchedStatuses: ['skipped'],
  },
];

/**
 * Inicializa o Allure para a suite de testes de API.
 * Chamado no setup global do Mocha (src/config/setup.ts).
 */
export function setupApiAllure(): void {
  setupAllure({
    environment: {
      'API.Base.URL': process.env.API_BASE_URL ?? 'https://dummyjson.com',
      'Request.Timeout': `${process.env.REQUEST_TIMEOUT ?? 10000}ms`,
      'Project.Type': 'API',
    },
    categories: API_CATEGORIES,
  });
}
