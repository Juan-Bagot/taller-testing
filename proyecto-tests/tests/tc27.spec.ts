import { expect, test, type Page } from '@playwright/test';
import { LUIS } from '../helpers/usuarios';
import { PaginaLogin } from '../pages/PaginaLogin';
import { PaginaCatalogo } from '../pages/PaginaCatalogo';
import { PaginaDetalle } from '../pages/PaginaDetalle';
import { PaginaSolicitud } from '../pages/PaginaSolicitud';

test('Armar y editar la solicitud (auto-contenido: el carrito vive en la sesión)', async ({ page }: { page: Page }) => {
    //Precondiciones
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);

    //1
    await new PaginaCatalogo(page).solicitar('Audiometría');
    await expect(page.getByText('Solicitud 1')).toBeVisible();

    //2
    await new PaginaCatalogo(page).abrirDetalle('Fonoaudiología');
    await new PaginaDetalle(page).agregarASolicitud(3);
    await expect(page.getByText('Solicitud 4')).toBeVisible();

    //3
    await new PaginaSolicitud(page).ir();
    // Audiometría `$ 700,00 × 1 = $ 700,00`
    await expect(page.getByText('Audiometría $ 700,00 1 $ 700,00')).toBeVisible();
    // Fonoaudiología `$ 600,00 × 3 = $ 1.800,00`
    await expect(page.getByText('Fonoaudiología $ 600,00 3 $ 1.800,00')).toBeVisible();
    // Total `$ 2.500,00`
    await expect(page.getByText('Total $ 2.500,00')).toBeVisible();

    //4
    await new PaginaSolicitud(page).quitar('Fonoaudiología');
    await expect(page.getByText('Total $ 700,00')).toBeVisible();

    //5
    await new PaginaSolicitud(page).quitar('Audiometría');
    await expect(page.getByText('La solicitud está vacía.')).toBeVisible();
    await expect(page.getByText(/Solicitud \d/)).not.toBeVisible();
});