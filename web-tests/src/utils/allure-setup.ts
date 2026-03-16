import fs from 'fs';
import path from 'path';
import os from 'os';

const resultsDir = path.resolve('allure-results');
const reportDir = path.resolve('allure-report');
const historyFrom = path.join(reportDir, 'history');
const historyTo = path.join(resultsDir, 'history');

// ── Detect CI ─────────────────────────────────────────────────────────────────
const isCI =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.GITLAB_CI === 'true' ||
  process.env.JENKINS_URL !== undefined;

// ── Executor name ─────────────────────────────────────────────────────────────
function getExecutorName(): string {
  if (process.env.GITHUB_ACTIONS) return 'GitHub Actions';
  if (process.env.GITLAB_CI) return 'GitLab CI';
  if (process.env.JENKINS_URL) return 'Jenkins';
  return 'Local Machine';
}

// ── Ensure dir ────────────────────────────────────────────────────────────────
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Environment ───────────────────────────────────────────────────────────────
function createEnvironmentFile(): void {
  const environment: Record<string, string> = {
    Browser: process.env.BROWSER || 'Chromium',
    'Browser.Version': process.env.BROWSER_VERSION || 'Latest',
    OS: `${os.type()} ${os.release()}`,
    'Node.Version': process.version,
    'Execution.Type': isCI ? 'CI/CD' : 'Local',
    Environment: process.env.TEST_ENV || 'QA',
    'Base.URL': process.env.BASE_URL || 'https://www.saucedemo.com',
    'Project.Type': process.env.PROJECT_TYPE || 'Web',
    Machine: os.hostname(),
  };

  const content = Object.entries(environment)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), content);
}

// ── Executor ──────────────────────────────────────────────────────────────────
function createExecutorFile(): void {
  const executor = {
    name: getExecutorName(),
    type: isCI ? 'pipeline' : 'local',
    buildName:
      process.env.GITHUB_WORKFLOW ||
      process.env.CI_PIPELINE_NAME ||
      'Local Test Execution',
    buildOrder:
      process.env.GITHUB_RUN_NUMBER ||
      process.env.CI_PIPELINE_ID ||
      Date.now(),
    buildUrl:
      process.env.GITHUB_SERVER_URL &&
        process.env.GITHUB_REPOSITORY &&
        process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : '',
    reportUrl: process.env.REPORT_URL || '',
  };

  fs.writeFileSync(
    path.join(resultsDir, 'executor.json'),
    JSON.stringify(executor, null, 2),
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function createCategoriesFile(): void {
  const categories = [
    {
      name: 'Authentication Errors',
      matchedStatuses: ['failed'],
      messageRegex: '.*login.*|.*senha.*|.*password.*|.*credencial.*',
    },
    {
      name: 'Timeout Errors',
      matchedStatuses: ['broken'],
      messageRegex: '.*Timeout.*|.*timed out.*|.*timeout.*',
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

  fs.writeFileSync(
    path.join(resultsDir, 'categories.json'),
    JSON.stringify(categories, null, 2),
  );
}

// ── History (Trend) ───────────────────────────────────────────────────────────
// Copia allure-report/history → allure-results/history antes dos testes.
// O allure generate posterior lê essa pasta e popula a aba Trend.
// Localmente: persiste entre execuções enquanto allure-report/ existir.
// No CI: allure-report/history é restaurado via cache antes desse script rodar.
function restoreHistory(): void {
  if (fs.existsSync(historyFrom)) {
    ensureDir(historyTo);
    fs.cpSync(historyFrom, historyTo, { recursive: true });
  } else {
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────
export function setupAllure(): void {
  ensureDir(resultsDir);
  restoreHistory();
  createEnvironmentFile();
  createExecutorFile();
  createCategoriesFile();
}
