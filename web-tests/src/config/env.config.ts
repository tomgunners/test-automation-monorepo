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
  }
} as const;

export type AppConfig = typeof config;
