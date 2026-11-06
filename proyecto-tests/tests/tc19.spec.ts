import { expect, test, type Page } from '@playwright/test';
import { MEDICO } from '../helpers/usuarios';
import { PaginaLogin } from '../pages/PaginaLogin';
import { PaginaFormularioPrestacion } from '../pages/PaginaFormularioPrestacion';
import { PaginaCatalogo } from '../pages/PaginaCatalogo';
import { esperarFlash } from '../helpers/flash';


test(`TC19: Crear una terapia con derivación (auto-contenido)`, async ({ page }: { page: Page }) => {

    const formularioPrestacion = new PaginaFormularioPrestacion(page);
    const catalogo = new PaginaCatalogo(page);

    //Precondiciones
    await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);

    //1
    await formularioPrestacion.irAlta();

    const nombre = `Prestación ${Date.now()}`
    await formularioPrestacion.completarTerapia({
        nombre,
        precio: 1250,
        franja: 'Noche',
        requiereDerivacion: true,
        sesiones: 12
    });

    //2
    await formularioPrestacion.enviar();
    await esperarFlash(page, 'ok', 'Prestación creada.');

    await catalogo.abrirDetalle(nombre);
    await expect(page.getByText('Requiere derivación Sí')).toBeVisible();
    await expect(page.getByText('Cantidad de sesiones 12')).toBeVisible();


    //3
    await catalogo.ir();
    await catalogo.eliminar(nombre);
    await expect(page.getByText(nombre)).not.toBeVisible();

});