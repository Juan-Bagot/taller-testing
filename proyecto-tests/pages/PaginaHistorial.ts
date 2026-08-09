import { type Locator, type Page } from '@playwright/test';

export class PaginaHistorial {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/historial.php');
  }

  /** Las órdenes, en el orden en que se muestran (la más reciente primero). */
  ordenes(): Locator {
    return this.page.locator('article.orden');
  }

  /** La primera orden de la página = la más reciente. */
  ordenMasReciente(): Locator {
    return this.ordenes().first();
  }
}
