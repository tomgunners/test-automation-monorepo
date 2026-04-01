# Test Automation Monorepo

Monorepo de automação de testes cobrindo **API** e **Mobile Android**, com relatórios Allure publicados automaticamente no GitHub Pages via GitHub Actions.

---

## Estrutura

```
.
├── api-tests/            # Supertest + Mocha + Chai + TypeScript (DummyJSON)
├── mobile-tests/         # WebdriverIO v8 + Appium 2 + TypeScript (Android 14)
├── web-tests/            # Playwright + Cucumber + TypeScript (SauceDemo)
└── performance-tests/    # k6 (DummyJSON Products API)
```

---

## Pré-requisitos

| Ferramenta        | Versão mínima | Necessário para   |
|-------------------|---------------|-------------------|
| Node.js           | 20.x          | Todos             |
| Yarn              | 1.22.x        | Todos             |
| Docker Desktop    | —             | mobile-tests      |
| Allure CLI        | 2.x           | Relatórios locais |
| k6                | latest        | performance-tests |

---

## Instalação

```bash
# Instalar todas as dependências — pronto para rodar
yarn install

# Playwright (apenas web-tests)
yarn playwright:install
```

---

## Executando

### API
```bash
yarn test:api               # Mocha + Allure + Mochawesome em paralelo
yarn test:api:report        # Abre reports/api-report.html (Mochawesome)
yarn workspace api-tests report:allure   # Relatório Allure interativo
```

### Mobile (local via emulador)
```bash
# 1. Baixe o APK e coloque em mobile-tests/apps/
#    https://github.com/webdriverio/native-demo-app/releases/tag/v2.0.0

# 2. Inicie o Appium
appium

# 3. Inicie o emulador Android 14 no Android Studio
#    (ou conecte um dispositivo físico via USB)

# 4. Rode os testes
yarn test:mobile

# 5. Relatório Allure
yarn test:mobile:allure
```

### Web E2E
```bash
yarn test:web:smoke
yarn test:web:regression
yarn test:web:allure
```

### Performance
```bash
yarn test:perf:informative
yarn test:perf
```

---

## CI/CD — GitHub Actions

### Jobs

| Job              | O que faz                                                              |
|------------------|------------------------------------------------------------------------|
| `api-tests`      | Executa testes, faz upload dos Allure results e Mochawesome report     |
| `mobile-android` | Sobe `docker-android:emulator_14.0`, executa, faz upload dos results  |
| `publish-reports`| Gera Allure reports, cria dashboard `index.html` → GitHub Pages        |

> O `shared` é resolvido via `ts-node` em runtime — não há job de build.

### Secrets necessários

| Secret                     | Descrição                       |
|----------------------------|---------------------------------|
| `MOBILE_STANDARD_USER`     | Email do usuário válido no app  |
| `MOBILE_STANDARD_PASSWORD` | Senha do usuário válido         |

### GitHub Pages

Após o primeiro push em `main` ou `develop`:
```
https://<owner>.github.io/<repo>/
```

---

## mobile-tests — Execução local vs CI

| Modo           | Como funciona                                      | Variável de controle            |
|----------------|----------------------------------------------------|---------------------------------|
| Local direto   | Appium rodando na máquina, APK em `apps/`          | `ANDROID_APP_NAME`              |
| docker compose | Container docker-android, APK em `/apps/` (volume) | `ANDROID_APP_CONTAINER_PATH`    |
| GitHub Actions | docker run no runner, variáveis via `env:`         | `ANDROID_APP_CONTAINER_PATH`    |

---

## Workspace `@automation/shared`

```ts
import { setupAllure } from '@automation/shared';

setupAllure({
  environment: { Browser: 'Chromium', 'Base.URL': 'https://example.com' },
  categories:  [...], // opcional — usa categorias comuns se omitido
});
```
