import { type Locator, type Page } from '@playwright/test';

export class PaginaSolicitud {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/solicitud.php');
  }

  filaDe(nombre: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(nombre) });
  }

  total(): Locator {
    return this.page.locator('tfoot .total');
  }

  async quitar(nombre: string): Promise<void> {
    await this.filaDe(nombre).getByRole('button', { name: 'Quitar' }).click();
  }

  async confirmar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirmar la orden médica' }).click();
  }
}
