/**
 * Ponto de entrada do workspace @automation/shared.
 * Re-exporta utilitários compartilhados entre os workspaces de automação.
 */

export { setupAllure }          from './allure/allure-setup';
export type { AllureSetupOptions, AllureCategory, AllureStatus } from './allure/allure.types';

export {
  isCI,
  getExecutorName,
  getBuildUrl,
  getBuildName,
  getBuildOrder,
} from './ci/ci-info';
