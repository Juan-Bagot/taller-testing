import { expect, test } from '@playwright/test';
import { nombreUnico } from '../../helpers/datos';
import { clienteApiMedico, crearPrestacion } from '../../helpers/api';

test('TA13: Eliminar: feliz, bloqueada y método no permitido' , async ({ playwright }) => {
    const api = await clienteApiMedico();
    const nombre = nombreUnico('Del');
    const id = await crearPrestacion(api, {
        tipo: 'TERAPIA', nombre, precio: 900, franja: 'TARDE', requiere_derivacion: true, cantidad_sesiones: 5 ,
    });
    //expect(creada.status()).toBe(201);


    const borrarPrestacion = await api.delete(
        `/api/prestacion.php?id=${id}`
    );
    expect(borrarPrestacion.status()).toBe(200);

    const detalle = await api.get(`/api/prestacion.php?id=${id}`);
    expect(detalle.status()).toBe(404);

    const prestaciones = await api.get('/api/prestaciones.php');
    const body = await prestaciones.json();

    const electrocardiograma = body.datos.find(
        (prestacion: any) => prestacion.nombre === 'Electrocardiograma'
    );
    expect(electrocardiograma).toBeDefined();

    const idelectro = electrocardiograma.id;
    const borrarElectro = await api.delete(
        `/api/prestacion.php?id=${idelectro}`
    );
    expect(borrarElectro.status()).toBe(409);

    const respuesta = await borrarElectro.json();
    expect(respuesta.error.codigo).toBe('EN_ORDEN');
    expect(respuesta.error.mensaje).toBe(
        'No se puede eliminar: la prestación aparece en una orden médica.'
    );

    const listadoDespues = await api.get('/api/prestaciones.php');
    expect(listadoDespues.status()).toBe(200);

    const bodyDespues = await listadoDespues.json();
    const electrocardiogramas = bodyDespues.datos.filter(
        (prestacion: any) => prestacion.nombre === 'Electrocardiograma'
    );
    expect(electrocardiogramas).toHaveLength(1);

    const mod = await api.patch('/api/prestacion.php?id=1');
    expect(mod.status()).toBe(405);

    const respmod = await mod.json();
    expect(respmod.error.codigo).toBe('METODO_NO_PERMITIDO');
    expect(mod.headers()['allow']).toBe('GET, PUT, DELETE');
});