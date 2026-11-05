// ============================================================================
// TC11 — Catálogo ordenado por nombre (orden por defecto)
// ----------------------------------------------------------------------------
// Flujo: Catálogo, búsqueda y orden · Rol: anónimo
//
// El caso verifica que, al entrar a `catalogo.php` SIN parámetros:
//   1. las 8 prestaciones semilla aparecen en orden alfabético RELATIVO;
//   2. cada fila muestra Tipo, Franja y Precio formateado ($ 700,00);
//   3. como anónimo, la única acción por fila es "Ver".
//
// Impacto en los datos: NINGUNO. Read-only puro, repetible infinitas veces.
//
// La palabra clave del caso es RELATIVO: el test no exige que el catálogo tenga
// exactamente 8 filas (otro caso pudo crear prestaciones), sino que las 8 de la
// semilla aparezcan ENTRE SÍ en ese orden.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import {
  NOMBRES_SEMILLA_ALFABETICO,
  PRESTACIONES_SEMILLA,
  esDeLaSemilla,
} from '../../helpers/semilla';

test('TC11: el catálogo lista las prestaciones semilla en orden alfabético', async ({ page }) => {
  const catalogo = new PaginaCatalogo(page);

  // --- PASO 1: ir a catalogo.php sin parámetros ------------------------------
  await catalogo.ir();

  // La URL quedó limpia: sin ?orden= ni ?buscar=. Estamos viendo el DEFECTO.
  await expect(page).toHaveURL(/\/catalogo\.php$/);
  await expect(catalogo.titulo()).toBeVisible();

  // --- RESULTADO ESPERADO ----------------------------------------------------

  // (a) El selector de orden arranca en "Por nombre" (value="nombre" en el HTML).
  await expect(catalogo.selectorDeOrden()).toHaveValue('nombre');

  // (b) EL ORDEN RELATIVO. Se leen los nombres tal como se muestran, se
  // descartan los que no son de la semilla (residuo de otros casos) y lo que
  // queda tiene que ser exactamente la lista alfabética.
  //
  // Este filtro es lo que hace al test inmune al orden de ejecución: si TC21
  // dejara a medias una prestación "Editar-123", acá simplemente se ignora.
  const nombresListados = await catalogo.nombresListados();
  const soloSemilla = nombresListados.filter(esDeLaSemilla);

  expect(soloSemilla).toEqual(NOMBRES_SEMILLA_ALFABETICO);

  // (c) EL CONTENIDO DE CADA FILA: tipo, franja y precio formateado.
  // Un `for` sobre los datos semilla: una tabla de datos, un solo cuerpo de test.
  for (const prestacion of PRESTACIONES_SEMILLA) {
    // La fila existe y su nombre es un enlace al detalle.
    await expect(catalogo.enlaceDe(prestacion.nombre)).toBeVisible();

    // "Estudio" / "Terapia": la etiqueta que imprime `etiquetaTipo()`.
    await expect(catalogo.celdaDe(prestacion.nombre, 'Tipo')).toHaveText(prestacion.tipo);

    // "Mañana" / "Tarde" / "Noche": la etiqueta legible del enum Franja
    // (en la base está guardado sin tilde: 'MANANA').
    await expect(catalogo.celdaDe(prestacion.nombre, 'Franja')).toHaveText(prestacion.franja);

    // El precio con el formato de la app: number_format(precio, 2, ',', '.')
    // → "$ 1.800,00". Punto para los miles, coma para los decimales.
    await expect(catalogo.celdaDe(prestacion.nombre, 'Precio')).toHaveText(prestacion.precio);
  }

  // (d) SIN SESIÓN, la única acción por fila es "Ver".
  const primera = NOMBRES_SEMILLA_ALFABETICO[0];
  await expect(catalogo.enlaceDeFila(primera, 'Ver')).toBeVisible();

  // Ninguna fila tiene botones: "Seguir"/"Solicitar" son de paciente y
  // "Eliminar" de médico. Como anónimo, la columna Acciones solo trae el enlace.
  await expect(catalogo.filas().getByRole('button')).toHaveCount(0);
  await expect(catalogo.enlacesDeAccion('Editar')).toHaveCount(0);
});
