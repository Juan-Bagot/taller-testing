import { esperarFlash } from '../../helpers/flash';
import { test, expect } from '../../fixtures';

function fechaLocalHoy(): string {
    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

test('TC25 — Seguir desde el detalle y quitar', async ({ comoPaciente: page }) => {

    //chequeo si ya sigue audiometria, si la sigue la dejo se seguir
    await page.getByRole('link', { name: 'Seguidas' }).click();
    await expect(page).toHaveURL(/seguidas\.php/);
    const audiometria = page.locator('tr').filter({ has: page.getByRole('cell', { name: 'Audiometría' }) });
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
    await page.getByText('Agregada a tus seguidas.');
    await page.getByRole('link', { name: 'Seguidas' }).click();

    await expect(page).toHaveURL(/seguidas\.php/);
    await expect(audiometria.getByRole('cell', { name: 'Estudio' })).toBeVisible();
    await expect(audiometria.locator('td[data-rotulo="Precio"]')).toHaveText('$ 700,00');
    await expect(audiometria.locator('td[data-rotulo= "Desde"]')).toHaveText(fechaLocalHoy());
    
    await botonQuitar.click();
    await expect(page.getByRole('cell', {name: 'Terapia respiratoria'})).toBeVisible();

});