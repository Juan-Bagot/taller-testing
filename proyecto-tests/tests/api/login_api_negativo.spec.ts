// TA02 — POST /api/login.php: casos negativos.

import { test } from '@playwright/test';
import { MEDICO } from '../../helpers/usuarios';
import { esperarErrorApi } from '../../helpers/api';

test.describe('TA02: login por API, negativos', () => {
  test('credenciales incorrectas → 401', async ({ request }) => {
    const r = await request.post('/api/login.php', {
      data: { email: MEDICO.email, password: 'mala' },
    });
    await esperarErrorApi(r, 401, 'CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos.');
  });

  test('falta password → 400 VALIDACION', async ({ request }) => {
    const r = await request.post('/api/login.php', { data: { email: MEDICO.email } });
    await esperarErrorApi(r, 400, 'VALIDACION');
  });

  test('cuerpo que no es JSON → 400 JSON_INVALIDO', async ({ request }) => {
    const r = await request.post('/api/login.php', {
      headers: { 'Content-Type': 'application/json' },
      data: 'esto-no-es-json',
    });
    await esperarErrorApi(r, 400, 'JSON_INVALIDO');
  });
});