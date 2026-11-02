import { esperarFlash } from '../../helpers/flash';
import { nombreUnico }from '../../helpers/datos';
import { test, expect } from '../../fixtures';
import { PaginaFormularioPrestacion } from '../../pages/PaginaFormularioPrestacion';


test('TC22 - Eliminar una prestación sin uso', async ({ comoMedico: page }) => {
    const prestacion = new PaginaFormularioPrestacion(page);
    await page.goto('http://localhost:9080/catalogo.php');
    await prestacion.irAlta();

    const nombrePrestacion = nombreUnico('Borrar');
    await prestacion.completarEstudio({ nombre: nombrePrestacion, precio: 200, franja: 'Noche', duracion: 90 });
    await page.getByRole('button', { name: 'Crear prestación' }).click();

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación creada.');

    const fila = page.getByRole('row', { name: nombrePrestacion });
    const hrefDetalle = await fila.getByRole('link', { name: nombrePrestacion }).getAttribute('href');

    await fila.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación eliminada.');
    await expect(page.getByRole('row', { name: nombrePrestacion })).toHaveCount(0);

    await page.goto(hrefDetalle!);
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'error', 'No existe esa prestación.');
});