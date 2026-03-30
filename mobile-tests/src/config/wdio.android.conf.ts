import type { Options } from '@wdio/types';
import path from 'path';
import { sharedConfig } from './wdio.shared.conf';

/**
 * Resolve o caminho do APK:
 *  - CI / docker-android: ANDROID_APP_CONTAINER_PATH=/apps/<nome>.apk (volume montado no container)
 *  - Local sem docker   : caminho relativo à pasta apps/ do workspace
 */
function resolveAppPath(): string {
  if (process.env.ANDROID_APP_CONTAINER_PATH) {
    return process.env.ANDROID_APP_CONTAINER_PATH;
  }
  return path.resolve(
    __dirname,
    '../../apps',
    process.env.ANDROID_APP_NAME ?? 'wdio-native-demo-app.apk',
  );
}

export const config: Options.Testrunner = {
  ...sharedConfig,

  // ── Conexão com o Appium ───────────────────────────────────────────────────
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port:     Number(process.env.APPIUM_PORT ?? 4723),
  path:     '/',

  // ── Capabilities Android ──────────────────────────────────────────────────
  capabilities: [{
    platformName: 'Android',

    /** Automation engine do Appium para Android */
    'appium:automationName': 'UiAutomator2',

    /**
     * Versão do Android.
     * docker-android usa a imagem emulator_14.0 → plataforma 14.
     * Verificar em dispositivo físico: adb shell getprop ro.build.version.release
     */
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '14',

    /**
     * Nome do dispositivo.
     * docker-android sempre expõe o emulador como emulator-5554.
     * Verificar com: adb devices
     */
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'emulator-5554',

    /** Caminho absoluto para o APK (resolvido por resolveAppPath) */
    'appium:app': resolveAppPath(),

    /** false → reinstala o app a cada sessão (estado limpo garantido) */
    'appium:noReset':   false,
    'appium:fullReset': false,

    /** Concede permissões automaticamente — evita dialogs bloqueantes */
    'appium:autoGrantPermissions': true,

    // ── Timeouts ──────────────────────────────────────────────────────────
    'appium:newCommandTimeout':     Number(process.env.APPIUM_COMMAND_TIMEOUT ?? 300),
    'appium:androidInstallTimeout': 90000,
    'appium:adbExecTimeout':        60000,
  }],
};
