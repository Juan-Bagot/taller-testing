import { type Page } from '@playwright/test';

export class PaginaDetalle {
  constructor(private page: Page) {}

  async ir(id: number): Promise<void> {
    await this.page.goto(`/prestacion.php?id=${id}`);
  }

  async agregarASolicitud(cantidad: number): Promise<void> {
    await this.page.getByLabel('Cantidad').fill(String(cantidad));
    await this.page.getByRole('button', { name: 'Agregar a la solicitud' }).click();
  }

  async seguir(): Promise<void> {
    await this.page.getByRole('button', { name: 'Seguir' }).click();
  }
}
