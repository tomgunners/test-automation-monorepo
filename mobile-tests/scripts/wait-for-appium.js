/**
 * Aguarda o servidor Appium estar pronto para aceitar conexões.
 *
 * Tenta GET /status a cada POLL_INTERVAL ms por até MAX_WAIT ms.
 * Encerra com exit code 1 se o Appium não responder no tempo limite.
 *
 * Uso: node scripts/wait-for-appium.js
 * Variáveis lidas do ambiente:
 *   APPIUM_HOST        — padrão: 127.0.0.1
 *   APPIUM_PORT        — padrão: 4723
 *   APPIUM_WAIT_MS     — tempo máximo em ms (padrão: 300000 = 5 min)
 *   APPIUM_POLL_MS     — intervalo entre tentativas em ms (padrão: 5000)
 */

const http = require('http');

const HOST         = process.env.APPIUM_HOST    || '127.0.0.1';
const PORT         = Number(process.env.APPIUM_PORT    || 4723);
const MAX_WAIT_MS  = Number(process.env.APPIUM_WAIT_MS || 300_000);
const POLL_MS      = Number(process.env.APPIUM_POLL_MS || 5_000);

const started = Date.now();

function checkAppium() {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: HOST, port: PORT, path: '/status', timeout: 3000 },
      (res) => resolve(res.statusCode === 200),
    );
    req.on('error', () => resolve(false));
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
      console.log(`✅ Appium está pronto (tentativa ${attempt}, ${Math.round(elapsed / 1000)}s)`);
      return;
    }

    console.log(
      `  tentativa ${attempt} — Appium não disponível ainda, aguardando ${POLL_MS / 1000}s...`,
    );
    attempt++;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

waitForAppium();
