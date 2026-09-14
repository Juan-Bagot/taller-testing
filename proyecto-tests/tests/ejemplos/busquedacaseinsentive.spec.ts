import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';

test('TC13: Búsqueda case-insensitive combinada con orden', async ({page}) => {

    const catalogo = new PaginaCatalogo(page);
    //necesito controlar que sean 3 exactamente? 

    await catalogo.ir();
    await catalogo.buscar('TERAPIA');
    await catalogo.ordenarPor('Por precio');

    await expect(page).toHaveURL(/buscar=TERAPIA&orden=precio/);
    await expect(page.getByRole('searchbox', { name: 'Buscar por nombre…' })).toHaveValue ('TERAPIA');
    //await expect(page.getByLabel('Ordenar por')).toHaveValue('precio');
    await expect(page.locator('select[name="orden"]')).toHaveValue('precio');
    //controlar el refresh?

});