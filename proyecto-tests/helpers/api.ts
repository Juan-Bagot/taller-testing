import {
  APIResponse,
  expect,
  request,
  type APIRequestContext,
} from "@playwright/test";
import { MEDICO } from "./usuarios";

/** Aserta una respuesta de error de la API: estado HTTP, ok:false, código y (opcional) mensaje. */
// ALEXIS, se usa en TA02 y TA06 pero sirve para todos los test de API
export async function esperarErrorApi(
  r: APIResponse,
  estado: number,
  codigo: string,
  mensaje?: string,
): Promise<void> {
  expect(r.status()).toBe(estado);
  const cuerpo = await r.json();
  expect(cuerpo.ok).toBe(false);
  expect(cuerpo.error.codigo).toBe(codigo);
  if (mensaje) expect(cuerpo.error.mensaje).toBe(mensaje);
}

// Cliente de la mini-API. Sirve para dos cosas:
//  1. los casos de prueba de API (TA01–TA13);
//  2. preparar y limpiar datos desde tests web (tests híbridos): crear una
//     prestación por API es instantáneo y no depende de la interfaz.

export async function clienteApiMedico(
  baseURL = "http://localhost:9080",
): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL });
  const respuesta = await api.post("/api/login.php", {
    data: { email: MEDICO.email, password: MEDICO.password },
  });
  if (respuesta.status() !== 200) {
    throw new Error(`No se pudo iniciar sesión por API: ${respuesta.status()}`);
  }
  // La cookie de sesión quedó guardada en el contexto: las llamadas siguientes
  // ya van autenticadas.
  return api;
}

export async function crearPrestacion(
  api: APIRequestContext,
  datos: Record<string, unknown>,
): Promise<number> {
  const respuesta = await api.post("/api/prestaciones.php", { data: datos });
  if (respuesta.status() !== 201) {
    throw new Error(`No se pudo crear la prestación: ${respuesta.status()}`);
  }
  return (await respuesta.json()).datos.id;
}

export async function eliminarPrestacion(
  api: APIRequestContext,
  id: number,
): Promise<void> {
  await api.delete(`/api/prestacion.php?id=${id}`);
}
