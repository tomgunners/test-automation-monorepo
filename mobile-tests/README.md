# mobile-tests

Testes Mobile com **WebdriverIO v8 + Appium 2 + TypeScript** em Android 14.

## Pré-requisitos

- APK em `apps/wdio-native-demo-app.apk`
- Docker Desktop (para execução local via docker-android)

## Execução local (docker-android)

```bash
# 1. Subir o container com emulador Android 14 + Appium
docker compose up -d

# 2. Acompanhar até aparecer "Appium is running"
docker compose logs -f

# 3. Editar .env e descomentar ANDROID_APP_CONTAINER_PATH
# ANDROID_APP_CONTAINER_PATH=/apps/wdio-native-demo-app.apk

# 4. Rodar os testes
yarn test

# 5. Relatório Allure
yarn report:allure

# 6. Encerrar
docker compose down
```

## Execução local (Appium na máquina)

```bash
# 1. Iniciar Appium manualmente
appium

# 2. Garantir que ANDROID_APP_CONTAINER_PATH está comentado no .env
# 3. Rodar
yarn test
```

## Estrutura

```
src/
├── config/    # wdio.android.conf.ts + wdio.shared.conf.ts
├── locators/  # seletores por tela
├── pages/     # BasePage + LoginScreen
├── tests/     # login.spec.ts
├── types/     # mobile.types.ts
└── utils/     # allure-setup.ts + test.utils.ts
apps/          # APKs (não versionados)
docker-compose.yml
```

## Variável ANDROID_APP_CONTAINER_PATH

Controla o modo de execução:

| Situação         | ANDROID_APP_CONTAINER_PATH | ANDROID_APP_NAME          |
|------------------|---------------------------|---------------------------|
| Local s/ docker  | Comentada (não usada)     | Nome do APK em `apps/`    |
| Local c/ docker  | `/apps/wdio-native-demo-app.apk` | Ignorado          |
| CI (Actions)     | Definida via `env:` no job | Ignorado                 |
