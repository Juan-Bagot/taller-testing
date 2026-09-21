// ============================================================================
// TC04 — Login exitoso de paciente
// ----------------------------------------------------------------------------
// Flujo: Login y sesión · Rol: paciente (Ana García) · Documentación: docs/TC04.md
//
// El caso verifica TRES cosas a la vez:
//   1. que el login funciona (redirect + flash de bienvenida);
//   2. que la barra de navegación se arma para el rol PACIENTE;
//   3. que el catálogo ofrece las acciones de paciente y NINGUNA de médico.
//
// Impacto en los datos: NINGUNO. Es 100% read-only — solo lee. Se puede correr
// las veces que sea, en cualquier orden, sin resetear nada.
// ============================================================================

import { expect, test } from '@playwright/test';
import { PaginaLogin } from '../../pages/PaginaLogin';
import { PaginaCatalogo } from '../../pages/PaginaCatalogo';
import { Barra } from '../../pages/Barra';
import { ANA } from '../../helpers/usuarios';
import { esperarFlash } from '../../helpers/flash';
import { PRESTACIONES_SEMILLA } from '../../helpers/semilla';

// Una prestación semilla cualquiera, para inspeccionar las acciones de su fila.
const UNA_PRESTACION = PRESTACIONES_SEMILLA[0].nombre; // 'Audiometría'

test('TC04: login exitoso de paciente', async ({ page }) => {
  const login = new PaginaLogin(page);
  const barra = new Barra(page);
  const catalogo = new PaginaCatalogo(page);

  // --- PASOS 1 a 3: ir al login, completar y enviar ---------------------------
  // Este test NO usa la fixture `comoAna` a propósito: el login es lo que está
  // bajo prueba, así que se ejecuta explícitamente.
  await login.entrar(ANA.email, ANA.password);

  // --- RESULTADO ESPERADO ----------------------------------------------------

  // (a) Redirige al catálogo. Se aserta la URL PRIMERO: confirma que el
  // POST-Redirect-GET ocurrió. Si el login fallara, seguiríamos en login.php y
  // el resto de las aserciones daría un error confuso; así falla en el lugar justo.
  await expect(page).toHaveURL(/catalogo\.php/);

  // (b) El flash de bienvenida, con el nombre real del usuario.
  // Se aserta INMEDIATAMENTE: el flash vive una sola página (ver helpers/flash.ts).
  await esperarFlash(page, 'ok', `Hola, ${ANA.nombre}.`);

  // (c) La barra muestra quién es y ofrece salir.
  await expect(barra.nombreUsuario()).toHaveText(ANA.nombre);
  await expect(barra.enlace('Salir')).toBeVisible();
  // Y ya no ofrece entrar ni registrarse: la sesión está abierta.
  await expect(barra.enlace('Entrar')).toHaveCount(0);

  // (d) Las tres secciones del paciente están visibles...
  await expect(barra.enlace('Seguidas')).toBeVisible();
  await expect(barra.enlace('Solicitud')).toBeVisible();
  await expect(barra.enlace('Historial')).toBeVisible();

  // ...y la del médico NO existe. `toHaveCount(0)` en lugar de `not.toBeVisible()`
  // porque queremos afirmar que el enlace NO ESTÁ EN EL HTML — el control de
  // acceso del servidor ni siquiera lo imprime (`if (es_medico())` en cabecera.php).
  await expect(barra.enlace('Nueva prestación')).toHaveCount(0);

  // (e) En el catálogo, la fila de una prestación ofrece las acciones de paciente.
  await expect(catalogo.accionDeFila(UNA_PRESTACION, 'Seguir')).toBeVisible();
  await expect(catalogo.accionDeFila(UNA_PRESTACION, 'Solicitar')).toBeVisible();

  // (f) "cada fila": en vez de asertar un número fijo de filas (prohibido por la
  // regla de oro — otro test pudo crear prestaciones), comparamos la cantidad de
  // botones contra la cantidad de filas QUE HAY. Es una aserción relativa: vale
  // con 8 filas y con 80.
  const cantidadDeFilas = await catalogo.filas().count();
  await expect(catalogo.botonesDeAccion('Seguir')).toHaveCount(cantidadDeFilas);
  await expect(catalogo.botonesDeAccion('Solicitar')).toHaveCount(cantidadDeFilas);

  // (g) Y ninguna fila ofrece las acciones de médico, en toda la tabla.
  await expect(catalogo.enlacesDeAccion('Editar')).toHaveCount(0);
  await expect(catalogo.botonesDeAccion('Eliminar')).toHaveCount(0);
});
