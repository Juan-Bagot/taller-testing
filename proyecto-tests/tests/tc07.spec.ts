import { expect, test, type Page } from '@playwright/test';
import { LUIS } from '../helpers/usuarios';
import { PaginaLogin } from '../pages/PaginaLogin';
import { PaginaCatalogo } from '../pages/PaginaCatalogo';
import { PaginaHistorial } from '../pages/PaginaHistorial';
import { PaginaSolicitud } from '../pages/PaginaSolicitud'
import { esperarFlash } from '../helpers/flash';

test(`TC07:  Salir cierra la sesión y descarta la solicitud a medio armar`, async ({ page }: { page: Page }) => {
    //1
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);

    //2
    await new PaginaCatalogo(page).solicitar('Audiometría');

    //3
    await page.getByRole('link', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();

    //4
    await new PaginaHistorial(page).ir();
    await expect(page).toHaveURL(/login\.php/);
    await esperarFlash(page, 'error', 'Tenés que iniciar sesión para entrar ahí.');

    //5
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);
    await new PaginaSolicitud(page).ir();
    await expect(page.getByText('La solicitud está vacía.')).toBeVisible();
    await expect(page.getByText(/Solicitud \d/)).not.toBeVisible();
});