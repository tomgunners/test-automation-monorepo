const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve(__dirname, '../../results/summary.json');

if (!fs.existsSync(summaryPath)) {
  console.error('Arquivo results/summary.json não encontrado.');
  console.error('Execute primeiro: yarn test');
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const metrics = summary.metrics || {};

function formatMs(value) {
  return value !== undefined ? `${value.toFixed(2)}ms` : 'N/A';
}


function formatRate(value) {
  return value !== undefined ? `${(value * 100).toFixed(2)}%` : 'N/A';
}

console.log('\n════════════════════════════════════════════════════════');
console.log('          📊 RELATÓRIO DE PERFORMANCE — PRODUCTS API      ');
console.log('════════════════════════════════════════════════════════\n');

// Duração total
const duration = metrics.iteration_duration?.values;
if (duration) {
  console.log('⏱  Duração das iterações:');
  console.log(`   Média:   ${formatMs(duration.avg)}`);
  console.log(`   P(90):   ${formatMs(duration['p(90)'])}`);
  console.log(`   P(95):   ${formatMs(duration['p(95)'])}`);
  console.log(`   P(99):   ${formatMs(duration['p(99)'])}`);
  console.log(`   Máximo:  ${formatMs(duration.max)}\n`);
}

// Duração das requisições HTTP
const httpDuration = metrics.http_req_duration?.values;
if (httpDuration) {
  console.log('🌐 Duração das requisições HTTP:');
  console.log(`   Média:   ${formatMs(httpDuration.avg)}`);
  console.log(`   P(90):   ${formatMs(httpDuration['p(90)'])}`);
  console.log(`   P(95):   ${formatMs(httpDuration['p(95)'])}`);
  console.log(`   P(99):   ${formatMs(httpDuration['p(99)'])}`);
  console.log(`   Máximo:  ${formatMs(httpDuration.max)}\n`);
}

// Taxa de erros
const failedRate = metrics.http_req_failed?.values;
if (failedRate) {
  const rate = failedRate.rate;
  const emoji = rate < 0.01 ? '✅' : '❌';
  console.log(`${emoji} Taxa de erros: ${formatRate(rate)} (threshold: <1%)\n`);
}

// Total de requisições
const totalReqs = metrics.http_reqs?.values;
if (totalReqs) {
  console.log(`📈 Total de requisições: ${totalReqs.count}`);
  console.log(`   Throughput: ${totalReqs.rate.toFixed(2)} req/s\n`);
}

// VUs
const vus = metrics.vus_max?.values;
if (vus) {
  console.log(`👥 VUs máximos atingidos: ${vus.max}\n`);
}

// Thresholds
const thresholds = summary.root_group?.checks;
if (thresholds) {
  console.log('🎯 Checks:');
  Object.entries(thresholds).forEach(([name, check]) => {
    const icon = check.passes > 0 && check.fails === 0 ? '✅' : '❌';
    console.log(`   ${icon} ${name}: ${check.passes} passed, ${check.fails} failed`);
  });
}

console.log('\n════════════════════════════════════════════════════════');
console.log('📄 Relatório HTML disponível em: results/report.html');
console.log('📄 JSON completo em: results/summary.json');
console.log('════════════════════════════════════════════════════════\n');
