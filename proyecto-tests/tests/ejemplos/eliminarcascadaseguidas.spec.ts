import { ANA } from '../../helpers/usuarios';
import { MEDICO } from '../../helpers/usuarios';
import { PaginaLogin } from '../../pages/PaginaLogin';
import { esperarFlash } from '../../helpers/flash';
import { test, expect } from '../../fixtures';
import { PaginaFormularioPrestacion } from '../../pages/PaginaFormularioPrestacion';

test('TC24 — Eliminar en cascada de Seguidas', async ({ comoMedico: page }) => {
    
    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(1);
    const prestacion = new PaginaFormularioPrestacion(page);
    await page.goto('http://localhost:9080/catalogo.php');
    await prestacion.irAlta();
    await prestacion.completarEstudio({nombre: 'Oftalmologia', precio: 500, franja: 'Noche', duracion: 60} )
    await page.getByRole('button', { name: 'Crear prestación' }).click();
    
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación creada.');

    await page.getByRole('link', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/login\.php/);

    await new PaginaLogin(page).entrar(ANA.email, ANA.password);
    
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', `Hola, ${ANA.nombre}.`);
    await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(0);

    await page.getByRole('link', { name: 'Oftalmologia' }).click();
   
    await expect(page).toHaveURL(/prestacion\.php/);
    await expect(page.getByRole('heading', { name: 'Oftalmologia' }));
    
    await page.getByRole('button', { name: 'Seguir' }).click();
    
    await esperarFlash(page, 'ok', 'Agregada a tus seguidas.');
    await expect(page.getByText('Agregada a tus seguidas.'));
    
    await page.getByRole('link', { name: 'Seguidas' }).click();
    
    await expect(page).toHaveURL(/seguidas\.php/);

    await page.getByRole('row', {name: /Oftalmologia/});
    await page.getByRole('link', { name: 'Salir' }).click();
    
    await expect(page).toHaveURL(/login\.php/);

    await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);
    
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', `Hola, ${MEDICO.nombre}.`);
   

    if (await page.getByRole('row', { name: /Oftalmologia/ }).getByRole('button', { name: 'Eliminar' }).isVisible()) {
        await page.getByRole('row', { name: /Oftalmologia/ }).getByRole('button', { name: 'Eliminar' }).click();
    }
    await esperarFlash(page, 'ok', 'Prestación eliminada.');
    await expect(page.getByText('Prestación eliminada.'));

    await page.getByRole('link', { name: 'Salir' }).click();
    
    await expect(page).toHaveURL(/login\.php/);

    await new PaginaLogin(page).entrar(ANA.email, ANA.password);
    
    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', `Hola, ${ANA.nombre}.`);
    await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva prestación' })).toHaveCount(0);

    await page.getByRole('link', { name: 'Seguidas' }).click();
    
    await expect(page).toHaveURL(/seguidas\.php/);
    await expect(page.getByRole('row', { name: /Fonoaudiología/ })).toHaveCount(1);
    await expect(page.getByRole('row', { name: /Oftalmologia/ })).toHaveCount(0);

});
