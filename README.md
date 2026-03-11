# Automação de Testes - Projeto Monorepo [![TA - Pipeline](https://github.com/tomgunners/test-automation-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/tomgunners/test-automation-monorepo/actions/workflows/ci.yml)

Monorepo completo de automação de testes com quatro projetos independentes: **Web E2E**, **API**, **Performance** e **Mobile**

---

## Estrutura do Projeto

```
test-automation-monorepo/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD (GitHub Actions)
├── web-tests/                      # Testes E2E com Playwright + Cucumber
│   ├── src/
│   │   ├── config/                 # Configurações e variáveis de ambiente
│   │   ├── features/               # Arquivos .feature (BDD/Gherkin) com tags @smoke/@regression
│   │   ├── hooks/                  # Lifecycle hooks + World do Cucumber
│   │   ├── locators/               # Seletores separados das Pages
│   │   ├── pages/                  # Page Objects
│   │   └── steps/                  # Step definitions
│   ├── .env                        # Variáveis de ambiente
│   ├── cucumber.js                 # Perfis: default | smoke | regression | allure
│   ├── package.json
│   └── tsconfig.json
├── api-tests/                      # Testes de API com Supertest + Mocha
│   ├── src/
│   │   ├── client/                 # HTTP Client + Services por recurso
│   │   ├── config/                 # Configuração e setup do Mocha
│   │   ├── schemas/                # Tipos TypeScript + validadores de schema
│   │   ├── tests/                  # Suítes de teste
│   │   └── utils/                  # Utilitários compartilhados
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── performance-tests/              # Testes de Performance com k6
│   ├── src/
│   │   ├── config/                 # Perfis de carga: load | spike | soak
│   │   ├── scenarios/              # Scripts de teste k6
│   │   └── utils/                  # Clients HTTP + gerador de relatório
│   └── package.json
├── mobile-tests/                   # Testes Mobile com WebdriverIO + Appium 2
│   ├── apps/                       # APK do app sob teste
│   ├── src/
│   │   ├── config/
│   │   │   ├── wdio.android.conf.ts
│   │   │   └── wdio.shared.conf.ts
│   │   ├── locators/
│   │   ├── pages/
│   │   ├── tests/
│   │   ├── types/
│   │   └── utils/
│   ├── .env
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
| Node.js    | 20.x         | [nodejs.org](https://nodejs.org) |
| Yarn       | 1.22.x       | `npm install -g yarn` |
| k6         | 0.49.x       | [k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/) |
| Allure CLI | 2.x          | `npm install -g allure-commandline` |
| Java JDK   | ≥ 11         | oracle.com/java |
| Appium 2   | ≥ 2.x        | `npm i -g appium` |

---

## Instalação

```bash
git clone <url-do-repositorio>
cd test-automation-monorepo
yarn install
```

---

## Projeto — Testes Web (E2E)

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

### Variável HEADLESS

| Valor | Comportamento |
|-------|---------------|
| `HEADLESS=true`  | Browser sem janela
| `HEADLESS=false` | Browser visível 

### Tags disponíveis nos cenários

| Tag | Quando usar |
|-----|-------------|
| `@smoke`      | Cenários críticos e rápidos — validação pós-deploy |
| `@regression` | Cobertura completa — antes de releases |
| `@severity:critical` / `@severity:normal` | Severidade para o relatório Allure |

### Executar testes

```bash
# Todos os cenários (headless, perfil default)
yarn test:web

# Apenas smoke (críticos, mais rápido)
yarn test:web:smoke

# Regressão completa
yarn test:web:regression

# Com browser visível (debug)
yarn test:web:headed

# Ou passando tag diretamente:
cd web-tests && npx cucumber-js --tags "@smoke"
cd web-tests && npx cucumber-js --tags "@regression and not @wip"

# Relatórios
yarn test:web:report    # Cucumber HTML
yarn test:web:allure    # Gera e abre relatório Allure
```

### Variáveis de ambiente (`web-tests/.env`)

| Variável            | Padrão                      | Descrição               |
|---------------------|-----------------------------|-------------------------|
| `BASE_URL`          | `https://www.saucedemo.com` | URL base da aplicação   |
| `HEADLESS`          | `true`                      | `true` = sem janela     |
| `BROWSER`           | `chromium`                  | chromium / firefox / webkit |
| `SLOW_MO`           | `0`                         | Delay entre ações (ms)  |
| `DEFAULT_TIMEOUT`   | `10000`                     | Timeout padrão (ms)     |
| `NAVIGATION_TIMEOUT`| `60000`                     | Timeout de navegação (ms)|

### Arquitetura Web

```
src/
├── config/    → env.config.ts (lê .env e exporta config tipado)
├── features/  → .feature com tags @smoke / @regression / @severity
├── hooks/     → hooks.ts (browser 1x no BeforeAll, contexto por cenário)
│               world.ts  (CustomWorld — página e page objects)
├── locators/  → Seletores CSS separados das Pages
├── pages/     → Page Objects (base.page.ts + pages específicas)
└── steps/     → Step definitions por módulo
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
yarn test:api           # Roda todos os testes de API
yarn test:api:report    # Abre relatório Mochawesome
```

### Variáveis de ambiente (`api-tests/.env`)

| Variável          | Padrão                  | Descrição             |
|-------------------|-------------------------|-----------------------|
| `API_BASE_URL`    | `https://dummyjson.com` | URL base da API       |
| `REQUEST_TIMEOUT` | `10000`                 | Timeout de requisição |

---

## Projeto — Testes de Performance

**Stack:** ![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-f7df1e?style=flat&logo=javascript&logoColor=black)
![k6](https://img.shields.io/badge/k6-0.49.x-7d64ff?style=flat&logo=k6&logoColor=white)

**API testada:** [https://dummyjson.com/docs/products](https://dummyjson.com/docs/products)

### Perfis de carga

| Perfil  | Descrição | VUs máx | Duração |
|---------|-----------|---------|---------|
| `load`  | Rampa gradual — tráfego normal | 25 VUs | ~3 min |
| `spike` | Pico repentino — burst de tráfego | 100 VUs | ~1,5 min |
| `soak`  | Endurance — detecta degradação longa | 15 VUs | ~10 min |

### Modos de execução

| Modo | Script | Comportamento no CI |
|------|--------|---------------------|
| `gate`        | `test:perf:gate`        | Quebra o pipeline se thresholds falharem |
| `informative` | `test:perf:informative` | Apenas reporta, nunca quebra o pipeline  |

### Executar testes

```bash
# Modo gate com perfil load (padrão — quebra se thresholds falharem)
yarn test:perf

# Modo informativo (nunca quebra o pipeline)
yarn test:perf:informative

# Perfis específicos
yarn test:perf:spike   # Teste de pico
yarn test:perf:soak    # Teste de endurance

# Com variáveis customizadas
cd performance-tests
STAGES_PROFILE=spike k6 run src/scenarios/products.test.js
VUS=50 DURATION=2m k6 run src/scenarios/products.test.js

# Relatório do último resultado
yarn test:perf:report
```

### Variáveis de ambiente (k6)

| Variável         | Padrão   | Descrição |
|------------------|----------|-----------|
| `BASE_URL`       | `https://dummyjson.com` | URL alvo |
| `STAGES_PROFILE` | `load`   | Perfil: `load` \| `spike` \| `soak` |
| `VUS`            | —        | VUs custom (sobrescreve o perfil) |
| `DURATION`       | —        | Duração custom, ex.: `5m` (sobrescreve o perfil) |

### Thresholds (SLA)

| Métrica                    | Threshold  |
|----------------------------|------------|
| `http_req_duration p(95)`  | `< 2000ms` |
| `http_req_duration p(99)`  | `< 5000ms` |
| `http_req_failed`          | `< 5%`     |
| `http_reqs` (throughput)   | `> 10 req/s` |

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
# Passo 1 — Inicie o Appium
appium

# Passo 2 — Inicie o emulador no Android Studio

# Passo 3 — Adicione o APK
# Baixe em: https://github.com/webdriverio/native-demo-app/releases
# Coloque em mobile-tests/apps/wdio-native-demo-app.apk

# Passo 4 — Rode os testes
yarn test:mobile

# Relatório Allure
yarn test:mobile:allure
```

### Variáveis de ambiente (`mobile-tests/.env`)

| Variável                   | Padrão         | Descrição |
|----------------------------|----------------|-----------|
| `APPIUM_HOST`              | `127.0.0.1`    | Endereço Appium |
| `APPIUM_PORT`              | `4723`         | Porta Appium |
| `ANDROID_PLATFORM_VERSION` | `15.0`         | Versão Android |
| `ANDROID_DEVICE_NAME`      | `emulator-5554`| Serial do dispositivo |
| `ANDROID_APP_NAME`         | `wdio-native-demo-app.apk` | Nome do APK em `apps/` |
| `ELEMENT_TIMEOUT`          | `15000`        | Timeout de elemento (ms) |
| `TEST_TIMEOUT`             | `120000`       | Timeout por teste (ms) |
| `APPIUM_COMMAND_TIMEOUT`   | `300`          | Timeout de inatividade (s) |

---

## Relatórios

```bash
# Web
yarn test:web:report         # Cucumber HTML
yarn test:web:allure         # Allure (gera + abre)

# API
yarn test:api:report         # Mochawesome HTML

# Performance
yarn test:perf:report        # Sumário k6 no terminal + HTML em results/

# Mobile
yarn test:mobile:allure      # Allure (gera + abre)
```

---

## Scripts disponíveis (raiz do monorepo)

```bash
# Web
yarn test:web                # Todos os cenários (headless)
yarn test:web:smoke          # Apenas @smoke
yarn test:web:regression     # Apenas @regression
yarn test:web:report         # Relatório Cucumber HTML
yarn test:web:allure         # Relatório Allure

# API
yarn test:api                # Todos os testes de API
yarn test:api:report         # Relatório Mochawesome

# Performance
yarn test:perf               # Gate mode, perfil load
yarn test:perf:informative   # Apenas reporta, nunca quebra
yarn test:perf:spike         # Perfil spike
yarn test:perf:soak          # Perfil soak/endurance
yarn test:perf:report        # Exibe último resultado

# Mobile
yarn test:mobile             # Todos os testes mobile
yarn test:mobile:allure      # Relatório Allure

# Utilitários
yarn test:all                # Web + API + Performance + Mobile
yarn lint                    # ESLint em todos os workspaces
yarn clean                   # Remove artefatos gerados
```

---

## CI/CD

Pipeline em `.github/workflows/ci.yml` para GitHub Actions.

### Triggers

- Push na branch `main`
- Pull Requests para `main`
- Execução manual com seleção de suíte, perfil web, modo performance e perfil k6

### Jobs

| Job                        | Artefatos gerados |
|----------------------------|-------------------|
| API Tests                  | Relatório Mochawesome |
| Web Tests (smoke)          | Allure Report + Cucumber HTML |
| Web Tests (regression)     | Allure Report + Cucumber HTML |
| Performance Tests          | HTML + JSON do k6 |

### Configuração de HEADLESS no CI

O CI define `HEADLESS: 'true'`, o que faz o browser rodar sem janela — comportamento correto e esperado em ambientes headless como o `ubuntu-latest`. Não há inversão de lógica: `HEADLESS=true` significa sem janela.

---

## Decisões Arquiteturais

### Headless sem inversão (Web)
`HEADLESS=true` → browser sem janela. `HEADLESS=false` → browser visível. A variável é lida diretamente por `process.env.HEADLESS === 'true'` sem nenhuma negação no código.

### Browser reutilizado entre cenários (Web)
O browser é lançado uma única vez no `BeforeAll` e fechado no `AfterAll`. Cada cenário cria um `context` isolado com sua própria `page`. Isso reduz o tempo total da suíte e mantém isolamento completo entre os cenários.

### Tags @smoke / @regression (Web)
Cenários críticos recebem `@smoke` — executados em todo push para validação rápida. Cenários de cobertura completa recebem `@regression` — executados antes de releases.

### Dois modos de performance no CI
`test:perf:gate` quebra o pipeline quando thresholds de SLA falham — comportamento de quality gate real. `test:perf:informative` usa `--no-thresholds` e nunca quebra — ideal para monitoramento contínuo ou ambientes instáveis.

### Perfis de carga k6 (load / spike / soak)
Cada perfil usa `scenarios` com `executor: ramping-vus`, refletindo padrões profissionais de carga. O perfil é selecionável via `STAGES_PROFILE` ou sobrescrito com `VUS` + `DURATION` para execuções ad-hoc.

### Page Object + Locators separados
Seletores ficam em arquivos `*.locators.ts` independentes. Atualizar um seletor não exige tocar na lógica da Page/Screen.

### Screenshot + logs no Allure (Mobile)
O hook `afterTest` salva o screenshot em disco, anexa ao Allure como `image/png` e adiciona um attachment `text/plain` com mensagem e stack trace do erro — tudo em um único passo de falha.

### `browser.reloadSession()` no lugar de `driver.reset()` (Mobile)
O `driver.reset()` foi depreciado no Appium 2. O `reloadSession()` garante estado limpo entre testes sem reinstalar o APK.
