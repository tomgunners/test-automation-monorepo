import { expect } from 'chai';
import { Response } from 'supertest';

export const ApiUtils = {
  /** Valida o status code de uma resposta. */
  assertStatus(response: Response, expectedStatus: number): void {
    expect(response.status).to.equal(
      expectedStatus,
      `Status esperado: ${expectedStatus}, recebido: ${response.status}. Body: ${JSON.stringify(response.body)}`
    );
  },

  /** Valida que o Content-Type é JSON. */
  assertJsonContentType(response: Response): void {
    expect(response.headers['content-type']).to.include('application/json');
  },

  /**
   * Valida que o body da resposta não está vazio.
   * Garante que não é um objeto vazio {} nem um array vazio [].
   */
  assertNonEmptyBody(response: Response): void {
    expect(response.body).to.not.be.null;
    expect(response.body).to.not.be.undefined;
    const keys = Object.keys(response.body);
    expect(keys.length).to.be.greaterThan(0, 'Body não deve ser um objeto vazio');
  },

  /**
   * Gera um payload de usuário com dados únicos para testes.
   *
   * O sufixo combina timestamp + valor aleatório para garantir unicidade mesmo
   * em execuções paralelas ou em rápida sucessão.
   */
  generateUserPayload(
    suffix: string = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  ) {
    return {
      firstName: `Test${suffix}`,
      lastName:  `User${suffix}`,
      age:       30,
      email:     `test.${suffix}@example.com`,
      username:  `testuser_${suffix}`,
      password:  'Test@1234',
    };
  },
};
