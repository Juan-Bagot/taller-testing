// ============================================================================
// TA03 — Listar prestaciones (público) y shape por subtipo
// ----------------------------------------------------------------------------
// Flujo: API JSON · Rol: anónimo (sin login)
//
// El caso verifica que `GET /api/prestaciones.php`:
//   1. es público (200 sin cookie de sesión);
//   2. devuelve las 8 semilla en orden alfabético RELATIVO;
//   3. serializa cada prestación con los campos de SU subtipo y solo esos:
//      un Estudio trae `duracion_minutos` y ningún campo de terapia; una
//      Terapia trae `requiere_derivacion`/`cantidad_sesiones` y no la duración.
//
// Impacto en los datos: NINGUNO. Read-only puro.
//
// La fixture `request` de Playwright es un contexto nuevo, SIN login, que ya
// usa el baseURL de la config: justo la precondición del caso.
// ============================================================================

import { expect, test } from '@playwright/test';
import { NOMBRES_SEMILLA_ALFABETICO, esDeLaSemilla } from '../../helpers/semilla';

type PrestacionJson = { id: number; nombre: string; [campo: string]: unknown };

test('TA03: el listado es público y cada prestación trae los campos de su subtipo', async ({ request }) => {
  // --- PASO 1: GET /api/prestaciones.php sin sesión --------------------------
  const respuesta = await request.get('/api/prestaciones.php');

  // --- RESULTADO ESPERADO ----------------------------------------------------

  // (a) 200, JSON, y la envoltura de éxito de la API.
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
  const cuerpo = await respuesta.json();
  expect(cuerpo.ok).toBe(true);
  expect(Array.isArray(cuerpo.datos)).toBe(true);

  const datos: PrestacionJson[] = cuerpo.datos;

  // (b) Las 8 semilla en orden alfabético relativo (se ignora el residuo).
  const soloSemilla = datos.map((p) => p.nombre).filter(esDeLaSemilla);
  expect(soloSemilla).toEqual(NOMBRES_SEMILLA_ALFABETICO);

  const buscar = (nombre: string): PrestacionJson => {
    const encontrada = datos.find((p) => p.nombre === nombre);
    expect(encontrada, `"${nombre}" tiene que estar en el listado`).toBeDefined();
    return encontrada!;
  };

  // (c) Shape de un ESTUDIO: Electrocardiograma.
  // Los valores van como están en la BASE (NOCHE, 1200), no como en pantalla.
  const electro = buscar('Electrocardiograma');
  expect(electro).toMatchObject({
    tipo: 'ESTUDIO',
    precio: 1200,
    franja: 'NOCHE',
    duracion_minutos: 10,
  });
  expect(typeof electro.id).toBe('number');
  // ...y NINGÚN campo de terapia.
  expect(electro).not.toHaveProperty('requiere_derivacion');
  expect(electro).not.toHaveProperty('cantidad_sesiones');

  // (d) Shape de una TERAPIA: Terapia respiratoria.
  const respiratoria = buscar('Terapia respiratoria');
  expect(respiratoria).toMatchObject({
    tipo: 'TERAPIA',
    requiere_derivacion: true, // un booleano JSON, no 1 ni "1"
    cantidad_sesiones: 5,
  });
  // ...y SIN el campo de estudio.
  expect(respiratoria).not.toHaveProperty('duracion_minutos');
});
