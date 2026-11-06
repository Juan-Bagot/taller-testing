import { expect, test, type Page } from '@playwright/test';
import { LUIS } from '../helpers/usuarios';
import { PaginaLogin } from '../pages/PaginaLogin';
import { PaginaCatalogo } from '../pages/PaginaCatalogo';
import { PaginaDetalle } from '../pages/PaginaDetalle';
import { PaginaSolicitud } from '../pages/PaginaSolicitud';

test('TC27: Armar y editar la solicitud (auto-contenido: el carrito vive en la sesión)', async ({ page }: { page: Page }) => {

    const catalogo = new PaginaCatalogo(page);
    const solicitud = new PaginaSolicitud(page);

    //Precondiciones
    await new PaginaLogin(page).entrar(LUIS.email, LUIS.password);

    //1
    await catalogo.solicitar('Audiometría');
    await expect(page.getByText('Solicitud 1')).toBeVisible();

    //2
    await catalogo.abrirDetalle('Fonoaudiología');
    await new PaginaDetalle(page).agregarASolicitud(3);
    await expect(page.getByText('Solicitud 4')).toBeVisible();

    //3
    await solicitud.ir();
    // Audiometría `$ 700,00 × 1 = $ 700,00`
    await expect(page.getByText('Audiometría $ 700,00 1 $ 700,00')).toBeVisible();
    // Fonoaudiología `$ 600,00 × 3 = $ 1.800,00`
    await expect(page.getByText('Fonoaudiología $ 600,00 3 $ 1.800,00')).toBeVisible();
    // Total `$ 2.500,00`
    await expect(page.getByText('Total $ 2.500,00')).toBeVisible();

    //4
    await solicitud.quitar('Fonoaudiología');
    await expect(page.getByText('Total $ 700,00')).toBeVisible();

    //5
    await solicitud.quitar('Audiometría');
    await expect(page.getByText('La solicitud está vacía.')).toBeVisible();
    await expect(page.getByText(/Solicitud \d/)).not.toBeVisible();
});