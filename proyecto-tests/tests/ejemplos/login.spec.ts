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
