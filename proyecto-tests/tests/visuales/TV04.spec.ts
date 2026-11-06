// ============================================================================
// TV04 — Catálogo en móvil (375×667): la tabla se vuelve bloques
// ----------------------------------------------------------------------------
// Flujo: Presentación visual · Rol: anónimo
//
// Un test funcional verifica que el precio DIGA "$ 700,00". Un test visual
// verifica que la página SE VEA como debe: atrapa el CSS roto, la columna
// aplastada, el botón desbordado — cosas que ningún assert de texto ve.
//
// Acá se verifica que a 375px de ancho el `@media` de la app convierta la tabla
// del catálogo en bloques apilados, con el rótulo de cada celda (`data-rotulo`:
// Nombre, Tipo, Franja, Precio) impreso al costado.
//
// DÓNDE CORRE:
//   · el proyecto `movil` de playwright.config.ts (viewport 375×667) solo corre
//     los specs cuya ruta matchea `testMatch: /.*visual.*/` — por eso vive en
//     `tests/visuales/`. En `escritorio` el caso se salta (test.skip de abajo).
//
// PRECONDICIÓN — SEMILLA INTACTA (8 prestaciones exactas):
//   la captura es de página completa: si otro caso dejó una prestación de más
//   (residuo de TC28/TC30), la tabla tendría una fila extra y la comparación
//   fallaría. Por eso se corre sobre una base recién sembrada; si está sucia,
//   falla en la aserción `toHaveCount(8)`, con un mensaje claro.
//
// BASELINE: la máquina de referencia del grupo es LINUX
// (`catalogo-movil-movil-linux.png`).
//
// Impacto en los datos: NINGUNO (read-only), pero EXIGE la semilla intacta.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { NOMBRES_SEMILLA_ALFABETICO } from '../../helpers/semilla';

test('TV04: en móvil el catálogo se muestra como bloques', async ({ page }) => {
  // El spec lo matchean los dos proyectos, pero solo tiene sentido en el móvil
  // (viewport 375×667). En `escritorio` se salta y queda reportado como skipped.
  test.skip(test.info().project.name !== 'movil', 'corre solo en el proyecto móvil (viewport 375)');

  const catalogo = new PaginaCatalogo(page);

  // --- PASO 1: ir al catálogo con viewport móvil -----------------------------
  await catalogo.ir();

  // --- ESTABILIZAR ANTES DE CAPTURAR -----------------------------------------
  // Sin esto el screenshot puede salir a mitad del render y fallar "a veces"
  // por unos pocos píxeles: la causa número uno de tests visuales flaky.
  // Estas dos aserciones esperan (con reintentos) a que la página esté completa.
  await expect(catalogo.titulo()).toBeVisible();

  // Además dejan explícita la precondición del caso: la semilla tiene que estar.
  // Si la base está vacía o sucia, el test falla ACÁ, con un mensaje claro, en
  // vez de fallar más abajo con un diff de imagen imposible de interpretar.
  await expect(catalogo.enlaceDe(NOMBRES_SEMILLA_ALFABETICO[0])).toBeVisible();
  await expect(catalogo.filas()).toHaveCount(NOMBRES_SEMILLA_ALFABETICO.length);

  // --- PASO 2: la captura de página completa ---------------------------------
  // La PRIMERA corrida crea la baseline y "falla" avisándolo: es normal.
  // Las siguientes comparan contra ella, con maxDiffPixelRatio: 0.02.
  // Para regenerarla a propósito: npm run baselines
  await expect(page).toHaveScreenshot('catalogo-movil.png', { fullPage: true });
});
