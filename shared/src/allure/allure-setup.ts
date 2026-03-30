import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  isCI,
  getExecutorName,
  getBuildUrl,
  getBuildName,
  getBuildOrder,
} from '../ci/ci-info';
import type { AllureCategory, AllureSetupOptions } from './allure.types';

// ── Constantes de diretório ───────────────────────────────────────────────────

const RESULTS_DIR = path.resolve('allure-results');
const REPORT_DIR  = path.resolve('allure-report');

// ── Utilitários de sistema de arquivos ───────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Arquivo environment.properties ───────────────────────────────────────────

function writeEnvironmentFile(environment: Record<string, string>): void {
  const base: Record<string, string> = {
    OS:               `${os.type()} ${os.release()}`,
    'Node.Version':   process.version,
    'Execution.Type': isCI ? 'CI/CD' : 'Local',
    Environment:      process.env.TEST_ENV ?? 'QA',
    Machine:          os.hostname(),
  };

  const merged = { ...base, ...environment };
  const content = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  fs.writeFileSync(path.join(RESULTS_DIR, 'environment.properties'), content, 'utf-8');
}

// ── Arquivo executor.json ─────────────────────────────────────────────────────

function writeExecutorFile(): void {
  const executor = {
    name:       getExecutorName(),
    type:       isCI ? 'pipeline' : 'local',
    buildName:  getBuildName(),
    buildOrder: getBuildOrder(),
    buildUrl:   getBuildUrl(),
    reportUrl:  process.env.REPORT_URL ?? '',
  };

  fs.writeFileSync(
    path.join(RESULTS_DIR, 'executor.json'),
    JSON.stringify(executor, null, 2),
    'utf-8',
  );
}

// ── Arquivo categories.json ───────────────────────────────────────────────────

/** Categorias comuns a todos os workspaces (base) */
const BASE_CATEGORIES: AllureCategory[] = [
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
    name: 'Skipped Tests',
    matchedStatuses: ['skipped'],
  },
];

function writeCategoriesFile(custom?: AllureCategory[]): void {
  const categories = custom ?? BASE_CATEGORIES;
  fs.writeFileSync(
    path.join(RESULTS_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8',
  );
}

// ── Restauração de histórico (Trend) ──────────────────────────────────────────
//
// O Allure lê allure-results/history/ ao gerar o relatório para montar o Trend.
// Copiamos allure-report/history/ → allure-results/history/ antes dos testes
// para que o histórico de execuções anteriores seja preservado.
// No CI, allure-report/history é restaurado via cache (actions/cache) antes
// deste script rodar.

function restoreHistory(): void {
  const historyFrom = path.join(REPORT_DIR, 'history');
  const historyTo   = path.join(RESULTS_DIR, 'history');

  if (fs.existsSync(historyFrom)) {
    ensureDir(historyTo);
    fs.cpSync(historyFrom, historyTo, { recursive: true });
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Configura o Allure para a suite de testes atual.
 *
 * Deve ser chamado APÓS a limpeza de allure-results/ e ANTES do início dos testes.
 * Ordem interna:
 *   1. Garante que allure-results/ existe
 *   2. Restaura history/ de allure-report/history (trend acumulado)
 *   3. Grava environment.properties, executor.json e categories.json
 *
 * @param options - Configurações específicas da suite (environment + categories)
 */
export function setupAllure(options: AllureSetupOptions): void {
  ensureDir(RESULTS_DIR);
  restoreHistory();
  writeEnvironmentFile(options.environment);
  writeExecutorFile();
  writeCategoriesFile(options.categories);
}
