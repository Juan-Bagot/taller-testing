// ============================================================================
// TA12 — Modificar con PUT (auto-contenido + negativos)
// ----------------------------------------------------------------------------
// Flujo: API JSON · Rol: médico · Documentación: docs/TA12.md
//
// El caso verifica `PUT /api/prestacion.php?id=N`:
//   1. camino feliz: cambia nombre y precio, responde 200 con los datos nuevos
//      y el cambio PERSISTE (un GET posterior lo confirma);
//   2. id inexistente → 404 NO_EXISTE;
//   3. renombrar a un nombre de OTRA prestación ("Audiometría") → 409
//      NOMBRE_REPETIDO (el servicio excluye a la propia del chequeo).
//
// Impacto en los datos: AUTO-CONTENIDO. Crea `Put-<timestamp>`, la modifica y
// la elimina al final — también si una aserción intermedia falla (finally).
// La semilla no se toca: el PUT del paso 5 es RECHAZADO, así que Audiometría
// sigue siendo única.
// ============================================================================

import { expect, test } from '@playwright/test';
import { clienteApiMedico, crearPrestacion, eliminarPrestacion } from '../../helpers/api';
import { nombreUnico, sufijoUnico } from '../../helpers/datos';

test('TA12: el médico modifica una prestación por PUT, con sus negativos', async ({ baseURL }) => {
  // Precondición: login por API como médico (la cookie queda en el contexto).
  const api = await clienteApiMedico(baseURL);

  // Ningún prefijo contiene palabras de la semilla (regla de oro, TC13/TA04).
  const sufijo = sufijoUnico();
  const nombreOriginal = nombreUnico('Put', sufijo);          // Put-1757439201234
  const nombreEditado = nombreUnico('Put-editada', sufijo);   // Put-editada-1757439201234

  // El cuerpo completo de un estudio: el PUT reemplaza la prestación entera y
  // exige que el tipo coincida con el actual (ESTUDIO no se convierte en TERAPIA).
  const estudio = (nombre: string, precio: number) => ({
    tipo: 'ESTUDIO',
    nombre,
    precio,
    franja: 'MANANA',
    duracion_minutos: 20,
  });

  // --- PASO 1: crear la prestación de trabajo --------------------------------
  const id = await crearPrestacion(api, estudio(nombreOriginal, 500));

  try {
    // --- PASO 2: PUT cambiando nombre y precio -------------------------------
    await test.step('PUT con nombre y precio nuevos → 200', async () => {
      const respuesta = await api.put(`/api/prestacion.php?id=${id}`, {
        data: estudio(nombreEditado, 900),
      });

      expect(respuesta.status()).toBe(200);
      const cuerpo = await respuesta.json();
      expect(cuerpo.ok).toBe(true);
      expect(cuerpo.datos).toEqual({ id, ...estudio(nombreEditado, 900) });
    });

    // --- PASO 3: GET para verificar persistencia -----------------------------
    await test.step('GET confirma que el cambio persistió', async () => {
      const respuesta = await api.get(`/api/prestacion.php?id=${id}`);

      expect(respuesta.status()).toBe(200);
      const { datos } = await respuesta.json();
      expect(datos).toMatchObject({ id, nombre: nombreEditado, precio: 900, tipo: 'ESTUDIO' });
    });

    // --- PASO 4: PUT sobre un id inexistente ---------------------------------
    await test.step('PUT sobre id=99999 → 404 NO_EXISTE', async () => {
      const respuesta = await api.put('/api/prestacion.php?id=99999', {
        data: estudio(nombreUnico('Fantasma', sufijo), 900),
      });

      expect(respuesta.status()).toBe(404);
      const cuerpo = await respuesta.json();
      expect(cuerpo.ok).toBe(false);
      expect(cuerpo.error.codigo).toBe('NO_EXISTE');
    });

    // --- PASO 5: PUT con el nombre de OTRA prestación ------------------------
    await test.step('PUT con nombre "Audiometría" → 409 NOMBRE_REPETIDO', async () => {
      const respuesta = await api.put(`/api/prestacion.php?id=${id}`, {
        data: estudio('Audiometría', 900),
      });

      expect(respuesta.status()).toBe(409);
      const cuerpo = await respuesta.json();
      expect(cuerpo.ok).toBe(false);
      expect(cuerpo.error.codigo).toBe('NOMBRE_REPETIDO');

      // El rechazo no dejó cambios a medias: sigue con el nombre del paso 2.
      const detalle = await api.get(`/api/prestacion.php?id=${id}`);
      expect((await detalle.json()).datos.nombre).toBe(nombreEditado);
    });
  } finally {
    // --- PASO 6: limpieza — el caso no deja rastro ---------------------------
    // En un finally: si una aserción de arriba falla, la prestación igual se borra.
    await eliminarPrestacion(api, id);
    const despues = await api.get(`/api/prestacion.php?id=${id}`);
    expect(despues.status()).toBe(404);
    await api.dispose();
  }
});
