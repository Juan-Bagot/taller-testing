import { expect, test } from '@playwright/test';
import { ANA } from '../helpers/usuarios';
import { nombreUnico } from '../helpers/datos';

test('TA08 - Crear con sesión de paciente → 403', async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:9080' });

  const login = await api.post('/api/login.php', {
    data: { email: ANA.email, password: ANA.password },
  });
  expect(login.status()).toBe(200);
  expect((await login.json()).datos.tipo).toBe('PACIENTE');

  const nombre = nombreUnico('Api403');
  const respuesta = await api.post('/api/prestaciones.php', {
    data: { tipo: 'ESTUDIO', nombre, precio: 700, franja: 'MANANA', duracion_minutos: 20 },
  });

  expect(respuesta.status()).toBe(403);
  expect(await respuesta.json()).toMatchObject({
    ok: false,
    error: { codigo: 'SOLO_MEDICO' },
  });

  const listado = await api.get('/api/prestaciones.php');
  expect(listado.status()).toBe(200);
  const { datos } = await listado.json();
  const nombres = datos.map((p: { nombre: string }) => p.nombre);
  expect(nombres).not.toContain(nombre);
});
