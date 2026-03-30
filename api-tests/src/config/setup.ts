import fs from 'fs';
import path from 'path';
import { setupApiAllure } from '@utils/allure-setup';

// ── Diretórios de saída ───────────────────────────────────────────────────────
const OUTPUT_DIRS = [
  path.resolve(__dirname, '../../reports'),
  path.resolve(__dirname, '../../allure-results'),
];

for (const dir of OUTPUT_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Allure ───────────────────────────────────────────────────────────────────
// Inicializa environment.properties, executor.json e categories.json
// antes do primeiro teste ser executado pelo Mocha.
setupApiAllure();

// ── Finalização ───────────────────────────────────────────────────────────────
process.on('exit', () => {
  console.log('\nSuíte de testes API finalizada.');
  console.log('  Mochawesome : [yarn test:report]       → reports/api-report.html');
  console.log('  Allure      : [yarn report:allure]     → relatório interativo');
});
