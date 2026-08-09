import { expect, type Page } from '@playwright/test';

// El mensaje flash de la aplicación se muestra UNA vez, en la página que sigue
// a la acción (patrón POST-Redirect-GET): hay que asertarlo inmediatamente,
// antes de navegar de nuevo.

export async function esperarFlash(page: Page, tipo: 'ok' | 'error', texto: string): Promise<void> {
  await expect(page.locator(`.mensaje-${tipo}`)).toHaveText(texto);
}
