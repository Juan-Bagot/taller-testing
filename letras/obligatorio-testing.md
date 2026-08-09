# Obligatorio — Taller de Introducción al Testing Funcional

El objetivo es aplicar los conocimientos del taller para automatizar, con **Playwright**,
los casos de prueba de la aplicación de la clínica incluida en este repositorio
(`aplicacion/`, levantada en local con Docker, en `http://localhost:9080`).

El catálogo completo de casos —con precondiciones, pasos y resultado esperado— está
publicado **en la propia aplicación**: `http://localhost:9080/casos.php` (web y
visuales) y `http://localhost:9080/casos-api.php` (API). El mismo contenido está en
`casos-de-prueba.md` para leerlo desde GitHub.

Se trabaja en grupos, según el cronograma del curso.

## La aplicación y sus casos de uso

La aplicación bajo prueba es el sitio de una clínica con dos roles y estos casos de uso:

| Caso de uso | Quién | Casos de prueba |
|---|---|---|
| Registrarse (como médico o paciente) | cualquiera | TC01–TC03 |
| Iniciar y cerrar sesión | cualquiera | TC04–TC07 |
| Control de acceso por rol | — | TC08–TC10 |
| Ver el catálogo, ordenarlo y buscar | cualquiera | TC11–TC14 |
| Ver el detalle de una prestación (estudio o terapia) | cualquiera | TC15–TC17 |
| Agregar, modificar y eliminar prestaciones | médico | TC18–TC24 |
| Seguir y dejar de seguir prestaciones | paciente | TC25–TC26 |
| Armar la solicitud (carrito), confirmar la orden y ver el historial | paciente | TC27–TC30 |
| Presentación visual (escritorio y móvil) | — | TV01–TV06 |
| La API JSON (login, listar, detalle, crear, modificar, eliminar) | según endpoint | TA01–TA13 |

Datos semilla siempre disponibles: la médica `admin@mail.com/admin123` y los pacientes
`ana@mail.com/ana123` y `luis@mail.com/luis123`, con 8 prestaciones, seguidas y órdenes
precargadas (el detalle está en el encabezado del catálogo de casos).

## Puntuación

| Logro | Nota |
|---|---|
| **18 casos** del catálogo automatizados y verdes | **6** (mínimo de aprobación del taller) |
| **26 casos** automatizados y verdes | **9** |
| 26 casos **+ 5 casos de API** | **10** |
| 26 casos **+ 9 casos de API** | **11** |
| 26 casos **+ los 13 casos de API** | **12** |

Condiciones sobre la selección de casos:

- Los 18/26 se componen de casos **web (TC) y visuales (TV)**; los de API (TA) puntúan
  por la escalera de arriba, recién a partir de los 26.
- Los casos deben **cubrir todos los flujos** (no vale llegar a 18 solo con catálogo y
  búsqueda): registro, login/sesión, control de acceso, catálogo, detalle, CRUD,
  seguidas y solicitud/orden/historial deben estar todos representados.
- Al menos **2 casos visuales** (TV) dentro del corte de 18.

## Requisitos técnicos (excluyentes)

- **Page objects** para las pantallas usadas y **helpers** compartidos (login, mensajes
  flash, datos únicos): **sin duplicación** — si un botón cambia de nombre, se corrige
  en un solo archivo.
- **Estructura clara**: `pages/`, `helpers/`, `tests/` agrupados por flujo. Se valorará
  la organización y la claridad de los tests.
- **Tests independientes**: la suite corre en cualquier orden y repetidas veces. Regla
  de oro del catálogo: datos únicos con timestamp, limpieza de lo creado, nada de
  conteos absolutos. Los casos ⚠ van documentados.
- Tests **web y visuales** (las baselines se commitean, generadas en el sistema
  operativo del grupo — documentarlo en el README). Tests **híbridos** (la API prepara
  los datos, la interfaz los verifica) son opcionales y suman en la defensa.
- El **codegen** de Playwright se puede (y conviene) usar para grabar el borrador de
  cada caso — pero lo grabado se **refactoriza** a page objects y selectores accesibles:
  código de codegen sin refactorizar se nota y resta.
- **`README.md` propio**: cómo levantar la aplicación, cómo instalar y correr la suite,
  cómo regenerar las baselines, cómo resetear la base.
- La suite entera debe quedar **verde** corriendo `npm test` contra una base recién
  sembrada — así se corrige.

El proyecto `proyecto-tests/` de este repositorio es el **punto de partida**: estructura,
configuración, page objects iniciales y 4 casos resueltos como referencia. No hay otro
proyecto de referencia: la guía (`guia/guia-testing.md`) explica cómo construir todo lo
demás, caso por caso.

## Entrega

- Según el cronograma del curso.
- La solución va en un repositorio **privado** de GitHub al cual el usuario **yonaplast**
  tiene acceso de lectura.
- La historia del repositorio debe mostrar **commits de todos los integrantes**.

## Defensa

Durante la semana posterior a la entrega se realizará una **defensa oral** con cada
grupo. Preguntas típicas:

- ¿Por qué page objects? Mostrá qué archivos cambiarías si el botón "Entrar" pasara a
  llamarse "Ingresar".
- ¿Qué esperas automáticas usa Playwright? ¿Por qué en tu suite no hay
  `waitForTimeout`?
- ¿Qué es *flakiness*? Mostrá un test tuyo que podría ser flaky y cómo lo evitaste.
- ¿Por qué `getByRole`/`getByLabel` antes que selectores CSS? ¿Qué le pasa a tu test si
  cambia la clase CSS del botón?
- ¿Qué partes de este test salieron del codegen y qué refactorizaste? ¿Por qué?
- ¿Por qué tu test de eliminar crea su propia prestación en lugar de borrar una de la
  semilla?
- ¿Qué diferencia hay entre el precio del catálogo y el del historial, y cómo lo
  verifica tu test?
- Se elige un test al azar y se explica línea por línea, corriéndolo en vivo.
