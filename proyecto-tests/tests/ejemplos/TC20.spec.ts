import { esperarFlash } from '../../helpers/flash';
import { nombreUnico }from '../../helpers/datos';
import { test, expect } from '../../fixtures';
import { PaginaFormularioPrestacion } from '../../pages/PaginaFormularioPrestacion';

test('TC20 - Crear con nombre repetido', async ({ comoMedico: page }) => {

    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(1);
    const prestacion = new PaginaFormularioPrestacion(page);
    await page.goto('http://localhost:9080/catalogo.php');
    await prestacion.irAlta();
    const nuevaPrestacion = nombreUnico('P-<timestamp>');
    await prestacion.completarEstudio({ nombre: nuevaPrestacion, precio: 2000, franja: 'Mañana', duracion: 30} )
    await page.getByRole('button', { name: 'Crear prestación' }).click();

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación creada.');

    await page.getByRole('link', { name: 'Nueva prestación' }).click();
    
    await expect(page).toHaveURL(/prestacion_alta\.php/);

    await prestacion.completarEstudio({ nombre: nuevaPrestacion, precio: 2000, franja: 'Mañana', duracion: 30} )
    await page.getByRole('button', { name: 'Crear prestación' }).click();
   
    await expect(page).toHaveURL(/prestacion_alta\.php/);
    await esperarFlash(page, 'error', 'Ya existe una prestación con ese nombre.');

    await page.getByRole('link', { name: 'Catálogo' }).click();
    await expect(page.getByRole('link', { name: nuevaPrestacion })).toHaveCount(1);
    
    await page.getByRole('row', {name: nuevaPrestacion}).getByRole('button', {name: 'Eliminar'}).click();

    await expect(page).toHaveURL(/catalogo\.php/);
    await expect(page.getByRole('link', { name: nuevaPrestacion })).toHaveCount(0);
});