import { type Page } from '@playwright/test';

// Page object del login: el test dice QUÉ hace el usuario; cómo se hace
// (qué campos, qué botón) vive acá. Si la pantalla cambia, se corrige UN archivo.

export class PaginaLogin {
  constructor(private page: Page) {}

  async ir(): Promise<void> {
    await this.page.goto('/login.php');
  }

  async entrar(email: string, password: string): Promise<void> {
    await this.ir();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Contraseña').fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
  }
}
