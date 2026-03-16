import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',

  browser: {
    headless: process.env.HEADLESS === 'true',
    slowMo: Number(process.env.SLOW_MO ?? 0),
    type: (process.env.BROWSER ?? 'chromium') as 'chromium' | 'firefox' | 'webkit'
  },

  timeouts: {
    default: Number(process.env.DEFAULT_TIMEOUT ?? 30000),
    navigation: Number(process.env.NAVIGATION_TIMEOUT ?? 60000)
  },

  users: {
    standard: {
      username: process.env.STANDARD_USER ?? 'standard_user',
      password: process.env.STANDARD_PASSWORD ?? 'secret_sauce',
    },
    locked: {
      username: process.env.LOCKED_USER ?? 'locked_out_user',
      password: process.env.STANDARD_PASSWORD ?? 'secret_sauce',
    },
    invalid: {
      username: process.env.INVALID_USER ?? 'invalid_user',
      password: process.env.INVALID_PASSWORD ?? 'wrong_password',
    },
  },
} as const;

export type AppConfig = typeof config;
