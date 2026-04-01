#!/usr/bin/env node
/**
 * scripts/wait-for-appium.js
 *
 * Aguarda o servidor Appium estar pronto para aceitar conexões.
 * Valida tanto o status HTTP 200 quanto o campo `value.ready === true` no JSON.
 *
 * Uso: node scripts/wait-for-appium.js
 *
 * Variáveis de ambiente:
 *   APPIUM_HOST    — host do Appium    (padrão: 127.0.0.1)
 *   APPIUM_PORT    — porta do Appium   (padrão: 4723)
 *   APPIUM_WAIT_MS — timeout máximo ms (padrão: 300000 = 5 min)
 *   APPIUM_POLL_MS — intervalo entre tentativas ms (padrão: 5000)
 */

const http = require('http');

const HOST        = process.env.APPIUM_HOST    ?? '127.0.0.1';
const PORT        = Number(process.env.APPIUM_PORT    ?? 4723);
const MAX_WAIT_MS = Number(process.env.APPIUM_WAIT_MS ?? 300_000);
const POLL_MS     = Number(process.env.APPIUM_POLL_MS ?? 5_000);

const started = Date.now();

console.log(`Aguardando Appium em http://${HOST}:${PORT}/status (timeout: ${MAX_WAIT_MS / 1000}s)...`);

function checkAppium() {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: HOST, port: PORT, path: '/status', timeout: 4000 },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            // Valida tanto value.ready (Appium 2) quanto status 200 (fallback)
            resolve(json?.value?.ready === true || res.statusCode === 200);
          } catch {
            resolve(false);
          }
        });
      },
    );
    req.on('error',   () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function waitForAppium() {
  let attempt = 1;

  while (true) {
    const elapsed = Date.now() - started;

    if (elapsed >= MAX_WAIT_MS) {
      console.error(
        `\n❌ Appium não ficou disponível após ${MAX_WAIT_MS / 1000}s (${attempt - 1} tentativas).`,
      );
      process.exit(1);
    }

    const ready = await checkAppium();

    if (ready) {
      console.log(`\n✅ Appium está pronto (tentativa ${attempt}, ${Math.round(elapsed / 1000)}s)`);
      return;
    }

    process.stdout.write('.');
    attempt++;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

waitForAppium();
