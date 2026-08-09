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
