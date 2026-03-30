# web-tests

Testes E2E com **Playwright + Cucumber.js + TypeScript** contra o [SauceDemo](https://www.saucedemo.com).

## Estrutura

```
src/
├── config/       # env.config.ts — leitura do .env
├── data/         # messages.ts — mensagens de erro esperadas
├── features/     # cenários Gherkin (.feature)
├── hooks/        # hooks.ts (Before/After/BeforeAll/AfterAll) + world.ts
├── locators/     # seletores CSS/data-test por página
├── pages/        # Page Objects (BasePage + Login, Inventory, Cart, Checkout)
├── steps/        # step definitions Cucumber
└── utils/        # allure-setup.ts + user.utils.ts
```

## Rodar

```bash
yarn test              # todos os cenários (retry: 1)
yarn test:smoke        # apenas @smoke
yarn test:regression   # apenas @regression
yarn test:web:allure   # relatório Allure
yarn test:web:report   # abre relatório Cucumber HTML
```
