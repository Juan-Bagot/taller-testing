import { esperarFlash } from '../../helpers/flash';
import { test, expect } from '../../fixtures';
import { fechaHoy } from '../../helpers/datos';


test('TC25 — Seguir desde el detalle y quitar', async ({ comoPaciente: page }) => {

    await page.getByRole('link', { name: 'Seguidas' }).click();
    await expect(page).toHaveURL(/seguidas\.php/);
    const audiometria = page.getByRole('row', { name: /Audiometría/ });
    const botonQuitar = audiometria.getByRole('button', { name: 'Quitar' });
    if(await botonQuitar.isVisible()){
        await botonQuitar.click(); 
    };

    await page.getByRole('link', { name: 'Catálogo' }).click();
    await expect(page).toHaveURL(/catalogo\.php/);
    
    await page.getByRole('link', { name: 'Audiometría' }).click();
    await expect(page).toHaveURL(/prestacion\.php/);
    
    await page.getByRole('button', { name: 'Seguir' }).click();
    await esperarFlash(page, 'ok', 'Agregada a tus seguidas.');
    await expect(page.getByText('Agregada a tus seguidas.'));
    await page.getByRole('link', { name: 'Seguidas' }).click();

    await expect(page).toHaveURL(/seguidas\.php/);
    await expect(audiometria.getByRole('cell', { name: 'Estudio' })).toBeVisible();
    await expect(audiometria.getByRole('cell', { name: '$ 700,00' })).toBeVisible();
    await expect(audiometria.getByRole('cell', { name: '-09-14'})).toHaveText(fechaHoy());
    
    await botonQuitar.click();
    await expect(page.getByRole('cell', {name: 'Terapia respiratoria'})).toBeVisible();

});