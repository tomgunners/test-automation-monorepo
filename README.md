# Automação de Testes - Projeto Monorepo    [![TA - Pipeline](https://github.com/tomgunners/test-automation-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/tomgunners/test-automation-monorepo/actions/workflows/ci.yml)

Monorepo completo de automação de testes com quatro projetos independentes: **Web E2E**, **API**, **Performance** e **Mobile**

---

## Estrutura do Projeto

```
monorepo/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD (GitHub Actions)
├── web-tests/                      # Testes E2E com Playwright + Cucumber
│   ├── src/
│   │   ├── config/                 # Configurações e variáveis de ambiente
│   │   ├── features/               # Arquivos .feature (BDD/Gherkin)
│   │   ├── hooks/                  # Lifecycle hooks + World do Cucumber
│   │   ├── locators/               # Seletores separados das Pages
│   │   ├── pages/                  # Page Objects
│   │   └── steps/                  # Step definitions
│   ├── .env                        # Variáveis de ambiente
│   ├── cucumber.config.ts          # Configuração do Cucumber
│   ├── package.json
│   └── tsconfig.json
├── api-tests/                      # Testes de API com Supertest + Mocha
│   ├── src/
│   │   ├── client/                 # HTTP Client + Services por recurso
│   │   ├── config/                 # Configuração e setup do Mocha
│   │   ├── schemas/                # Tipos TypeScript + validadores de schema
│   │   ├── tests/                  # Suítes de teste
│   │   └── utils/                  # Utilitários compartilhados
│   ├── .env                        # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
├── performance-tests/              # Testes de Performance com k6
│   ├── src/
│   │   ├── config/                 # Opções e thresholds do k6
│   │   ├── scenarios/              # Scripts de teste k6
│   │   └── utils/                  # Clients HTTP + gerador de relatório
│   └── package.json
├── mobile-tests/                   # Testes Mobile Appium + WebDriveIO               
├── apps/                              # APK / APP do app sob teste
├── src/
│   ├── config/
│   │   ├── wdio.android.conf.ts       # Capabilities Android (UiAutomator2)
│   │   └── wdio.shared.conf.ts        # Config base (reporters, hooks, mocha)
│   ├── locators/                      # Seletores separados das Pages
│   │   └── login.locators.ts
│   ├── pages/                         # Screen Objects
│   │   ├── base.page.ts               # Classe base: wait, tap, fill, swipe
│   │   └── login.screen.ts
│   ├── tests/                         # Specs
│   │   └── login.spec.ts              # 4 cenários
│   ├── types/
│   │   └── mobile.types.ts
│   └── utils/
│   │   └── test.utils.ts              # Credenciais, dados, restartApp()
│   ├── .env                           # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
├── package.json                    # Raiz do monorepo (Yarn Workspaces)
├── .gitignore
└── README.md
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|------------|--------------|------------|
| Node.js    | 18.x         | [nodejs.org](https://nodejs.org) |
| Yarn       | 1.22.x       | `npm install -g yarn` |
| k6         | 0.49.x       | [k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/) |
| Allure CLI | 2.x          | `npm install -g allure-commandline` |
| Java JDK   | ≥ 11         | oracle.com/java |
| Appium 2   | ≥ 2.x        | `npm i -g appium` |


### Pré-requisitos Android

```bash
# 1. Instale o Android Studio e configure ANDROID_HOME e JAVA_HOME
# 2. Instale o driver UiAutomator2
appium driver install uiautomator2

# 3. Verifique o setup completo
npx appium-doctor --android
```

---

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd test-automation-monorepo

# Instalar todas as dependências dos workspaces
yarn install
```

---

## Projeto Testes Web (E2E)

**Stack:** ![Playwright](https://img.shields.io/badge/Playwright-1.42.1-45ba4b?style=flat&logo=playwright&logoColor=white)
![Cucumber](https://img.shields.io/badge/Cucumber-10.3.1-23d96c?style=flat&logo=cucumber&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6?style=flat&logo=typescript&logoColor=white)
![Allure](https://img.shields.io/badge/Allure_Report-3.0.0-orange?style=flat&logo=qase&logoColor=white)

**Aplicação testada:** [https://www.saucedemo.com](https://www.saucedemo.com)

### Cenários cobertos

| Módulo    | Cenário                                     |
|-----------|---------------------------------------------|
| Login     | Login com sucesso                           |
| Login     | Login com credenciais inválidas             |
| Login     | Login com usuário bloqueado                 |
| Carrinho  | Adicionar produto ao carrinho               |
| Carrinho  | Remover produto do carrinho                 |
| Carrinho  | Validar quantidade de itens                 |
| Checkout  | Finalizar compra com sucesso                |
| Checkout  | Campos obrigatórios vazios                  |

### Executar testes

```bash
# Rodar todos os testes web (headless)
yarn test:web

# Rodar com browser visível
cd web-tests && HEADLESS=true yarn test

# Rodar um browser específico
cd web-tests && BROWSER=firefox yarn test

# Abrir o relatório Playwright HTML
yarn test:web:report

# Gerar e abrir relatório Allure
yarn test:web:allure
```

### Variáveis de ambiente (`web-tests/.env`)

| Variável            | Padrão                        | Descrição                |
|---------------------|-------------------------------|--------------------------|
| `BASE_URL`          | `https://www.saucedemo.com`   | URL base da aplicação    |
| `HEADLESS`          | `false`                       | Modo headless            |
| `BROWSER`           | `chromium`                    | chromium/firefox/webkit  |
| `DEFAULT_TIMEOUT`   | `30000`                       | Timeout padrão (ms)      |

### Arquitetura Web

```
src/
├── config/       → Configurações centralizadas (baseUrl, credenciais, timeouts)
├── locators/     → Seletores CSS/data-test separados das Pages
│   ├── login.locators.ts
│   ├── inventory.locators.ts
│   ├── cart.locators.ts
│   └── checkout.locators.ts
├── pages/        → Page Objects (encapsulam interações)
│   ├── base.page.ts     ← Classe base com métodos comuns
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── cart.page.ts
│   └── checkout.page.ts
├── hooks/        → Lifecycle (Before/After) + World (contexto compartilhado)
├── steps/        → Step definitions por módulo
└── features/     → Arquivos .feature em português (BDD/Gherkin)
```

---

## Projeto — Testes de API

**Stack:** ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6?style=flat&logo=typescript&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-6.3.4-333333?style=flat&logo=nodedotjs&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-10.3.0-8d6748?style=flat&logo=mocha&logoColor=white)
![Chai](https://img.shields.io/badge/Chai-4.4.1-f7e3af?style=flat&logo=chai&logoColor=black)
![Mochawesome](https://img.shields.io/badge/Mochawesome-7.1.3-ff6b6b?style=flat&logo=testinglibrary&logoColor=white)

**API testada:** [https://dummyjson.com/docs/users](https://dummyjson.com/docs/users)

### Cenários cobertos

| Método   | Endpoint            | Tipo      | Validações                                    |
|----------|---------------------|-----------|-----------------------------------------------|
| GET      | `/users`            | Positivo  | Status 200, schema de lista, paginação         |
| GET      | `/users/:id`        | Positivo  | Status 200, schema de usuário, email válido    |
| GET      | `/users/:id`        | Negativo  | Status 404 para ID inexistente                 |
| POST     | `/users/add`        | Positivo  | Status 201, ID gerado, campos retornados       |
| PUT      | `/users/:id`        | Positivo  | Status 200, campos atualizados                 |
| PUT      | `/users/:id`        | Negativo  | Status 404 para ID inexistente                 |
| DELETE   | `/users/:id`        | Positivo  | Status 200, flag `isDeleted: true`             |
| DELETE   | `/users/:id`        | Negativo  | Status 404 para ID inexistente                 |

### Executar testes

```bash
# Rodar todos os testes de API
yarn test:api

# Abrir relatório HTML (Mochawesome)
yarn test:api:report
```

### Variáveis de ambiente (`api-tests/.env`)

| Variável          | Padrão                    | Descrição               |
|-------------------|---------------------------|-------------------------|
| `API_BASE_URL`    | `https://dummyjson.com`   | URL base da API         |
| `REQUEST_TIMEOUT` | `10000`                   | Timeout de requisição   |

### Arquitetura API

```
src/
├── client/       → HttpClient base + Services por recurso
│   ├── http.client.ts    ← Classe base com métodos get/post/put/delete
│   └── user.service.ts   ← Service específico do recurso Users
├── schemas/      → Tipos TypeScript + validadores de schema
│   ├── user.types.ts     ← Interfaces e tipos
│   └── user.schema.ts    ← Funções de validação de schema
├── tests/        → Suítes de teste por recurso
│   └── users.test.ts
├── utils/        → Utilitários compartilhados
│   └── api.utils.ts
└── config/       → Configuração e setup
```

---

## Projeto — Testes de Performance

**Stack:** ![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-f7df1e?style=flat&logo=javascript&logoColor=black)
![k6](https://img.shields.io/badge/k6-0.49.x-7d64ff?style=flat&logo=k6&logoColor=white)

**API testada:** [https://dummyjson.com/docs/products](https://dummyjson.com/docs/products)

### Configuração de carga

| Parâmetro           | Valor                        |
|---------------------|------------------------------|
| Usuários simultâneos | 25 VUs (rampa gradual)     |
| Duração total        | 5 minutos                   |
| Rampa de subida      | 3 minutos (0 → 500 VUs)     |
| Sustentação          | 1 minuto (500 VUs estáveis) |
| Rampa de descida     | 1 minuto (500 → 0 VUs)      |

### Thresholds (SLA)

| Métrica              | Threshold    |
|----------------------|--------------|
| `http_req_duration p(95)` | `< 2000ms`    |
| `http_req_duration p(99)` | `< 5000ms`    |
| `http_req_failed`         | `< 0.05%`     |
| `http_reqs` (throughput)  | `> 10 req/s`  |

### Executar testes

```bash
# Rodar teste completo (500 VUs / 5 min)
yarn test:perf

# Rodar com dashboard HTML embutido
cd performance-tests && yarn test:html

# Rodar modo debug (1 VU / 10 seg — para validar o script)
cd performance-tests && yarn test:debug

# Exibir relatório do último resultado
yarn test:perf:report
```

### Relatórios gerados

| Arquivo                       | Descrição                          |
|-------------------------------|------------------------------------|
| `results/report.html`         | Relatório visual HTML completo     |
| `results/summary.json`        | JSON com todas as métricas brutas  |
| Terminal (stdout)             | Sumário formatado com cores        |

---

## Projeto — Testes Mobile

**Stack:** ![WebdriverIO](https://img.shields.io/badge/WebdriverIO-9.x-ea5906?style=flat&logo=webdriverio&logoColor=white)
![Appium](https://img.shields.io/badge/Appium-2.x-662d91?style=flat&logo=appium&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6?style=flat&logo=typescript&logoColor=white)
![Allure](https://img.shields.io/badge/Allure_Report-3.0.0-orange?style=flat&logo=qase&logoColor=white)

**Aplicação testada:** NATIVE DEMO APP (Android)

### Cenários cobertos

| Módulo   | Cenário                                          |
|----------|--------------------------------------------------|
| Login    | Verificar login com sucesso                      |
| Login    | Validar erro ao informar senha inválida          |
| Login    | Validar erro ao informar email incorreto         |
| Login    | Validar erro ao tentar login sem preencher campos|

### Executar testes

```bash
# Passo 1 — Inicie o Appium em um terminal separado
yarn appium:start

# Passo 2 — Inicie o emulador
# Android Studio → Device Manager → ▶ Play

# Passo 3 — Rode os testes
yarn test:mobile          # todos os testes
```

### Variáveis de ambiente (`mobile-tests/.env`)

| Variável                    | Padrão                                      | Descrição                            |
|-----------------------------|---------------------------------------------|--------------------------------------|
| `APPIUM_HOST`               | `127.0.0.1`                                 | Endereço do servidor Appium          |
| `APPIUM_PORT`               | `4723`                                      | Porta do servidor Appium             |
| `ANDROID_PLATFORM_VERSION`  | `14.0`                                      | Versão do Android (`adb shell getprop ro.build.version release`) |
| `ANDROID_DEVICE_NAME`       | `emulator-5554`                             | Serial do dispositivo (`adb devices`)|
| `ANDROID_APP_NAME`          | `Android.SauceLabs.Mobile.Sample.app.apk`   | Nome do APK em `apps/`               |
| `ELEMENT_TIMEOUT`           | `15000`                                     | Timeout de espera por elemento (ms)  |
| `TEST_TIMEOUT`              | `120000`                                    | Timeout total por teste (ms)         |
| `APPIUM_COMMAND_TIMEOUT`    | `300`                                       | Timeout de inatividade da sessão (s) |

---

## Relatórios

### Web Tests

```bash
# Relatório Cucumber HTML (interativo)
yarn test:web:report

# Servir relatório Allure no browser
yarn test:web:allure
```

### API Tests

```bash
# Relatório Mochawesome (interativo)
yarn test:api:report
```

### Performance Tests

```bash
# Relatório Mochawesome (interativo)
yarn test:perf:report
```

### Mobile Tests
```bash
yarn test:mobile:allure     # Gera e abre o relatório Allure
```
---

## Executar Todos os Testes

```bash
# Executa Web → API → Performance sequencialmente
yarn test:all
```

---

## CI/CD

Pipeline configurado em `.github/workflows/ci.yml` para GitHub Actions.

### Triggers
- Push na branche `main`
- Pull Requests para `main`
- Execução manual com seleção de suíte

### Jobs

| Job                 | Trigger          | Artefatos gerados              |
|---------------------|------------------|--------------------------------|
| `api-tests`         | Sempre           | Relatório Mochawesome          |
| `web-tests`         | Sempre           | Allure Report + Cucumber HTML  |
| `performance-tests` | Sempre           | HTML + JSON do k6              |

---

## Decisões Arquiteturais

### Page Object + Locators separados
Seletores ficam em arquivos `*.locators.ts` independentes. Atualizar um seletor não exige tocar na lógica da Page/Screen.

### AccessibilityID como estratégia primária (Mobile)
O seletor `~accessibilityId` funciona igual em Android e iOS. Quando não disponível, usa-se XPath com `@text` para validações de mensagens de erro.

### `browser.reloadSession()` no lugar de `driver.reset()`
O `driver.reset()` foi depreciado no Appium 2. O `reloadSession()` garante estado limpo entre testes sem reinstalar o APK.

### Appium iniciado manualmente (Mobile)
Evita problemas de path do `@wdio/appium-service` no Windows. Iniciar manualmente dá visibilidade dos logs em tempo real.

### HttpClient base + Services (API)
O `HttpClient` abstrai o supertest. Cada `Service` implementa apenas os endpoints do seu recurso, sem duplicar código HTTP.

### k6 com rampa gradual (Performance)
Estágios progressivos simulam tráfego real e evitam spike artificial nos resultados.

---

## Scripts Disponíveis

```bash
# Web
yarn test:web                # Testes E2E
yarn test:web:report         # Relatório Playwright
yarn test:web:allure         # Relatório Allure

# API
yarn test:api                # Testes de API
yarn test:api:report         # Relatório Mochawesome

# Performance
yarn test:performance        # Teste completo (500 VUs)
yarn test:performance:report # Exibe relatório k6

# Mobile
yarn test:mobile             # Todos os testes mobile
yarn test:mobile:allure      # Relatório Allure

# Geral
yarn test:all                # Web + API + Performance
yarn lint                    # ESLint em todos os projetos
yarn clean                   # Remove artefatos gerados
```
