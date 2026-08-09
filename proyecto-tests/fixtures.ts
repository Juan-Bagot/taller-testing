import { test as base, type Page } from '@playwright/test';
import { PaginaLogin } from './pages/PaginaLogin';
import { ANA, LUIS, MEDICO } from './helpers/usuarios';

// Fixtures de sesión: un test que declara { comoPaciente } recibe la página
// YA logueada. El login se escribe una vez; los tests piden el rol que necesitan.

type Fixtures = {
  comoPaciente: Page;   // Luis (el paciente con menos datos semilla)
  comoAna: Page;        // Ana (la paciente con seguidas y órdenes semilla)
  comoMedico: Page;
};

export const test = base.extend<Fixtures>({
  comoPaciente: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);
    await use(page);
  },
  comoAna: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(ANA.email, ANA.password);
    await use(page);
  },
  comoMedico: async ({ page }, use) => {
    await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
