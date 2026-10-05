// Flujo: Registro — TC01 (paciente) y TC02 (médico).
// Deja usuarios nuevos: es aditivo y con email único, no afecta a otros casos.

import { expect, test } from '@playwright/test';
import { PaginaRegistro } from '../../pages/PaginaRegistro';
import { PaginaLogin } from '../../pages/PaginaLogin';
import { esperarFlash } from '../../helpers/flash';
import { emailUnico, nombreUnico } from '../../helpers/datos';

test('TC01: registro exitoso de paciente', async ({ page }) => {
  const nombre = nombreUnico('Paciente Prueba');
  const email = emailUnico('paciente');
  const password = 'secreta123';

  await new PaginaRegistro(page).registrar({
    tipo: 'Paciente', nombre, email, password, extra: 'SEMM',
  });

  // PRG: primero la URL, después el flash (vive una sola página).
  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(page, 'ok', 'Cuenta creada. Ya podés iniciar sesión.');

  // Con esas credenciales el login funciona y la barra muestra el nombre.
  await new PaginaLogin(page).entrar(email, password);
  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, 'ok', `Hola, ${nombre}.`);
  await expect(page.getByText(nombre, { exact: true })).toBeVisible();

  // Rol efectivo PACIENTE: ve "Historial", no "Nueva prestación".
  await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(0);
});

test('TC02: registro exitoso de médico', async ({ page }) => {
  const nombre = nombreUnico('Medico Prueba');
  const email = emailUnico('medico');
  const password = 'secreta123';

  await new PaginaRegistro(page).registrar({
    tipo: 'Médico/a', nombre, email, password, extra: 'Cardiología',
  });

  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(page, 'ok', 'Cuenta creada. Ya podés iniciar sesión.');

  // La cuenta nueva sirve para entrar y tiene rol MEDICO efectivo.
  await new PaginaLogin(page).entrar(email, password);
  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, 'ok', `Hola, ${nombre}.`);
  await expect(page.getByRole('link', { name: 'Nueva prestación' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Historial' })).toHaveCount(0);
});