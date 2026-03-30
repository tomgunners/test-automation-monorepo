# performance-tests

Testes de performance com **k6** contra a [DummyJSON Products API](https://dummyjson.com/products).

## Perfis de carga

| Perfil | VUs | Duração | Objetivo |
|--------|-----|---------|----------|
| `load`  | 500 | 1m ramp + 5m sustain | baseline de carga |
| `spike` | 50→1000→50 | ~2m total | resistência a picos |
| `soak`  | 200 | 2m ramp + 28m sustain | detecção de memory leak |

## Rodar

```bash
yarn test:gate           # com thresholds (quebra se SLAs falharem)
yarn test:informative    # sem thresholds
yarn test:spike
yarn test:soak
yarn test:perf:report    # abre results/report.html
```

## Variáveis customizadas

```bash
cross-env VUS=50 DURATION=30s yarn test:gate
```
