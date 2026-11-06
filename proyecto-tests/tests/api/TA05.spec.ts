import { expect, test } from '@playwright/test';

test('TA05: el detalle por id devuelve la prestación pedida', async ({ request }) => {
  const listado = await request.get('/api/prestaciones.php');
  expect(listado.status()).toBe(200);

  const cuerpoListado = await listado.json();
  const id = cuerpoListado.datos.find((p: { nombre: string }) => p.nombre === 'Audiometría')?.id;

  expect(id, 'Debe existir la prestación "Audiometría" en la semilla').toBeDefined();

  const detalle = await request.get(`/api/prestacion.php?id=${id}`);
  expect(detalle.status()).toBe(200);
  expect(detalle.headers()['content-type']).toContain('application/json');

  const cuerpo = await detalle.json();
  expect(cuerpo.ok).toBe(true);
  expect(cuerpo.datos).toMatchObject({
    id,
    nombre: 'Audiometría',
    precio: 700,
    franja: 'MANANA',
    tipo: 'ESTUDIO',
    duracion_minutos: 20,
  });
});
