// TA06 — GET /api/prestacion.php: id inexistente, ausente e inválido.

import { test } from '@playwright/test';
import { esperarErrorApi } from '../../helpers/api';

test.describe('TA06: detalle, id inexistente y ausente', () => {
  test('id inexistente → 404 NO_EXISTE', async ({ request }) => {
    const r = await request.get('/api/prestacion.php?id=99999');
    await esperarErrorApi(r, 404, 'NO_EXISTE', 'No existe esa prestación.');
  });

  test('sin id → 400 VALIDACION', async ({ request }) => {
    const r = await request.get('/api/prestacion.php');
    await esperarErrorApi(r, 400, 'VALIDACION');
  });

  test('id no numérico → 400 VALIDACION', async ({ request }) => {
    const r = await request.get('/api/prestacion.php?id=abc');
    await esperarErrorApi(r, 400, 'VALIDACION');
  });
});