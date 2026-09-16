import { test, expect } from '@playwright/test';

test.describe('Pruebas Visuales (Snapshot Testing)', () => {

  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test('TV01 — Login en escritorio (1280×720)', async ({ page }) => {

    await page.goto('/login.php');

    // Estabilizar: confirmar que la interfaz ya se renderizó por completo
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();

    // Comparar captura visual con la baseline
    await expect(page).toHaveScreenshot('login-escritorio.png');
  });

});