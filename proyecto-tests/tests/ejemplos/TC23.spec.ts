import { esperarFlash } from '../../helpers/flash';
import { nombreUnico }from '../../helpers/datos';
import { test, expect } from '../../fixtures';

test('TC23 -  La eliminación se bloquea si la prestación está en una orden', async ({ comoMedico: page }) => {
    
    await expect(page).toHaveURL(/catalogo\.php/);
    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(1);

    await page.getByRole('row', { name: /Electrocardiograma/ }).getByRole('button', { name: 'Eliminar' }).click();
    await esperarFlash(page, 'error', 'No se puede eliminar: la prestación aparece en una orden médica.');

    await expect(page.getByRole('link', { name: /Electrocardiograma/ })).toHaveCount(1);
});