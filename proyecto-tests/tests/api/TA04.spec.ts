// ============================================================================
// TA04 — Listar con búsqueda y orden
// ----------------------------------------------------------------------------
// Flujo: API JSON · Rol: anónimo (sin login)
//
// El caso es el TC13 hablado por API:
//   1. `buscar=TERAPIA&orden=precio` → la búsqueda es case-insensitive y se
//      combina con el orden: exactamente 3 semilla, ascendentes por precio;
//   2. `orden=cualquiera` → la API NO lo ignora en silencio (como hace la web,
//      que cae a "nombre"), sino que responde 400 VALIDACION.
//
// Impacto en los datos: NINGUNO. Read-only puro.
//
// "Exactamente 3" es seguro porque la regla de oro prohíbe que los nombres
// únicos de otros casos contengan "terapia" (ver helpers/datos.ts).
// ============================================================================

import { expect, test } from '@playwright/test';

test('TA04: el listado busca sin distinguir mayúsculas, ordena por precio y valida el orden', async ({ request }) => {
  // --- PASO 1: búsqueda en MAYÚSCULAS + orden por precio ---------------------
  await test.step('GET ?buscar=TERAPIA&orden=precio', async () => {
    const respuesta = await request.get('/api/prestaciones.php', {
      params: { buscar: 'TERAPIA', orden: 'precio' },
    });

    expect(respuesta.status()).toBe(200);
    const cuerpo = await respuesta.json();
    expect(cuerpo.ok).toBe(true);

    // Exactamente 3, en este orden: $400, $850, $1.500.
    const nombres = cuerpo.datos.map((p: { nombre: string }) => p.nombre);
    expect(nombres).toEqual(['Masoterapia', 'Fisioterapia de rodilla', 'Terapia respiratoria']);

    // Los precios confirman que el orden es por precio y no por nombre
    // (alfabéticamente Fisioterapia iría antes que Masoterapia).
    const precios = cuerpo.datos.map((p: { precio: number }) => p.precio);
    expect(precios).toEqual([400, 850, 1500]);
  });

  // --- PASO 2: un orden inválido ---------------------------------------------
  await test.step('GET ?orden=cualquiera → 400', async () => {
    const respuesta = await request.get('/api/prestaciones.php', {
      params: { orden: 'cualquiera' },
    });

    expect(respuesta.status()).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.ok).toBe(false);
    expect(cuerpo.error.codigo).toBe('VALIDACION');
    expect(cuerpo).not.toHaveProperty('datos');
  });
});
