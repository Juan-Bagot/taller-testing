// TC06 — Login con credenciales inválidas (mismo mensaje en ambas variantes).

import { expect, test } from '@playwright/test';
import { PaginaLogin } from '../../pages/PaginaLogin';
import { ANA } from '../../helpers/usuarios';
import { esperarFlash } from '../../helpers/flash';

test('TC06: credenciales inválidas — mismo mensaje, exista o no el email', async ({ page }) => {
  const login = new PaginaLogin(page);
  const MENSAJE = 'Email o contraseña incorrectos.';

  // Email que existe, contraseña incorrecta.
  await login.entrar(ANA.email, 'incorrecta');
  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(page, 'error', MENSAJE);

  // Email que no existe: el mensaje debe ser idéntico.
  await login.entrar('noexiste@mail.com', 'loquesea');
  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(page, 'error', MENSAJE);

  // Sin sesión: la barra sigue ofreciendo Entrar / Registrarse.
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Salir' })).toHaveCount(0);
});
