// ============================================================================
// TC14 — Búsqueda sin resultados y "Limpiar"
// ----------------------------------------------------------------------------
// Flujo: Catálogo, búsqueda y orden · Rol: anónimo
//
// El caso verifica las dos mitades del "camino vacío" de la búsqueda:
//   1. buscar algo que no existe NO muestra una tabla vacía, sino el mensaje
//      "No hay prestaciones que coincidan con la búsqueda." y el enlace "Limpiar";
//   2. "Limpiar" vuelve al catálogo completo con el campo de búsqueda vacío.
//
// Impacto en los datos: NINGUNO. Read-only puro, repetible infinitas veces.
//
// El texto `zzz-no-existe` no puede coincidir con nada: ni con la semilla ni
// con los nombres únicos que crean otros casos (Editar-…, Api-…, Put-…).
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { NOMBRES_SEMILLA_ALFABETICO, esDeLaSemilla } from '../../helpers/semilla';

const TEXTO_INEXISTENTE = 'zzz-no-existe';

test('TC14: una búsqueda sin resultados muestra el mensaje y "Limpiar" la deshace', async ({ page }) => {
  const catalogo = new PaginaCatalogo(page);

  await catalogo.ir();
  await expect(catalogo.titulo()).toBeVisible();

  // Sin búsqueda activa, la vista ni siquiera imprime "Limpiar"
  // (`if ($buscar !== '')` en vista_catalogo.php).
  await expect(catalogo.enlaceLimpiar()).toHaveCount(0);

  // --- PASO 1: buscar un texto que no existe ---------------------------------
  await test.step('buscar "zzz-no-existe"', async () => {
    await catalogo.buscar(TEXTO_INEXISTENTE);

    await expect(page).toHaveURL(/[?&]buscar=zzz-no-existe/);

    // (1) Ni tabla ni filas: el mensaje la reemplaza.
    await expect(catalogo.mensajeSinResultados()).toBeVisible();
    await expect(catalogo.tabla()).toHaveCount(0);

    // El input conserva lo buscado y aparece el enlace "Limpiar".
    await expect(catalogo.campoDeBusqueda()).toHaveValue(TEXTO_INEXISTENTE);
    await expect(catalogo.enlaceLimpiar()).toBeVisible();
  });

  // --- PASO 2: click en "Limpiar" --------------------------------------------
  await test.step('click en "Limpiar"', async () => {
    await catalogo.enlaceLimpiar().click();

    // (2) Vuelve al catálogo SIN parámetros...
    await expect(page).toHaveURL(/\/catalogo\.php$/);

    // ...con el campo de búsqueda vacío, sin mensaje y sin "Limpiar"...
    await expect(catalogo.campoDeBusqueda()).toHaveValue('');
    await expect(catalogo.mensajeSinResultados()).toHaveCount(0);
    await expect(catalogo.enlaceLimpiar()).toHaveCount(0);

    // ...y con TODAS las prestaciones. Aserción relativa (regla de oro): las 8
    // semilla están, en orden; si hay filas de más (residuo de otro caso), no importa.
    await expect(catalogo.tabla()).toBeVisible();
    const soloSemilla = (await catalogo.nombresListados()).filter(esDeLaSemilla);
    expect(soloSemilla).toEqual(NOMBRES_SEMILLA_ALFABETICO);
  });
});
