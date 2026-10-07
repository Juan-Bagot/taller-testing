// TA01 — POST /api/login.php: login exitoso.

import { expect, test } from '@playwright/test';
import { MEDICO } from '../../helpers/usuarios';

test('TA01: login por API exitoso', async ({ request }) => {
  const r = await request.post('/api/login.php', {
    data: { email: MEDICO.email, password: MEDICO.password },
  });

  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toContain('application/json');
  expect(await r.json()).toEqual({
    ok: true,
    datos: { email: MEDICO.email, nombre: MEDICO.nombre, tipo: 'MEDICO' },
  });

  const { cookies } = await request.storageState();
  expect(cookies.length).toBeGreaterThan(0);
});