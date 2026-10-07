// ============================================================================
// TV03 — Catálogo anónimo en escritorio (1280×720)
// ----------------------------------------------------------------------------
// Flujo: Presentación visual · Rol: anónimo · Documentación: docs/TV03.md
//
// La contraparte de escritorio de TV04: a 1280px el catálogo se ve como TABLA
// (cabecera con columnas, una fila por prestación) con el formulario de
// filtros arriba. La captura de página completa atrapa lo que un assert de
// texto no ve: columnas desalineadas, el precio sin alinear a la derecha, la
// barra rota, el formulario de filtros desarmado.
//
// PRECONDICIÓN — SEMILLA INTACTA (8 prestaciones exactas):
//   la captura es de la tabla ENTERA, así que una fila de más (residuo de
//   TC28/TC30, o de un caso que falló antes de limpiar) rompe la comparación.
//   Este caso tiene que correr sobre una base recién sembrada o, al menos,
//   antes de que la suite cree datos. Si la base está sucia, falla en la
//   aserción `toHaveCount(8)` con un mensaje claro, NO en el diff de imagen.
//   Para resetear:
//     docker compose down -v && docker compose up -d --build
//     docker compose exec web php /var/www/app/datos/datos_iniciales.php
//
// BASELINE: la máquina de referencia del grupo es LINUX
// (`catalogo-escritorio-escritorio-linux.png`, generada con la imagen oficial
// mcr.microsoft.com/playwright:v1.62.1-noble). En Windows/macOS Playwright busca
// otra baseline (-win32/-darwin) y este caso no aplica: se valida en Linux.
//
// Impacto en los datos: NINGUNO (read-only), pero EXIGE la semilla intacta.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { NOMBRES_SEMILLA_ALFABETICO } from '../../helpers/semilla';

test('TV03: en escritorio el catálogo anónimo se muestra como tabla', async ({ page }) => {
  // El proyecto `movil` también matchea este spec (testMatch /visual/), pero
  // este caso es de 1280×720: allá se salta y queda reportado como skipped.
  test.skip(test.info().project.name !== 'escritorio', 'corre solo en el proyecto escritorio (1280×720)');

  const catalogo = new PaginaCatalogo(page);

  // --- PASO 1: ir al catálogo sin sesión -------------------------------------
  await catalogo.ir();

  // --- ESTABILIZAR Y VERIFICAR LA PRECONDICIÓN --------------------------------
  await expect(catalogo.titulo()).toBeVisible();
  await expect(catalogo.selectorDeOrden()).toHaveValue('nombre');
  await expect(catalogo.enlaceDe(NOMBRES_SEMILLA_ALFABETICO[0])).toBeVisible();
  await expect(catalogo.filas()).toHaveCount(NOMBRES_SEMILLA_ALFABETICO.length);

  // Y que sea la vista ANÓNIMA: solo "Ver", sin botones de paciente ni médico.
  await expect(catalogo.enlacesDeAccion('Ver')).toHaveCount(NOMBRES_SEMILLA_ALFABETICO.length);
  await expect(catalogo.tabla().getByRole('button')).toHaveCount(0);

  // --- PASO 2: la captura de página completa ---------------------------------
  await expect(page).toHaveScreenshot('catalogo-escritorio.png', { fullPage: true });
});
