// ============================================================================
// TC21 — Editar una prestación (auto-contenido; el tipo no se cambia)
// ----------------------------------------------------------------------------
// Flujo: CRUD de prestaciones · Rol: médico
//
// El caso verifica el ciclo completo de la edición:
//   1. el médico crea un estudio propio (no toca la semilla);
//   2. lo edita desde el catálogo;
//   3. el formulario de edición muestra el tipo como DATO FIJO (sin radios):
//      un estudio no se convierte en terapia;
//   4. cambia nombre y precio y guarda;
//   5. limpia lo que creó.
//
// Impacto en los datos: AUTO-CONTENIDO. Crea su propia prestación con nombre
// único (timestamp) y la elimina al final. No toca la semilla y se puede correr
// las veces que sea seguidas.
//
// ¿Por qué crear una prestación en vez de editar "Audiometría"? Porque editar
// un dato semilla lo dejaría cambiado para todos los demás casos (TC11 espera
// "Audiometría — $ 700,00", TV03/TV04 comparan una captura de la tabla entera).
// La misma pregunta aparece en la defensa.
// ============================================================================

import { expect, test } from '../../fixtures';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { PaginaFormularioPrestacion } from '../../pages/PaginaFormularioPrestacion';
import { esperarFlash } from '../../helpers/flash';
import { nombreUnico, sufijoUnico } from '../../helpers/datos';

// La fixture `comoMedico` entrega la página YA logueada como Dra. Admin.
test('TC21: el médico edita una prestación y el tipo no se puede cambiar', async ({
  comoMedico: page,
}) => {
  const catalogo = new PaginaCatalogo(page);
  const formulario = new PaginaFormularioPrestacion(page);

  // Un solo sufijo para los dos nombres: al mirar la base se ve que salieron
  // de la misma corrida. Ningún prefijo contiene palabras de la semilla
  // ("terapia", "grafía"), que romperían las búsquedas de TC13/TA04.
  const sufijo = sufijoUnico();
  const nombreOriginal = nombreUnico('Editar', sufijo);   // Editar-1757439201234
  const nombreEditado = nombreUnico('Editada', sufijo);   // Editada-1757439201234

  // --- PASO 1: crear el estudio de trabajo -----------------------------------
  await test.step('crear el estudio Editar-<timestamp> a $500', async () => {
    await formulario.irAlta();
    await formulario.crearEstudio({
      nombre: nombreOriginal,
      precio: 500,
      franja: 'Mañana',
      duracion: 20,
    });

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación creada.');
    await expect(catalogo.celdaDe(nombreOriginal, 'Precio')).toHaveText('$ 500,00');
  });

  // --- PASO 2: abrir la edición desde su fila del catálogo -------------------
  await test.step('entrar a editarla desde el catálogo', async () => {
    await catalogo.editar(nombreOriginal);

    // La URL de edición lleva el id de la prestación recién creada.
    await expect(page).toHaveURL(/prestacion_editar\.php\?id=\d+/);

    // El formulario llega precargado con los datos actuales.
    await expect(formulario.campoNombre()).toHaveValue(nombreOriginal);
    await expect(formulario.campoPrecio()).toHaveValue('500');
  });

  // --- PASO 3: el tipo es un dato fijo, no se puede cambiar ------------------
  await test.step('el tipo se muestra fijo y sin radios', async () => {
    // En la edición la vista imprime <p class="dato-fijo">Tipo: <span>Estudio</span></p>
    await expect(formulario.tipoFijo()).toHaveText('Tipo: Estudio');

    // Y NO imprime los radios Estudio/Terapia que sí tiene el alta.
    // Ésta es LA aserción del caso: la regla "un estudio no se convierte en
    // terapia" se cumple porque la interfaz ni siquiera ofrece cambiarlo.
    await expect(formulario.radiosDeTipo()).toHaveCount(0);
  });

  // --- PASO 4: cambiar nombre y precio, y guardar ----------------------------
  await test.step('cambiar nombre y precio', async () => {
    await formulario.completarNombre(nombreEditado);
    await formulario.completarPrecio(900);
    await formulario.guardar();

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, 'ok', 'Prestación actualizada.');

    // El catálogo muestra el nombre NUEVO con el precio NUEVO...
    await expect(catalogo.enlaceDe(nombreEditado)).toBeVisible();
    await expect(catalogo.celdaDe(nombreEditado, 'Precio')).toHaveText('$ 900,00');

    // ...el tipo siguió siendo Estudio (se editó, no se recreó)...
    await expect(catalogo.celdaDe(nombreEditado, 'Tipo')).toHaveText('Estudio');

    // ...y el nombre VIEJO ya no está: fue un UPDATE, no un INSERT.
    // Sin esta aserción, un bug que creara una copia en vez de actualizar pasaría inadvertido.
    await expect(catalogo.enlaceDe(nombreOriginal)).toHaveCount(0);
  });

  // --- PASO 5: limpieza — el caso no deja rastro -----------------------------
  await test.step('limpieza: eliminar la prestación creada', async () => {
    await catalogo.eliminar(nombreEditado);

    await esperarFlash(page, 'ok', 'Prestación eliminada.');
    await expect(catalogo.enlaceDe(nombreEditado)).toHaveCount(0);
  });
});
