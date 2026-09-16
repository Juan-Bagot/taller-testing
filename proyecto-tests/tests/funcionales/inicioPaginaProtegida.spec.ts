import { test, expect } from '@playwright/test';

test('TC08 — Anónimo no entra a ninguna página protegida', async ({ page }) => {
  const baseUrl = 'http://127.0.0.1:9080/'; 

  // Definimos las páginas que queremos probar
  const paginasProtegidas = [
    'seguidas.php',
    'solicitud.php',
    'historial.php',
    'prestacion_alta.php'
  ];

  // Recorremos cada página y ejecutamos la misma validación
  for (const ruta of paginasProtegidas) {
    
    await page.goto(`${baseUrl}${ruta}`);

    // Resultado esperado A: Redirige a login.php
    await expect(page).toHaveURL(`${baseUrl}login.php`);

    // Resultado esperado B: Muestra el mensaje flash de error
    const mensajeFlash = page.getByText('Tenés que iniciar sesión para entrar ahí.');
    await expect(mensajeFlash).toBeVisible();
  }
});