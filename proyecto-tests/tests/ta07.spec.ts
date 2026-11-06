import { expect, test } from '@playwright/test';
import { nombreUnico } from '../helpers/datos';

test('TA07 - Crear sin sesión → 401', async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:9080' });

  const nombre = nombreUnico('Api401');
  const respuesta = await api.post('/api/prestaciones.php', {
    data: { tipo: 'ESTUDIO', nombre, precio: 700, franja: 'MANANA', duracion_minutos: 20 },
  });

  expect(respuesta.status()).toBe(401);
  expect(await respuesta.json()).toMatchObject({
    ok: false,
    error: { codigo: 'NO_AUTENTICADO' },
  });

  const listado = await api.get('/api/prestaciones.php');
  expect(listado.status()).toBe(200);
  const { datos } = await listado.json();
  const nombres = datos.map((p: { nombre: string }) => p.nombre);
  expect(nombres).not.toContain(nombre);
});
