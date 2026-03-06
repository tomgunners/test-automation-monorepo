import type { Options } from '@wdio/types';
import * as path from 'path';
import { sharedConfig } from './wdio.shared.conf';

const APP_PATH = path.resolve(
  __dirname,
  '../../apps',
  process.env.ANDROID_APP_NAME ?? 'wdio-native-demo-app.apk'
);

export const config: Options.Testrunner = {
  ...sharedConfig,

  // ── Conexão com o Appium ────────────────────────────────────────────────────
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: '/',

  // ── Capabilities Android ─────────────────────────────────────────────────────
  capabilities: [{
    platformName: 'Android',

    // Automation engine do Appium para Android
    'appium:automationName': 'UiAutomator2',

    // Versão do Android no emulador/dispositivo
    // Verificar com: adb shell getprop ro.build.version.release
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '15.0',

    // Nome do dispositivo (emulador) ou serial (físico)
    // Verificar com: adb devices
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'emulator-5554',

    // Caminho absoluto para o APK
    'appium:app': APP_PATH,

    // false → reinstala o app a cada sessão (estado limpo)
    // true  → mantém dados entre sessões (mais rápido, menos isolado)
    'appium:noReset': false,
    'appium:fullReset': false,

    // Concede permissões automaticamente (evita dialogs de permissão)
    'appium:autoGrantPermissions': true,

    // Timeouts
    'appium:newCommandTimeout': Number(process.env.APPIUM_COMMAND_TIMEOUT ?? 300),
    'appium:androidInstallTimeout': 90000,
    'appium:adbExecTimeout': 60000
  }]
};
