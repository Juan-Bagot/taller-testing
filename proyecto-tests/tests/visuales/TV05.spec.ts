// ============================================================================
// TV05 — Detalle de terapia en móvil (375×667)
// ----------------------------------------------------------------------------
// Flujo: Presentación visual · Rol: anónimo
//
// La vista de detalle de una terapia es la contracara del detalle de un estudio:
// en móvil la tarjeta se apila en una sola columna y la lista de definiciones
// (precio, franja, derivación, sesiones) debe seguir siendo legible. Esto no se
// ve en un assert funcional: un texto puede estar bien y el layout romperse.
//
// PRECONDICIÓN — SEMILLA INTACTA:
//   la captura es de página completa y compara contra baseline. Si otra prueba
//   dejó una prestación creada o la semilla quedó alterada, la imagen cambia y el
//   diff no dice “qué” falló. Por eso se valida que el detalle esté en la
//   prestación esperada antes de tomar la instantánea.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';

test('TV05: en móvil el detalle de una terapia se ve apilado', async ({ page }) => {
  test.skip(test.info().project.name !== 'movil', 'corre solo en el proyecto móvil (viewport 375)');

  const catalogo = new PaginaCatalogo(page);

  // --- PASO 1: abrir el detalle de la terapia semilla -----------------------
  await catalogo.ir();
  await catalogo.abrirDetalle('Terapia respiratoria');

  // --- ESTABILIZAR ANTES DE CAPTURAR -----------------------------------------
  await expect(page.getByRole('heading', { name: 'Terapia respiratoria' })).toBeVisible();
  await expect(page.getByText('Terapia', { exact: true })).toBeVisible();
  await expect(page.getByText('Requiere derivación')).toBeVisible();
  await expect(page.getByText('Cantidad de sesiones')).toBeVisible();
  await expect(page.getByText('Duración')).not.toBeVisible();

  // --- PASO 2: captura de la página completa --------------------------------
  // La PRIMERA corrida genera la baseline; luego compara contra ella.
  await expect(page).toHaveScreenshot('detalle-terapia-movil.png', { fullPage: true });
});
