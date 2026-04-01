import type { Options } from '@wdio/types';
import path from 'path';
import { sharedConfig } from './wdio.shared.conf';

/**
 * Configuração WebdriverIO para iOS.
 *
 * Pré-requisitos:
 *  - macOS com Xcode instalado e simuladores iOS configurados
 *  - Appium com driver XCUITest instalado:
 *      appium driver install xcuitest
 *  - App compilado para simulador (.app) disponível em mobile-tests/apps/
 *
 * Verificar simuladores disponíveis:
 *   xcrun simctl list devices available
 */
export const config: Options.Testrunner = {
  ...sharedConfig,

  // ── Conexão com o Appium ───────────────────────────────────────────────────
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port:     Number(process.env.APPIUM_PORT ?? 4723),
  path:     '/',

  waitforTimeout:  Number(process.env.WDIO_WAIT_TIMEOUT ?? 15000),
  waitforInterval: 500,

  // ── Capabilities iOS ──────────────────────────────────────────────────────
  capabilities: [{
    platformName: 'iOS',

    /** Driver XCUITest (Appium 2) */
    'appium:automationName': 'XCUITest',

    /**
     * Versão do iOS no simulador.
     * Verificar com: xcrun simctl list runtimes
     */
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION ?? '17.0',

    /**
     * Nome do simulador.
     * Verificar com: xcrun simctl list devices available
     */
    'appium:deviceName': process.env.IOS_DEVICE_NAME ?? 'iPhone 15',

    /**
     * Caminho para o .app (simulador) ou .ipa (dispositivo físico).
     */
    'appium:app': path.resolve(
      __dirname,
      '../../apps',
      process.env.IOS_APP_NAME ?? 'wdio-native-demo-app.app',
    ),

    /** false → reinstala o app a cada sessão (estado limpo) */
    'appium:noReset':   false,
    'appium:fullReset': false,

    /** Aceita alerts automaticamente (permissões, etc.) */
    'appium:autoAcceptAlerts': true,

    // ── Timeouts ────────────────────────────────────────────────────────────
    'appium:newCommandTimeout':    Number(process.env.APPIUM_COMMAND_TIMEOUT ?? 300),
    'appium:wdaLaunchTimeout':     60000,
    'appium:wdaConnectionTimeout': 60000,
  }],
};
