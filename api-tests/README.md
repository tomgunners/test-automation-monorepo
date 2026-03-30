# api-tests

Testes de API com **Supertest + Mocha + Chai + TypeScript** contra a [DummyJSON API](https://dummyjson.com).

## Relatórios gerados

| Relatório    | Localização               | Como abrir              |
|--------------|---------------------------|-------------------------|
| Mochawesome  | `reports/api-report.html` | `yarn test:report`      |
| Allure       | `allure-results/`         | `yarn report:allure`    |

## Estrutura

```
src/
├── client/    # HttpClient (base) + UserService
├── config/    # api.config.ts + setup.ts (bootstrap Mocha + Allure)
├── schemas/   # user.types.ts + user.schema.ts (validações Chai)
├── tests/     # users.test.ts
└── utils/     # api.utils.ts + allure-setup.ts
```

## Rodar

```bash
yarn test              # Mocha + Allure + Mochawesome em paralelo
yarn test:report       # Abre reports/api-report.html (Mochawesome)
yarn report:allure     # Gera e abre relatório Allure interativo
```
