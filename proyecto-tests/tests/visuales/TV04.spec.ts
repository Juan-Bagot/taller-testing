// ============================================================================
// TV04 — Catálogo en móvil (375×667): la tabla se vuelve bloques
// ----------------------------------------------------------------------------
// Flujo: Presentación visual · Rol: anónimo · Documentación: docs/TV04.md
//
// Un test funcional verifica que el precio DIGA "$ 700,00". Un test visual
// verifica que la página SE VEA como debe: atrapa el CSS roto, la columna
// aplastada, el botón desbordado — cosas que ningún assert de texto ve.
//
// Acá se verifica que a 375px de ancho el `@media` de la app convierta la tabla
// del catálogo en bloques apilados, con el rótulo de cada celda (`data-rotulo`:
// Nombre, Tipo, Franja, Precio) impreso al costado.
//
// DÓNDE VIVE Y POR QUÉ:
//   · está en `tests/visuales/` → es lo que matchea el `testMatch: /visuales[\/]/`
//     del proyecto `movil` en playwright.config.ts, el único con viewport 375;
//   · ese proyecto está declarado PRIMERO en la config, así que los visuales
//     corren antes que los funcionales, sobre la semilla intacta (esta captura
//     es de página completa: si otro caso hubiera creado una prestación, la
//     tabla tendría una fila de más y la comparación fallaría).
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
