import { type Page } from '@playwright/test';

// El alta y la edición comparten el formulario; este page object sirve para ambos.

export class PaginaFormularioPrestacion {
  constructor(private page: Page) {}

  async irAlta(): Promise<void> {
    await this.page.goto('/prestacion_alta.php');
  }

  async completarEstudio(datos: { nombre: string; precio: number; franja?: string; duracion: number }): Promise<void> {
    await this.page.getByRole('radio', { name: 'Estudio' }).check();
    await this.completarComunes(datos.nombre, datos.precio, datos.franja);
    await this.page.getByLabel('Duración (minutos)').fill(String(datos.duracion));
  }

  async completarTerapia(datos: {
    nombre: string; precio: number; franja?: string;
    requiereDerivacion: boolean; sesiones: number;
  }): Promise<void> {
    await this.page.getByRole('radio', { name: 'Terapia' }).check();
    await this.completarComunes(datos.nombre, datos.precio, datos.franja);
    if (datos.requiereDerivacion) {
      await this.page.getByRole('checkbox', { name: 'Requiere derivación' }).check();
    }
    await this.page.getByLabel('Cantidad de sesiones').fill(String(datos.sesiones));
  }

  async enviar(): Promise<void> {
    // El mismo botón cambia de texto entre alta y edición.
    await this.page.getByRole('button', { name: /Crear prestación|Guardar cambios/ }).click();
  }

  private async completarComunes(nombre: string, precio: number, franja?: string): Promise<void> {
    await this.page.getByLabel('Nombre').fill(nombre);
    await this.page.getByLabel('Precio').fill(String(precio));
    if (franja) {
      await this.page.getByLabel('Franja horaria').selectOption({ label: franja });
    }
  }
}
