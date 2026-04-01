import { UserCredentials } from '../types/mobile.types';

/**
 * Credenciais de teste lidas do .env.
 *
 * standard → usuário válido (email + senha >= 8 chars)
 * invalid  → email inválido (formato incorreto — dispara erro de validação)
 */
export const USERS: Record<string, UserCredentials> = {
  standard: {
    username: process.env.STANDARD_USER     ?? 'bob@example.com',
    password: process.env.STANDARD_PASSWORD ?? '10203040',
  },
  invalid: {
    username: process.env.INVALID_USER     ?? 'aaaaaaaaaaaaaaa',
    password: process.env.INVALID_PASSWORD ?? 'senhaerrada',
  },
};
