import { test, expect } from '@playwright/test';

test('TC01 — Registro exitoso de paciente', async ({ page }) => {
  const baseUrl = 'http://127.0.0.1:9080/';

  const timestamp = Date.now();
  const nombre = `Paciente Prueba ${timestamp}`;
  const email = `paciente.${timestamp}@test.com`;
  const password = 'secreta123';
  const mutualista = 'SEMM';

  //Ir a registro.php
  await page.goto(`${baseUrl}registro.php`, { waitUntil: 'domcontentloaded' });

  //Seleccionar tipo Paciente
  await page.getByRole('radio', { name: 'Paciente' }).check();

  //Completar formulario
  await page.getByLabel('Nombre', { exact: true }).fill(nombre);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByLabel(/Mutualista/i).fill(mutualista);

  //Enviar
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  // Resultado esperado 1: Redirección a login.php
  await expect(page).toHaveURL(/.*login\.php/);

  // Resultado esperado 2: Muestra mensaje de ok
  const mensajeFlash = page.getByText('Cuenta creada. Ya podés iniciar sesión.');
  await expect(mensajeFlash).toBeVisible();
});
