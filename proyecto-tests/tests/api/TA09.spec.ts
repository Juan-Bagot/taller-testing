import { expect, test } from '@playwright/test';
import { clienteApiMedico, eliminarPrestacion } from '../../helpers/api';
import { nombreUnico, sufijoUnico } from '../../helpers/datos';

test('TA09: el médico crea una prestación por API y la limpia', async ({ baseURL }) => {
  const api = await clienteApiMedico(baseURL);
  const sufijo = sufijoUnico();
  const nombre = nombreUnico('Api', sufijo);
  const payload = {
    tipo: 'TERAPIA',
    nombre,
    precio: 777,
    franja: 'TARDE',
    requiere_derivacion: true,
    cantidad_sesiones: 4,
  };

  let id: number | undefined;

  try {
    const rCrear = await api.post('/api/prestaciones.php', { data: payload });
    expect(rCrear.status()).toBe(201);
    expect(rCrear.headers()['content-type']).toContain('application/json');

    const bodyCrear = await rCrear.json();
    expect(bodyCrear.ok).toBe(true);
    expect(typeof bodyCrear.datos.id).toBe('number');
    id = bodyCrear.datos.id;

    expect(bodyCrear.datos).toMatchObject({
      id,
      ...payload,
    });

    const rDetalle = await api.get(`/api/prestacion.php?id=${id}`);
    expect(rDetalle.status()).toBe(200);
    const bodyDetalle = await rDetalle.json();
    expect(bodyDetalle.ok).toBe(true);
    expect(bodyDetalle.datos).toMatchObject({
      id,
      ...payload,
    });
  } finally {
    if (id !== undefined) {
      const rBorrar = await api.delete(`/api/prestacion.php?id=${id}`);
      expect(rBorrar.status()).toBe(200);
      const bodyBorrar = await rBorrar.json();
      expect(bodyBorrar).toEqual({ ok: true, datos: { id, eliminada: true } });

      const rDetalleLuego = await api.get(`/api/prestacion.php?id=${id}`);
      expect(rDetalleLuego.status()).toBe(404);
    }

    await api.dispose();
  }
});
