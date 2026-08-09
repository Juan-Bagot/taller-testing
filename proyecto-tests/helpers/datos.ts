// Datos únicos para los tests que crean cosas (la regla de oro del catálogo):
// con el timestamp en el nombre, dos corridas jamás chocan entre sí.

export const nombreUnico = (prefijo: string): string => `${prefijo}-${Date.now()}`;

export const emailUnico = (prefijo: string): string => `${prefijo}.${Date.now()}@test.com`;

/**
 * La fecha de HOY en formato YYYY-MM-DD, en la zona horaria LOCAL.
 * Ojo: new Date().toISOString() devuelve la fecha en UTC — de noche, en Uruguay,
 * UTC ya está en "mañana" y la comparación contra la app falla.
 */
export const fechaHoy = (): string => new Intl.DateTimeFormat('en-CA').format(new Date());
