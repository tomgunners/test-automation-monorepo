/**
 * Tipos compartilhados dos testes Mobile.
 */

/** Credenciais de acesso ao app */
export interface UserCredentials {
  username: string;
  password: string;
}

/** Direções de swipe suportadas pelo BasePage */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
