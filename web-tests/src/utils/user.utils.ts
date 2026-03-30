import { config } from '../config/env.config';

/**
 * Resolve o label semântico do Gherkin para as credenciais reais do .env.
 *
 * Centraliza a resolução de usuários para que feature files nunca contenham
 * valores sensíveis e o mapeamento fique em um único lugar.
 *
 * @param label - Chave do usuário definida em config.users (ex.: "standard", "locked")
 * @throws Error quando o label não existe em config.users
 */
export function resolveUser(label: string): { username: string; password: string } {
  const user = config.users[label];
  if (!user) {
    throw new Error(
      `[resolveUser] Label "${label}" não encontrado em config.users. ` +
      `Labels disponíveis: ${Object.keys(config.users).join(', ')}`
    );
  }
  return user;
}
