import { UserCredentials } from '../types/mobile.types';

/**
 * Credenciais de teste lidas do .env.
 * Os fallbacks refletem o comportamento esperado do app de demo:
 *   standard → usuário válido (email + senha >= 8 chars)
 *   invalid  → email inválido (dispara erro de formato)
 */
export const USERS: Record<string, UserCredentials> = {
  standard: {
    username: process.env.STANDARD_USER     ?? 'bob@example.com',
    password: process.env.STANDARD_PASSWORD ?? '10203040',
  },
  invalid: {
    username: process.env.INVALID_USER     ?? 'not_an_email',
    password: process.env.INVALID_PASSWORD ?? 'short',
  },
};
