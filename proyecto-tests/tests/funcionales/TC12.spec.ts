// ============================================================================
// TC12 — Catálogo ordenado por precio
// ----------------------------------------------------------------------------
// Flujo: Catálogo, búsqueda y orden · Rol: anónimo
//
// El caso verifica que, al elegir "Por precio" y aplicar:
//   1. la URL lleva `orden=precio` (el formulario es GET: el orden se comparte);
//   2. las 8 prestaciones semilla quedan en orden ASCENDENTE por precio,
//      un orden distinto al alfabético (Audiometría deja de ser la primera);
//   3. el selector conserva "Por precio" tras recargar la página.
//
// Impacto en los datos: NINGUNO. Read-only puro, repetible infinitas veces.
//
// Igual que TC11, el orden se aserta RELATIVO: se descartan los nombres que no
// son de la semilla (residuo de otros casos) antes de comparar.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { NOMBRES_SEMILLA_ALFABETICO, esDeLaSemilla } from '../../helpers/semilla';

// Las 8 semilla ordenadas por precio ascendente ($400 → $1.800).
// Escrita a mano y no calculada: el test tiene que decir QUÉ espera, no
// re-implementar el ORDER BY de la aplicación.
const NOMBRES_SEMILLA_POR_PRECIO = [
  'Masoterapia',             // $ 400
  'Fonoaudiología',          // $ 600
  'Audiometría',             // $ 700
  'Fisioterapia de rodilla', // $ 850
  'Radiografía de tórax',    // $ 950
  'Electrocardiograma',      // $ 1.200
  'Terapia respiratoria',    // $ 1.500
  'Ecografía abdominal',     // $ 1.800
];

test('TC12: el catálogo se ordena por precio ascendente', async ({ page }) => {
  const catalogo = new PaginaCatalogo(page);

  // --- PASO 1: ir al catálogo -------------------------------------------------
  await catalogo.ir();
  await expect(catalogo.titulo()).toBeVisible();

  // Punto de partida: el orden por defecto es el alfabético. Sin esto, un bug
  // que ordenara SIEMPRE por precio pasaría el caso sin que se note.
  await expect(catalogo.selectorDeOrden()).toHaveValue('nombre');

  // --- PASO 2: elegir "Por precio" y Aplicar ---------------------------------
  await catalogo.ordenarPor('Por precio');

  // --- RESULTADO ESPERADO ----------------------------------------------------

  // (a) La URL contiene orden=precio. Se aserta primero: confirma que el
  // formulario GET se envió antes de leer la tabla.
  await expect(page).toHaveURL(/[?&]orden=precio/);

  // (b) El orden RELATIVO de la semilla es ascendente por precio.
  const soloSemilla = (await catalogo.nombresListados()).filter(esDeLaSemilla);
  expect(soloSemilla).toEqual(NOMBRES_SEMILLA_POR_PRECIO);

  // (c) Y difiere del alfabético: Audiometría ya no es la primera.
  // Redundante con (b), pero es lo que el caso pide explicitar.
  expect(soloSemilla[0]).toBe('Masoterapia');
  expect(soloSemilla[0]).not.toBe(NOMBRES_SEMILLA_ALFABETICO[0]);
  expect(soloSemilla.at(-1)).toBe('Ecografía abdominal');

  // Los precios de los extremos, tal como se ven en pantalla.
  await expect(catalogo.celdaDe('Masoterapia', 'Precio')).toHaveText('$ 400,00');
  await expect(catalogo.celdaDe('Ecografía abdominal', 'Precio')).toHaveText('$ 1.800,00');

  // (d) El selector queda en "Por precio".
  await expect(catalogo.selectorDeOrden()).toHaveValue('precio');

  // (e) Al estar en la URL, el orden sobrevive a un refresco.
  await page.reload();
  await expect(catalogo.selectorDeOrden()).toHaveValue('precio');
  expect((await catalogo.nombresListados()).filter(esDeLaSemilla)).toEqual(NOMBRES_SEMILLA_POR_PRECIO);
});
