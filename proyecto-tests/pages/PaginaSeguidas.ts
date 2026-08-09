import { type Locator, type Page } from '@playwright/test';

export class PaginaSeguidas {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/seguidas.php');
  }

  filaDe(nombre: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(nombre) });
  }

  async quitar(nombre: string): Promise<void> {
    await this.filaDe(nombre).getByRole('button', { name: 'Quitar' }).click();
  }
}
