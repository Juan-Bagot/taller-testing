import { expect, test } from '@playwright/test';
import { clienteApiMedico } from '../../helpers/api';

test('TA11 - Crear con nombre repetido ', async () => {
    const api = await clienteApiMedico();

    try {
        const crear = await api.post('/api/prestaciones.php', {
            data: {
                nombre: 'Audiometría',
                precio: 500,
                franja: 'NOCHE',
                duracion: 60,
                tipo: 'ESTUDIO'
            }
        });
        expect(crear.status()).toBe(409);

        const respuesta = await crear.json();
        expect(respuesta.error.codigo).toBe('NOMBRE_REPETIDO');
        expect(respuesta.error.mensaje).toBe(
            'Ya existe una prestación con ese nombre.'
        );

        const listado = await api.get('/api/prestaciones.php');
        expect(listado.status()).toBe(200);

        const bodyDespues = await listado.json();
        const audiometriasDespues = bodyDespues.datos.filter(
            (prestacion: any) => prestacion.nombre === 'Audiometría'
        );
        expect(audiometriasDespues).toHaveLength(1);
    
    } finally {
        await api.dispose();
    }
});