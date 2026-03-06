import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const reportsDir = path.resolve(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

process.on('exit', function () {
  console.log('\nSuíte de testes API finalizada.');
  console.log('Execute o comando: [yarn test:api:report] para acessar o relatório');
});