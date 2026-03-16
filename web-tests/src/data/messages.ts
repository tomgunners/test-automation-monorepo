/**
 * Centraliza as mensagens de erro esperadas da aplicação.
 * Ao mudar o texto de um erro na UI, basta atualizar aqui.
 */
export const ErrorMessages = {
  invalidCredentials: 'Username and password do not match',
  lockedUser: 'Sorry, this user has been locked out',
  firstNameRequired: 'First Name is required',
} as const;
