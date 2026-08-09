import { type Locator, type Page } from '@playwright/test';

export class PaginaCatalogo {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/catalogo.php');
  }

  async buscar(texto: string): Promise<void> {
    await this.page.getByRole('searchbox').fill(texto);
    await this.page.getByRole('button', { name: 'Aplicar' }).click();
  }

  async ordenarPor(orden: 'Por nombre' | 'Por precio'): Promise<void> {
    await this.page.getByRole('combobox').selectOption({ label: orden });
    await this.page.getByRole('button', { name: 'Aplicar' }).click();
  }

  /** La fila de la tabla que contiene esa prestación. */
  filaDe(nombre: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(nombre) });
  }

  async abrirDetalle(nombre: string): Promise<void> {
    await this.page.getByRole('link', { name: nombre }).click();
  }

  // Acciones por fila (los botones que existen según el rol logueado):
  async seguir(nombre: string)    { await this.filaDe(nombre).getByRole('button', { name: 'Seguir' }).click(); }
  async solicitar(nombre: string) { await this.filaDe(nombre).getByRole('button', { name: 'Solicitar' }).click(); }
  async eliminar(nombre: string)  { await this.filaDe(nombre).getByRole('button', { name: 'Eliminar' }).click(); }
  async editar(nombre: string)    { await this.filaDe(nombre).getByRole('link', { name: 'Editar' }).click(); }
}
