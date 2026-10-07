import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';

test('TC13: Búsqueda case-insensitive combinada con orden', async ({ page }) => {
    const catalogo = new PaginaCatalogo(page);
    const filas = page.locator('tbody tr');
    const buscador = page.getByRole('searchbox', { name: 'Buscar por nombre…' });
    const selectOrden = page.locator('select[name="orden"]');

    await catalogo.ir();
    await catalogo.buscar('TERAPIA');
    await catalogo.ordenarPor('Por precio');

    await expect(page).toHaveURL(/buscar=TERAPIA&orden=precio/);
    await expect(buscador).toHaveValue('TERAPIA');
    await expect(selectOrden).toHaveValue('precio');
    await expect(filas).toHaveCount(3);
    await expect(filas).toContainText(['Masoterapia', 'Fisioterapia de rodilla', 'Terapia respiratoria']);

    await page.reload();

    await expect(page).toHaveURL(/buscar=TERAPIA&orden=precio/);
    await expect(buscador).toHaveValue('TERAPIA');
    await expect(selectOrden).toHaveValue('precio');
    await expect(page.getByRole('link', { name: 'Masoterapia' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fisioterapia de rodilla' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terapia respiratoria' })).toBeVisible();
});