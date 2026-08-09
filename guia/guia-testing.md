# Guía — Taller de Introducción al Testing Funcional

Esta guía te lleva de cero al obligatorio completo: la aplicación bajo prueba corriendo
en tu máquina, Playwright instalado, y los cuatro tipos de test que vas a escribir
(funcionales, visuales, de API e híbridos) explicados con el código real del starter
`proyecto-tests/` — la guía se genera desde ese código, así que no pueden divergir.

**En este taller no hay un proyecto terminado de referencia**: el starter trae la
estructura y 4 casos resueltos, y esta guía enseña a construir todo lo demás — incluido
el **codegen** (§6), que graba lo que hacés en el navegador y lo convierte en código.

El catálogo de lo que hay que automatizar vive en dos lugares equivalentes: en
**`casos-de-prueba.md`** (el paso a paso completo de cada caso, legible en GitHub sin
levantar nada) y publicado **en la propia aplicación** (`http://localhost:9080/casos.php`
y `/casos-api.php`). La puntuación, en **`letras/obligatorio-testing.md`**.

## Índice

1. [Qué es el testing automatizado](#1-qué-es-el-testing-automatizado)
2. [Instalaciones](#2-instalaciones)
3. [Levantar la aplicación bajo prueba](#3-levantar-la-aplicación-bajo-prueba)
4. [El primer test y la anatomía del proyecto](#4-el-primer-test-y-la-anatomía-del-proyecto)
5. [Selectores accesibles](#5-selectores-accesibles)
6. [El codegen: grabar para empezar](#6-el-codegen-grabar-para-empezar)
7. [Page objects, helpers y fixtures](#7-page-objects-helpers-y-fixtures)
8. [Datos de prueba y estado: la regla de oro](#8-datos-de-prueba-y-estado-la-regla-de-oro)
9. [Tests visuales](#9-tests-visuales)
10. [Tests de API](#10-tests-de-api)
11. [Depurar: UI mode y trace viewer](#11-depurar-ui-mode-y-trace-viewer)
12. [Serie y paralelo](#12-serie-y-paralelo)
13. [Errores frecuentes](#13-errores-frecuentes)
14. [Baselines visuales y sistemas operativos](#14-baselines-visuales-y-sistemas-operativos)
15. [Cómo encarar el obligatorio](#15-cómo-encarar-el-obligatorio)

---

## 1. Qué es el testing automatizado

Un test automatizado es un programa que usa tu aplicación y verifica que se comporte como
debe: abre el navegador, completa formularios, aprieta botones y **aserta** resultados.
Lo que un tester manual haría una vez, el test lo repite en segundos, mil veces, igual.

La clásica **pirámide de tests** ordena los niveles: abajo los **unitarios** (una función,
milisegundos, miles), al medio los de **API/integración** (un servicio completo por HTTP),
arriba los de **interfaz** (el sistema entero, por el navegador — los más realistas y los
más caros). Este taller trabaja los dos niveles de arriba: tests de interfaz con Playwright
y tests de API contra la mini-API de la aplicación. Probamos **desde afuera**, como un
usuario: sin tocar el código interno de la app, que para nosotros es una caja negra con
comportamiento especificado — el catálogo de casos.

> La aplicación bajo prueba es la clínica del taller de PHP: registro y login con roles
> (médico/paciente), un catálogo con CRUD, seguidas, y órdenes con carrito en sesión.
> No hace falta saber PHP: se prueba por el navegador y por HTTP.

## 2. Instalaciones

Dos herramientas: **Node.js** (donde corre Playwright) y **Docker** (donde corre la
aplicación bajo prueba).

### 2.1 Node.js 20 o superior

```powershell
# Windows (PowerShell):
winget install OpenJS.NodeJS.LTS
```

```bash
# macOS:
brew install node

# Linux (Debian/Ubuntu):
sudo apt install nodejs npm
```

**Comprobación:** `node -v` tiene que responder `v20` o más, y `npm -v` un número.
Si dice `command not found`, cerrá y abrí la terminal.

### 2.2 Docker

Igual que en cualquier curso que lo use: **Docker Desktop** en Windows (requiere WSL2:
`wsl --install` como administrador y reiniciar) y macOS; en Linux, el paquete `docker.io`
+ `docker-compose-v2` y tu usuario en el grupo `docker`.

**Comprobación:** `docker --version` y `docker compose version` responden.

### 2.3 Un editor

El que quieras. Si usás **VS Code**, instalá la extensión oficial **Playwright Test for
VSCode**: corre tests desde el editor y te muestra el navegador en vivo.

## 3. Levantar la aplicación bajo prueba

La app vive en `aplicacion/` de este repositorio. Se levanta con Docker:

```bash
cd aplicacion
docker compose up -d --build
docker compose exec web php /var/www/app/datos/datos_iniciales.php   # los datos semilla
```

| Qué | Dónde |
|---|---|
| La aplicación (lo que se testea) | **http://localhost:9080** |
| phpMyAdmin (mirar la base por dentro) | http://localhost:9081 (usuario `clinica`, clave `clinica`) |

Entrá a http://localhost:9080, logueate con `ana@mail.com` / `ana123` y recorré la app
**a mano** antes de automatizar nada: no se puede testear lo que no se conoce.

> **Si también cursás el taller de PHP:** esta copia usa puertos propios (9080/9081/3307)
> y nombres de contenedor propios (`clinica-testing-*`). Las dos clínicas pueden estar
> levantadas a la vez sin chocar. Los tests corren SIEMPRE contra la 9080.

Para volver la base a cero (el "mundo recién nacido" del catálogo):

```bash
docker compose down -v && docker compose up -d --build
docker compose exec web php /var/www/app/datos/datos_iniciales.php
```

## 4. El primer test y la anatomía del proyecto

El starter `proyecto-tests/` ya trae todo configurado. Para arrancar:

```bash
cd proyecto-tests
npm install               # las dependencias (Playwright)
npx playwright install    # los navegadores que Playwright controla
npm test                  # correr la suite
npm run report            # abrir el reporte HTML de la última corrida
```

Un test de Playwright es una función que recibe una `page` (una pestaña de navegador
limpia) y hace lo que haría un usuario. Este es el primero del starter, que resuelve
los casos TC04 y TC06 del catálogo:

```ts
// EJEMPLO 1 — resuelve TC04 y TC06 del catálogo.
// Muestra: page object + helper de flash + aserciones de URL y de visibilidad.

import { expect, test } from '@playwright/test';
import { PaginaLogin } from '../../pages/PaginaLogin';
import { ANA } from '../../helpers/usuarios';
import { esperarFlash } from '../../helpers/flash';

test('TC04: login exitoso de paciente', async ({ page }) => {
  await new PaginaLogin(page).entrar(ANA.email, ANA.password);

  // Primero la URL (el redirect del patrón POST-Redirect-GET), después el contenido.
  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, 'ok', `Hola, ${ANA.nombre}.`);

  // El nav del paciente: sus secciones visibles, y las del médico ausentes.
  await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(0);
});

test('TC06: credenciales inválidas — mismo mensaje, exista o no el email', async ({ page }) => {
  const login = new PaginaLogin(page);

  // Contraseña incorrecta de un usuario que existe:
  await login.entrar(ANA.email, 'incorrecta');
  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(page, 'error', 'Email o contraseña incorrectos.');

  // Usuario que NO existe: el mensaje tiene que ser EXACTAMENTE el mismo
  // (la app no revela cuál de las dos cosas falló).
  await login.entrar('noexiste@mail.com', 'loquesea');
  await esperarFlash(page, 'error', 'Email o contraseña incorrectos.');
});
```

Tres cosas para notar:

- **`expect(...)` espera solo.** `toHaveURL`, `toBeVisible`, `toHaveText` reintentan
  hasta que se cumplan (o hasta el timeout). Por eso en Playwright casi no existe
  "esperá 2 segundos": las esperas son automáticas y por condición, no por reloj.
- El orden de las aserciones importa: primero la **URL** (confirma que el redirect del
  POST ocurrió), después el **contenido**.
- El test no sabe qué campos tiene el login: se lo pide al **page object** (§7).

La configuración del proyecto está en un solo archivo:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // La base de datos es UNA y es compartida por todos los tests: se corre en
  // serie. Paralelizar exigiría aislar los datos por worker (ver guía §11).
  fullyParallel: false,
  workers: 1,

  use: {
    // La clínica del taller (puertos 9080/9081/3307 — NO es la del curso de PHP).
    baseURL: 'http://localhost:9080',
    // Ante el primer reintento de un test fallido, grabar el trace para depurar.
    trace: 'on-first-retry',
    locale: 'es-UY',
  },

  expect: {
    // Tolerancia de los tests visuales: absorbe diferencias mínimas de
    // antialiasing sin dejar pasar cambios reales de la interfaz.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },

  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      // El proyecto móvil corre SOLO los specs visuales (testMatch):
      // es donde el @media de la app cambia el layout.
      name: 'movil',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
      testMatch: /.*visual.*/,
    },
  ],
});
```

## 5. Selectores accesibles

Un selector es cómo el test encuentra un elemento. La regla del taller: **primero los
selectores accesibles**, los que describen el elemento como lo ve una persona:

| Selector | Encuentra | Ejemplo |
|---|---|---|
| `getByRole('button', { name: 'Entrar' })` | el botón que DICE Entrar | botones, links, headings, filas |
| `getByLabel('Email')` | el campo cuya etiqueta dice Email | inputs con `<label>` |
| `getByText('...')` | el texto visible | párrafos, mensajes |
| `locator('.mensaje-error')` | por clase CSS — el último recurso | cuando no hay rol ni label |

¿Por qué? Un selector CSS profundo (`div > table tr:nth-child(3) span.precio`) se rompe
con cualquier cambio de maquetado. `getByRole('row', { name: /Audiometría/ })` sobrevive
a todo menos a que la fila deje de existir — y describe la **intención** del test.

La aplicación se presta: todos los inputs tienen `<label>`, todos los botones tienen
texto. El único `locator()` por clase del starter es el del mensaje flash
(`.mensaje-ok` / `.mensaje-error`), que no tiene un rol semántico.

## 6. El codegen: grabar para empezar

Playwright trae un **grabador**: abrís la app, usás el sitio como una persona, y el
codegen va escribiendo el código de lo que hacés — con selectores accesibles, elegidos
solos.

```bash
npm run codegen        # equivale a: npx playwright codegen http://localhost:9080
```

Se abren dos ventanas: el navegador (usalo normal) y el inspector, donde el código
aparece en vivo. Además, al pasar el mouse por la página te muestra el selector que
usaría para cada elemento — funciona también como **explorador de selectores**.

### El flujo de trabajo para CADA caso del catálogo

Este es el circuito que vas a repetir durante todo el obligatorio:

1. **Leé el caso** en `casos.php` (precondiciones, pasos, resultado esperado).
2. **Grabalo** con el codegen: ejecutá los pasos a mano, tal como los describe el caso.
3. **Pegá** lo generado en un spec y corrélo: ya tenés el esqueleto andando.
4. **Refactorizá**: lo que toca una pantalla va al page object (¿ya existe `entrar()`?
   ¡usalo!); el login inicial se reemplaza por la fixture; los datos fijos, por
   `nombreUnico()`.
5. **Agregá las aserciones**: el codegen graba ACCIONES, pero el "resultado esperado"
   del caso lo escribís vos (`toHaveURL`, `esperarFlash`, `toBeVisible`…). También
   podés grabar aserciones desde la barra del codegen (los íconos de assert), pero
   revisalas siempre.
6. **Corré el caso dos veces seguidas**: si la segunda falla, rompiste la regla de oro
   (§8) — casi siempre, un dato fijo que ya existe.

> **El codegen es el borrador, no la entrega.** Código grabado sin refactorizar se
> reconoce a la legua (XPaths eternos, cero page objects, ninguna aserción) y **resta**
> en la corrección. La letra lo dice explícito — y en la defensa se pregunta qué partes
> salieron del grabador y qué cambiaste.

## 7. Page objects, helpers y fixtures

### 7.1 El patrón page object

Si diez tests hacen login y el botón cambia de nombre, ¿cuántos archivos corregís?
Con page objects: **uno**. El page object encapsula CÓMO se usa una pantalla; el test
declara QUÉ hace el usuario:

```ts
import { type Page } from '@playwright/test';

// Page object del login: el test dice QUÉ hace el usuario; cómo se hace
// (qué campos, qué botón) vive acá. Si la pantalla cambia, se corrige UN archivo.

export class PaginaLogin {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/login.php');
  }

  async entrar(email: string, password: string): Promise<void> {
    await this.ir();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Contraseña').fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
  }
}
```

Regla de reparto: el page object **navega y opera** (llenar, clickear, devolver
locators); el test **decide y aserta**. Un `expect` dentro de un page object es señal
de que algo está en el lugar equivocado.

### 7.2 Helpers

Lo compartido que no es una pantalla va en `helpers/`: las credenciales semilla en un
solo lugar (`usuarios.ts`), los datos únicos (§8), y el flash:

```ts
import { expect, type Page } from '@playwright/test';

// El mensaje flash de la aplicación se muestra UNA vez, en la página que sigue
// a la acción (patrón POST-Redirect-GET): hay que asertarlo inmediatamente,
// antes de navegar de nuevo.

export async function esperarFlash(page: Page, tipo: 'ok' | 'error', texto: string): Promise<void> {
  await expect(page.locator(`.mensaje-${tipo}`)).toHaveText(texto);
}
```

### 7.3 Fixtures: la sesión ya pronta

La mitad de los casos empiezan "logueado como X". Escribir el login en cada test es
duplicación; las **fixtures** lo resuelven — un test que declara `{ comoPaciente }`
recibe la página ya logueada:

```ts
import { test as base, type Page } from '@playwright/test';
import { PaginaLogin } from './pages/PaginaLogin';
import { ANA, LUIS, MEDICO } from './helpers/usuarios';

// Fixtures de sesión: un test que declara { comoPaciente } recibe la página
// YA logueada. El login se escribe una vez; los tests piden el rol que necesitan.

type Fixtures = {
  comoPaciente: Page;   // Luis (el paciente con menos datos semilla)
  comoAna: Page;        // Ana (la paciente con seguidas y órdenes semilla)
  comoMedico: Page;
};

export const test = base.extend<Fixtures>({
  comoPaciente: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);
    await use(page);
  },
  comoAna: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(ANA.email, ANA.password);
    await use(page);
  },
  comoMedico: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

Se usa así (del ejemplo de control de acceso, que también muestra cómo generar un caso
por URL con un `for`):

```ts
// EJEMPLO 2 — resuelve TC08 y TC09 del catálogo.
// Muestra: tests generados en un for + la fixture de sesión (comoPaciente).

import { expect, test } from '../../fixtures';
import { esperarFlash } from '../../helpers/flash';

// TC08: las páginas protegidas, visitadas SIN sesión, rebotan al login.
// Un caso por URL, generados con un for: mismos pasos, distinta página.
for (const url of ['seguidas.php', 'solicitud.php', 'historial.php', 'prestacion_alta.php']) {
  test(`TC08: anónimo a ${url} rebota al login`, async ({ page }) => {
    await page.goto('/' + url);
    await expect(page).toHaveURL(/login\.php/);
    await esperarFlash(page, 'error', 'Tenés que iniciar sesión para entrar ahí.');
  });
}

// TC09: un paciente logueado tampoco entra a las funciones del médico.
// La fixture entrega la página ya logueada como Luis.
test('TC09: paciente no accede al alta de prestación', async ({ comoPaciente: page }) => {
  await page.goto('/prestacion_alta.php');
  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, 'error', 'Esa función es solo para médicos.');
});
```

## 8. Datos de prueba y estado: la regla de oro

La base de datos es **una** y es compartida por toda la suite. De ahí la regla de oro
del catálogo:

> Los casos deben poder correrse **en cualquier orden y repetidas veces**. Los que crean
> datos usan **nombres únicos** y **limpian lo que crean**. Nunca asertar conteos
> absolutos (la cantidad total de filas del catálogo puede variar): asertar sobre los
> datos propios del caso o sobre el orden relativo de la semilla.

Y un refinamiento que aprendés la primera vez que un test te falla dos veces distinto:
la **limpieza defensiva**. Limpiar al final no alcanza — un test que falla a mitad de
camino nunca llega a su limpieza, y el residuo hace fallar la corrida siguiente en un
lugar distinto (el clásico: "Ya estás siguiendo esa prestación"). Los tests que dejan
estado intermedio limpian **también al empezar**: "si el dato que voy a crear ya existe,
lo saco primero".

La herramienta central es humilde:

```ts
// Datos únicos para los tests que crean cosas (la regla de oro del catálogo):
// con el timestamp en el nombre, dos corridas jamás chocan entre sí.

export const nombreUnico = (prefijo: string): string => `${prefijo}-${Date.now()}`;

export const emailUnico = (prefijo: string): string => `${prefijo}.${Date.now()}@test.com`;

/**
 * La fecha de HOY en formato YYYY-MM-DD, en la zona horaria LOCAL.
 * Ojo: new Date().toISOString() devuelve la fecha en UTC — de noche, en Uruguay,
 * UTC ya está en "mañana" y la comparación contra la app falla.
 */
export const fechaHoy = (): string => new Intl.DateTimeFormat('en-CA').format(new Date());
```

Qué muta la base y qué no, en esta aplicación:

| Acción | ¿Toca la base? |
|---|---|
| Navegar, buscar, ordenar, ver detalles | No — read-only, repetible siempre |
| Armar y vaciar la **solicitud** (el carrito) | No — vive en la **sesión**; muere con el logout |
| Registrar usuario, crear/editar prestación, seguir | Sí — **aditivo**: con datos únicos no molesta |
| Confirmar una orden | Sí — aditiva, y hace a su prestación **no eliminable** |
| Eliminar una prestación semilla | Sí — **destructivo**: los casos ⚠ del catálogo |

Después de correr un caso ⚠ (o cuando la base quedó "sucia" de experimentos), el reset
completo es el comando de la sección 3.

## 9. Tests visuales

Un test funcional verifica que el precio diga `$ 700,00`; un test **visual** verifica
que la página entera SE VEA como debe — atrapa el CSS roto, el botón desbordado, la
columna aplastada, que ningún assert funcional ve. Playwright lo hace comparando
capturas contra una **baseline** (la foto "buena", commiteada en el repo):

```ts
// EJEMPLO 3 — resuelve TV04 del catálogo (el catálogo en móvil, 375px).
// Muestra: tests visuales con toHaveScreenshot.
//
// La PRIMERA corrida crea la baseline (el test "falla" avisándolo: es normal).
// Para regenerarlas: npm run baselines
// Las baselines dependen del sistema operativo donde se generaron (guía §13):
// el grupo elige UNA máquina de referencia y lo documenta en su README.

import { expect, test } from '@playwright/test';

test('TV04: en móvil el catálogo se muestra como bloques', async ({ page }) => {
  test.skip(test.info().project.name !== 'movil', 'corre solo en el proyecto móvil (viewport 375)');

  await page.goto('/catalogo.php');

  // Estabilizar ANTES de capturar: la página tiene que estar completa.
  await expect(page.getByRole('heading', { name: 'Catálogo de prestaciones' })).toBeVisible();

  await expect(page).toHaveScreenshot('catalogo-movil.png', { fullPage: true });
});
```

El flujo: la **primera** corrida crea la baseline (el test avisa y "falla": es normal);
las siguientes comparan contra ella. Si el cambio visual es **deseado** (cambiaste el
CSS a propósito), se regeneran con `npm run baselines`. Si no lo es… el test acaba de
encontrar un bug.

- Umbral: `maxDiffPixelRatio: 0.02` en la config — absorbe diferencias de antialiasing,
  no cambios reales.
- Se puede capturar **un elemento** en lugar de la página (menos frágil):
  `expect(page.locator('.mensaje-error')).toHaveScreenshot(...)`.
- El proyecto `movil` de la config corre los specs visuales con viewport 375×667: ahí
  el `@media` de la app convierte la tabla en bloques — TV04 lo verifica.
- Los visuales de página completa del catálogo exigen la **semilla intacta**: hacé que
  corran **primero** (nombrá el archivo `00-visual.spec.ts`: con `workers: 1`, Playwright
  ordena los archivos alfabéticamente) y reseteá la base entre corridas completas.
- Las baselines dependen del **sistema operativo**: §13 antes de trabajar en grupo.

## 10. Tests de API

La aplicación trae una mini-API JSON (`aplicacion/publico/api/`) para practicar testing
de API: los mismos datos y reglas del sitio, hablados en HTTP + JSON.

| Endpoint | Auth | Qué hace |
|---|---|---|
| `POST /api/login.php` | — | inicia sesión; setea la cookie en el contexto |
| `GET /api/prestaciones.php` | pública | lista; `?orden=nombre\|precio&buscar=texto` |
| `POST /api/prestaciones.php` | médico | crea (201 + la prestación con id) |
| `GET /api/prestacion.php?id=N` | pública | detalle |
| `PUT /api/prestacion.php?id=N` | médico | modifica (el tipo no se cambia) |
| `DELETE /api/prestacion.php?id=N` | médico | elimina (409 si está en una orden) |

Respuestas: `{ "ok": true, "datos": ... }` o `{ "ok": false, "error": { "codigo",
"mensaje" } }`, con códigos HTTP reales (400, 401, 403, 404, 405, 409) — el catálogo
TA01–TA13 los recorre todos. El ejemplo del starter:

```ts
// EJEMPLO 4 — resuelve TA09 del catálogo (crear una prestación por API).
// Muestra: el request context (la cookie de sesión queda en el contexto),
// datos únicos con timestamp, y la limpieza al final (la regla de oro).

import { expect, test } from '@playwright/test';
import { MEDICO } from '../../helpers/usuarios';
import { nombreUnico } from '../../helpers/datos';

test('TA09: el médico crea una prestación por API (y la limpia)', async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:9080' });

  // Login por API: la respuesta setea la cookie de sesión EN el contexto —
  // todas las llamadas que siguen ya van autenticadas.
  const login = await api.post('/api/login.php', {
    data: { email: MEDICO.email, password: MEDICO.password },
  });
  expect(login.status()).toBe(200);
  expect((await login.json()).datos.tipo).toBe('MEDICO');

  // Crear, con nombre único: dos corridas jamás chocan.
  const nombre = nombreUnico('Api');
  const creada = await api.post('/api/prestaciones.php', {
    data: { tipo: 'TERAPIA', nombre, precio: 777, franja: 'TARDE', requiere_derivacion: true, cantidad_sesiones: 4 },
  });
  expect(creada.status()).toBe(201);
  const { datos } = await creada.json();
  expect(datos).toMatchObject({ nombre, precio: 777, tipo: 'TERAPIA', requiere_derivacion: true });

  // Persistió de verdad: el detalle la devuelve.
  const detalle = await api.get(`/api/prestacion.php?id=${datos.id}`);
  expect(detalle.status()).toBe(200);

  // Limpieza: el test no deja rastro (regla de oro del catálogo).
  const eliminada = await api.delete(`/api/prestacion.php?id=${datos.id}`);
  expect(eliminada.status()).toBe(200);
});
```

El detalle que importa: el `request context` **guarda las cookies** — un login al
principio y todas las llamadas siguientes van autenticadas, igual que un navegador.

Y el bonus que la API habilita: los **tests híbridos**. Preparar datos por API (rápido,
sin UI) y verificarlos por interfaz — o al revés. El helper del starter existe para eso:

```ts
import { request, type APIRequestContext } from '@playwright/test';
import { MEDICO } from './usuarios';

// Cliente de la mini-API. Sirve para dos cosas:
//  1. los casos de prueba de API (TA01–TA13);
//  2. preparar y limpiar datos desde tests web (tests híbridos): crear una
//     prestación por API es instantáneo y no depende de la interfaz.

export async function clienteApiMedico(baseURL = 'http://localhost:9080'): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL });
  const respuesta = await api.post('/api/login.php', {
    data: { email: MEDICO.email, password: MEDICO.password },
  });
  if (respuesta.status() !== 200) {
    throw new Error(`No se pudo iniciar sesión por API: ${respuesta.status()}`);
  }
  // La cookie de sesión quedó guardada en el contexto: las llamadas siguientes
  // ya van autenticadas.
  return api;
}

export async function crearPrestacion(api: APIRequestContext, datos: Record<string, unknown>): Promise<number> {
  const respuesta = await api.post('/api/prestaciones.php', { data: datos });
  if (respuesta.status() !== 201) {
    throw new Error(`No se pudo crear la prestación: ${respuesta.status()}`);
  }
  return (await respuesta.json()).datos.id;
}

export async function eliminarPrestacion(api: APIRequestContext, id: number): Promise<void> {
  await api.delete(`/api/prestacion.php?id=${id}`);
}
```

## 11. Depurar: UI mode y trace viewer

Cuando un test falla, no adivines: mirá.

- **`npm run test:ui`** — el UI mode: la suite a la izquierda, el navegador al medio,
  cada paso del test es un frame al que podés volver. La mejor herramienta para
  desarrollar tests.
- **`npm run test:headed`** — corre con el navegador visible, a velocidad real.
- **`npm run test:debug`** — pausa paso a paso con el inspector.
- **El trace**: la config graba un trace en el primer reintento de un test fallido.
  El reporte HTML (`npm run report`) lo abre: screenshots de cada acción, el DOM de
  cada momento, la consola, la red. Es la "caja negra del avión" del test.

## 12. Serie y paralelo

Playwright paraleliza por defecto (varios workers, un archivo por worker). Este starter
corre con **`workers: 1`**, a propósito: la base de datos es una sola, y dos tests
creando y borrando a la vez se pisan (el catálogo que uno lista cambia mientras el otro
escribe).

Se podría paralelizar aislando los datos (una base por worker, o casos 100% disjuntos)
— excelente pregunta de defensa, fuera del alcance del obligatorio. Lo que sí tenés
gratis: dentro de un test, **cada contexto de navegador es una sesión aislada** (su
propio cookie jar) — así se hacen los casos de dos roles a la vez, como TC30.

## 13. Errores frecuentes

Buscá el síntoma, no adivines.

| Síntoma | Qué pasó y cómo se arregla |
|---|---|
| `ECONNREFUSED localhost:9080` | La app no está levantada (`docker compose ps` en `aplicacion/`) — o levantaste la clínica del curso de PHP (8080) en lugar de esta copia (9080) |
| `Executable doesn't exist` al correr | Faltan los navegadores de Playwright: `npx playwright install` |
| El catálogo aparece vacío o faltan prestaciones | La semilla no está cargada, o la base quedó sucia: reset de §3 |
| `strict mode violation: resolved to 8 elements` | El locator matchea de más: acotalo (`filaDe(nombre)`, `filter({ hasText })`) |
| El flash no aparece en la aserción | Lo asertaste tarde: el flash vive UNA página (PRG). `toHaveURL` primero, `esperarFlash` inmediatamente después de la acción, sin navegar en el medio |
| Un test pasa solo pero falla en la suite | Depende de datos de otro test: regla de oro (§8) |
| El visual falla en la máquina de un compañero | La baseline se generó en otro sistema operativo (§14) |
| El visual falla "a veces" por pocos píxeles | Capturaste antes de que la página estabilice: asertá un elemento visible antes del screenshot |
| `Timeout esperando` un botón que "está" | Está para OTRO rol: revisá con `test:headed` quién quedó logueado |
| Dos tests se pisan una prestación | El mismo nombre hardcodeado en ambos: `nombreUnico()`, siempre |
| `port is already allocated` al levantar Docker | Otro servicio ocupa el puerto (¿la otra clínica? ¿XAMPP?): `docker ps` |
| `Cannot find module '../../fixtures'` | La ruta relativa del import: los specs de `tests/ejemplos/` suben DOS niveles |
| La fecha "de hoy" del test no coincide con la de la app | `new Date().toISOString()` es **UTC**: de noche, en Uruguay, UTC ya está en mañana. Usá la fecha local (`fechaHoy()` de `helpers/datos.ts`) |
| El test falla con un error DISTINTO al de ayer | Una corrida anterior falló a mitad y dejó residuo (el test nunca llegó a su limpieza). **Limpieza defensiva**: limpiá también al empezar, o reseteá la base |
| Los visuales fallan en la segunda corrida completa | TC28/TC30 dejan residuo aditivo que cambia el catálogo. Entre corridas completas: reset de la base (§3) |

## 14. Baselines visuales y sistemas operativos

Una captura de la misma página no es idéntica entre macOS, Windows y Linux: las fuentes
y el antialiasing difieren. Playwright ya lo contempla — el nombre del archivo de la
baseline incluye la plataforma (`catalogo-movil-movil-darwin.png`, `-win32`, `-linux`).

Política del taller para trabajar en grupo: elijan **una máquina/SO de referencia**,
generen ahí todas las baselines, commitéenlas, y **documéntenlo en su README** ("las
baselines se generaron en Windows 11"). Los demás integrantes desarrollan los tests
funcionales normalmente; los visuales se validan en la máquina de referencia.

## 15. Cómo encarar el obligatorio

Orden sugerido — de lo más simple a lo más rico, asentando las piezas en el camino:

1. **Login y control de acceso** (TC04–TC10): fáciles, y dejan prontos `PaginaLogin`,
   la fixture y `esperarFlash`.
2. **Catálogo, búsqueda, orden y detalle** (TC11–TC17): read-only, cero riesgo.
3. **Registro** (TC01–TC03): el primer caso con datos únicos.
4. **Seguidas y solicitud** (TC25–TC27): estado de sesión.
5. **CRUD del médico** (TC18–TC24): datos únicos + limpieza; el ⚠ para el final.
6. **Órdenes e historial** (TC28–TC30): el precio histórico, los casos estrella.
7. **Visuales** (TV01–TV06) y **API** (TA01–TA13).

Checklist antes de entregar:

- [ ] `npm test` verde contra una base recién sembrada — y de nuevo tras OTRO reset
      (la suite completa deja residuo aditivo por TC28/TC30: el reset entre corridas
      completas es parte del ciclo, no un parche).
- [ ] Todos los flujos representados; al menos 2 visuales.
- [ ] Sin `waitForTimeout`; sin selectores CSS donde había un rol o un label.
- [ ] Baselines commiteadas + SO de referencia documentado.
- [ ] README propio completo; repo privado compartido con **yonaplast**.
- [ ] Cualquier integrante puede explicar cualquier test: la defensa es individual.

---

*Las dudas, al canal del curso — con el mensaje de error completo y el paso del trace donde falla.*
