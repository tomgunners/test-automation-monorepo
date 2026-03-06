import { expect } from 'chai';
import { Response } from 'supertest';


export const ApiUtils = {
  //Valida o status code de uma resposta.
  assertStatus(response: Response, expectedStatus: number): void {
    expect(response.status).to.equal(
      expectedStatus,
      `Status esperado: ${expectedStatus}, recebido: ${response.status}. Body: ${JSON.stringify(response.body)}`
    );
  },

  //Valida que o Content-Type é JSON.
  assertJsonContentType(response: Response): void {
    expect(response.headers['content-type']).to.include('application/json');
  },

  //Valida que o body da resposta não está vazio.
  assertNonEmptyBody(response: Response): void {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
  },

  //Gera um payload de usuário com dados únicos para testes.
  generateUserPayload(suffix: string = Date.now().toString()) {
    return {
      firstName: `Test${suffix}`,
      lastName: `User${suffix}`,
      age: 30,
      email: `test.${suffix}@example.com`,
      username: `testuser_${suffix}`,
      password: 'Test@1234'
    };
  },

  //Formata o body da resposta como string legível para logs de erro.
  formatResponseBody(response: Response): string {
    return JSON.stringify(response.body, null, 2);
  }
};
