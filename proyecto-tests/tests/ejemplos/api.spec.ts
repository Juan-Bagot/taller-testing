// EJEMPLO 4 — resuelve TA09 del catálogo (crear una prestación por API).
// Muestra: el request context (la cookie de sesión queda en el contexto),
// datos únicos con timestamp, y la limpieza al final (la regla de oro).

import { expect, test } from '@playwright/test';
import { MEDICO } from '../../helpers/usuarios';
import { nombreUnico } from '../../helpers/datos';

test('TA09: el médico crea una prestación por API (y la limpia)', async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:9080' });

  // Login por API: la respuesta setea la cookie de sesión EN el contexto —
  // todas las llamadas que siguen ya van autenticadas.
  const login = await api.post('/api/login.php', {
    data: { email: MEDICO.email, password: MEDICO.password },
  });
  expect(login.status()).toBe(200);
  expect((await login.json()).datos.tipo).toBe('MEDICO');

  // Crear, con nombre único: dos corridas jamás chocan.
  const nombre = nombreUnico('Api');
  const creada = await api.post('/api/prestaciones.php', {
    data: { tipo: 'TERAPIA', nombre, precio: 777, franja: 'TARDE', requiere_derivacion: true, cantidad_sesiones: 4 },
  });
  expect(creada.status()).toBe(201);
  const { datos } = await creada.json();
  expect(datos).toMatchObject({ nombre, precio: 777, tipo: 'TERAPIA', requiere_derivacion: true });

  // Persistió de verdad: el detalle la devuelve.
  const detalle = await api.get(`/api/prestacion.php?id=${datos.id}`);
  expect(detalle.status()).toBe(200);

  // Limpieza: el test no deja rastro (regla de oro del catálogo).
  const eliminada = await api.delete(`/api/prestacion.php?id=${datos.id}`);
  expect(eliminada.status()).toBe(200);
});
