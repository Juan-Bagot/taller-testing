# proyecto-tests — el punto de partida del obligatorio

Estructura de Playwright pronta + 4 casos del catálogo resueltos como referencia
(TC04, TC06, TC08, TC09, TV04 y TA09). El resto del catálogo lo automatizan ustedes,
en SU propio repositorio, usando esto como base.

## Arrancar

```bash
# 0. La aplicación bajo prueba tiene que estar corriendo (ver ../aplicacion/README.md)

npm install               # dependencias
npx playwright install    # los navegadores que Playwright controla
npm test                  # correr la suite
npm run report            # el reporte HTML de la última corrida
```

> La primera corrida del test visual **crea su baseline** y "falla" avisándolo: es
> normal. La segunda corrida ya compara contra ella.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm test` | corre toda la suite (headless) |
| `npm run test:headed` | con el navegador visible |
| `npm run test:ui` | el UI mode: la mejor forma de desarrollar tests |
| `npm run test:debug` | paso a paso con el inspector |
| `npm run report` | abre el reporte HTML |
| `npm run baselines` | regenera las baselines visuales (solo si el cambio visual es deseado) |
| `npm run codegen` | abre el grabador de Playwright sobre la app (guía §6) |

## Estructura

```
playwright.config.ts   baseURL :9080 · workers:1 (la base es compartida) · proyectos escritorio/movil
fixtures.ts            comoPaciente / comoAna / comoMedico — la sesión ya pronta
pages/                 un page object por pantalla (CÓMO se opera cada página)
helpers/               usuarios semilla · datos únicos · flash · cliente de API
tests/ejemplos/        los 4 specs resueltos, comentados — leerlos antes de escribir el primero
```

La guía (`../guia/guia-testing.md`) explica cada pieza; el catálogo a automatizar está
en `../casos-de-prueba.md` (el paso a paso de cada caso, legible en GitHub sin la app
levantada; la app lo sirve además en `/casos.php`); la puntuación, en
`../letras/obligatorio-testing.md`.
