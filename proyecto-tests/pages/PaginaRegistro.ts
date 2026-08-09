import { type Page } from '@playwright/test';

export class PaginaRegistro {
  constructor(private page: Page) {}

  async registrar(datos: {
    tipo: 'Paciente' | 'Médico/a';
    nombre: string;
    email: string;
    password: string;
    extra: string;             // mutualista (paciente) o especialidad (médico)
  }): Promise<void> {
    await this.page.goto('/registro.php');
    await this.page.getByRole('radio', { name: datos.tipo }).check();
    await this.page.getByLabel('Nombre').fill(datos.nombre);
    await this.page.getByLabel('Email').fill(datos.email);
    await this.page.getByLabel('Contraseña').fill(datos.password);
    await this.page.locator('input[name="extra"]').fill(datos.extra);
    await this.page.getByRole('button', { name: 'Crear cuenta' }).click();
  }
}
