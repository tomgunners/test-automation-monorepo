import { UserCredentials } from '../types/mobile.types';
import * as fs from 'fs';

// ── Credenciais ───────────────────────────────────────────────────────────────
export const USERS = {
  standard: {
    username: process.env.STANDARD_USER ?? 'bob@example.com',
    password: process.env.STANDARD_PASSWORD ?? '10203040'
  } as UserCredentials,
  invalid: {
    username: process.env.INVALID_USER ?? 'aaaaaaaaaaaaaaa',
    password: process.env.INVALID_PASSWORD ?? 'senhaerrada'
  } as UserCredentials
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Garante que os diretórios de saída existem.
 * Chamado no hook onPrepare da config compartilhada.
 */
export function ensureDirs (): void {
  for (const dir of ['reports/screenshots', 'allure-results']) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}


export async function restartApp (): Promise<void> {
  const caps = browser.capabilities as Record<string, string>;

  if (browser.isAndroid) {
    const pkg = caps['appium:appPackage'] ?? caps['appPackage'];
    if (pkg) {
      await browser.terminateApp(pkg);
      await browser.activateApp(pkg);
      return;
    }
  }

  // Fallback: recarrega a página/sessão atual
  await browser.reloadSession();
}
