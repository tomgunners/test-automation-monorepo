const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Lê e parseia o .env ──────────────────────────────────────────────────────
function loadEnv(envPath) {
  const env = {};

  if (!fs.existsSync(envPath)) {
    console.warn(`[k6-runner] .env não encontrado em: ${envPath}`);
    console.warn('[k6-runner] Prosseguindo com fallbacks definidos no options.js');
    return env;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!key) continue;
    env[key] = value;
  }

  return env;
}

function mergeWithProcessEnv(fileEnv) {
  const merged = { ...fileEnv };
  const knownKeys = Object.keys(fileEnv);

  for (const key of knownKeys) {
    if (process.env[key] !== undefined) {
      merged[key] = process.env[key];
    }
  }
  return merged;
}

// ─── Constrói os flags --env para o k6 ───────────────────────────────────────
function buildEnvFlags(env) {
  return Object.entries(env)
    .map(([key, value]) => `--env ${key}=${value}`)
    .join(' ');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env');
const fileEnv = loadEnv(envPath);
const env = mergeWithProcessEnv(fileEnv);
const envFlags = buildEnvFlags(env);

const extraArgs = process.argv.slice(2).join(' ');
fs.mkdirSync(path.resolve(__dirname, '..', 'results'), { recursive: true });
const command = `k6 run ${envFlags} ${extraArgs}`.trim();

console.log('');
console.log('════════════════════════════════════════════════');
console.log('  k6 Runner                                     ');
console.log(`  Perfil  : ${env.STAGES_PROFILE || 'load (fallback)'}`);
console.log(`  Base URL: ${env.BASE_URL || 'https://dummyjson.com (fallback)'}`);
console.log('════════════════════════════════════════════════');
console.log('');

try {
  execSync(command, { stdio: 'inherit' });
} catch (err) {
  process.exit(err.status ?? 1);
}