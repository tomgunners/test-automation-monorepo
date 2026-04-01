import fs   from 'fs';
import path from 'path';
import os   from 'os';

// ── Diretórios ────────────────────────────────────────────────────────────────

const RESULTS_DIR  = path.resolve('allure-results');
const REPORT_DIR   = path.resolve('allure-report');
const HISTORY_FROM = path.join(REPORT_DIR, 'history');
const HISTORY_TO   = path.join(RESULTS_DIR, 'history');

// ── Detecção de CI ────────────────────────────────────────────────────────────

const isCI: boolean =
  process.env.CI                    === 'true'    ||
  process.env.GITHUB_ACTIONS        === 'true'    ||
  process.env.GITLAB_CI             === 'true'    ||
  process.env.CIRCLECI              === 'true'    ||
  process.env.JENKINS_URL           !== undefined ||
  process.env.BITBUCKET_BUILD_NUMBER !== undefined;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getExecutorName(): string {
  if (process.env.GITHUB_ACTIONS)          return 'GitHub Actions';
  if (process.env.GITLAB_CI)               return 'GitLab CI';
  if (process.env.JENKINS_URL)             return 'Jenkins';
  if (process.env.CIRCLECI)                return 'CircleCI';
  if (process.env.BITBUCKET_BUILD_NUMBER)  return 'Bitbucket Pipelines';
  return 'Local Machine';
}

function getBuildUrl(): string {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID) {
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
  }
  return process.env.REPORT_URL ?? '';
}

// ── environment.properties ────────────────────────────────────────────────────

function writeEnvironmentFile(): void {
  const environment: Record<string, string> = {
    Browser:           process.env.BROWSER         ?? 'Chromium',
    'Browser.Version': process.env.BROWSER_VERSION ?? 'Latest',
    'Base.URL':        process.env.BASE_URL         ?? 'https://www.saucedemo.com',
    OS:                `${os.type()} ${os.release()}`,
    'Node.Version':    process.version,
    'Execution.Type':  isCI ? 'CI/CD' : 'Local',
    Environment:       process.env.TEST_ENV    ?? 'QA',
    'Project.Type':    process.env.PROJECT_TYPE ?? 'Web E2E',
    Machine:           os.hostname(),
  };

  const content = Object.entries(environment)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  fs.writeFileSync(path.join(RESULTS_DIR, 'environment.properties'), content, 'utf-8');
}

// ── executor.json ─────────────────────────────────────────────────────────────

function writeExecutorFile(): void {
  const executor = {
    name:       getExecutorName(),
    type:       isCI ? 'pipeline' : 'local',
    buildName:  process.env.GITHUB_WORKFLOW   ?? process.env.CI_PIPELINE_NAME ?? 'Local Test Execution',
    buildOrder: process.env.GITHUB_RUN_NUMBER ?? process.env.CI_PIPELINE_ID   ?? Date.now(),
    buildUrl:   getBuildUrl(),
    reportUrl:  process.env.REPORT_URL ?? '',
  };

  fs.writeFileSync(
    path.join(RESULTS_DIR, 'executor.json'),
    JSON.stringify(executor, null, 2),
    'utf-8',
  );
}

// ── categories.json ───────────────────────────────────────────────────────────

function writeCategoriesFile(): void {
  const categories = [
    {
      name:            'Authentication Errors',
      matchedStatuses: ['failed'],
      messageRegex:    '.*login.*|.*senha.*|.*password.*|.*credencial.*',
    },
    {
      name:            'Timeout Errors',
      matchedStatuses: ['broken'],
      messageRegex:    '.*[Tt]imeout.*|.*timed out.*',
    },
    {
      name:            'Assertion Failures',
      matchedStatuses: ['failed'],
      traceRegex:      '.*AssertionError.*',
    },
    {
      name:            'Application Errors',
      matchedStatuses: ['broken'],
      traceRegex:      '.*TypeError.*|.*ReferenceError.*',
    },
    {
      name:            'Element Not Found',
      matchedStatuses: ['failed', 'broken'],
      messageRegex:    '.*locator.*|.*selector.*|.*waitForSelector.*|.*not visible.*',
    },
    {
      name:            'Skipped Tests',
      matchedStatuses: ['skipped'],
    },
  ];

  fs.writeFileSync(
    path.join(RESULTS_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8',
  );
}

// ── Trend (histórico) ─────────────────────────────────────────────────────────

function restoreHistory(): void {
  if (fs.existsSync(HISTORY_FROM)) {
    ensureDir(HISTORY_TO);
    fs.cpSync(HISTORY_FROM, HISTORY_TO, { recursive: true });
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Configura o Allure para a suite Web E2E.
 * Chamado no BeforeAll do Cucumber (hooks.ts), após a limpeza de allure-results/.
 */
export function setupWebAllure(): void {
  ensureDir(RESULTS_DIR);
  restoreHistory();
  writeEnvironmentFile();
  writeExecutorFile();
  writeCategoriesFile();
}
