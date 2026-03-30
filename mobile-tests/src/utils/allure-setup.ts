import { setupAllure, type AllureCategory } from '@automation/shared';

/** Categorias específicas de erros dos testes Mobile */
const MOBILE_CATEGORIES: AllureCategory[] = [
  {
    name: 'Authentication Errors',
    matchedStatuses: ['failed'],
    messageRegex: '.*login.*|.*senha.*|.*password.*|.*credencial.*',
  },
  {
    name: 'Timeout Errors',
    matchedStatuses: ['broken'],
    messageRegex: '.*[Tt]imeout.*|.*timed out.*|.*newCommandTimeout.*',
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
    messageRegex: '.*não apareceu.*|.*not found.*|.*waitForDisplayed.*|.*waitForExist.*',
  },
  {
    name: 'Skipped Tests',
    matchedStatuses: ['skipped'],
  },
];

/**
 * Inicializa o Allure para a suite Mobile.
 * Chamado no onPrepare do WebdriverIO (wdio.shared.conf.ts), após a limpeza de allure-results/.
 */
export function setupMobileAllure(): void {
  setupAllure({
    environment: {
      Platform:           'Android',
      'Platform.Version':  process.env.ANDROID_PLATFORM_VERSION ?? '15',
      'Device.Name':       process.env.ANDROID_DEVICE_NAME       ?? 'emulator-5554',
      'App.Name':          process.env.ANDROID_APP_NAME          ?? 'wdio-native-demo-app.apk',
      'Automation.Engine': 'UiAutomator2',
      'Project.Type':      'Mobile',
    },
    categories: MOBILE_CATEGORIES,
  });
}
