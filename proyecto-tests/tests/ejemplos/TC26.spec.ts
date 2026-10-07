import { esperarFlash } from '../../helpers/flash';
import { test, expect } from '../../fixtures';

test('TC26 - No se puede seguir dos veces la misma prestación', async ({ comoAna: page}) => {
    await expect(page).toHaveURL(/catalogo\.php/);

    await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(0);

    await page.getByRole('row', { name: /Fonoaudiología/ }).getByRole('button', { name: 'Seguir' }).click();
    await esperarFlash(page, 'error', 'Ya estás siguiendo esa prestación.');

    await page.getByRole('link', { name: 'Seguidas' }).click();
   
    await expect(page).toHaveURL(/seguidas\.php/);
    await expect(page.getByRole('link', { name: 'Fonoaudiología' })).toHaveCount(1);
});