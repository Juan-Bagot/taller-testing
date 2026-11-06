import { expect, test, type Page } from '@playwright/test';
import { PaginaCatalogo } from '../pages/PaginaCatalogo';


test(`TC16: Detalle de una Terapia`, async ({ page }: { page: Page }) => {

    const catalogo = new PaginaCatalogo(page);

    //1
    await catalogo.ir();
    await catalogo.abrirDetalle('Terapia respiratoria');

    await expect(page.getByText('Terapia', { exact: true })).toBeVisible();
    await expect(page.getByText('$ 1.500,00')).toBeVisible();
    await expect(page.getByText('Noche')).toBeVisible();
    await expect(page.getByText('Requiere derivación Sí')).toBeVisible();
    await expect(page.getByText('Cantidad de sesiones 5')).toBeVisible();
    await expect(page.getByText('Duración')).not.toBeVisible();
});