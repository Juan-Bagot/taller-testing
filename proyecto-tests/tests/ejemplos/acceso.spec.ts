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
