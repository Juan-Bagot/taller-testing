import { expect, test, type Page } from '@playwright/test';
import { PaginaCatalogo } from '../pages/PaginaCatalogo'

test(`TC15: Detalle de un estudio`, async ({ page }: { page: Page }) => {
    //1
    await new PaginaCatalogo(page).ir();
    await new PaginaCatalogo(page).abrirDetalle('Audiometría');

    // Lo que SÍ debe verse
    await expect(page.getByText('Estudio')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Audiometría' })).toBeVisible();
    await expect(page.getByText('$ 700,00')).toBeVisible();
    await expect(page.getByText('Mañana')).toBeVisible();
    await expect(page.getByText('20 minutos')).toBeVisible();
    await expect(page.getByRole('link', { name: '← Volver al catálogo' })).toBeVisible();

    // Lo que NO debe verse
    await expect(page.getByText('Requiere derivación')).not.toBeVisible();
    await expect(page.getByText('Cantidad de sesiones')).not.toBeVisible();
});