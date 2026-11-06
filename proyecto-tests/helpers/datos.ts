// Datos únicos para los tests que CREAN cosas (la regla de oro del catálogo:
// "los casos deben poder correrse en cualquier orden y repetidas veces").
//
// Con el timestamp adentro del nombre, dos corridas jamás chocan entre sí:
// la segunda corrida de un caso no se encuentra con lo que dejó la primera.
//
// NOTA DE COMPATIBILIDAD: `nombreUnico(prefijo)`, `emailUnico` y `fechaHoy`
// mantienen la firma que traía el starter. Lo agregado es `sufijoUnico()` y el
// segundo parámetro OPCIONAL de `nombreUnico`.

/** El sufijo único de una corrida. Se toma UNA vez por test y se reusa. */
export const sufijoUnico = (): number => Date.now();

/**
 * Un nombre único: `Editar-1757439201234`.
 *
 * El sufijo se puede pasar por parámetro para que dos nombres del mismo test
 * queden emparentados (`Editar-123` y `Editada-123`): al leer el catálogo o la
 * base de datos se ve de un vistazo que salieron de la misma corrida.
 *
 * OJO con el prefijo que elijas: NO puede contener palabras de la semilla
 * ("terapia", "grafía", ni nombres de prestaciones). Un nombre como
 * "Terapia-123" haría fallar las aserciones de búsqueda de TC13/TA04, que
 * esperan exactamente 3 resultados al buscar "TERAPIA".
 */
export const nombreUnico = (prefijo: string, sufijo: number = sufijoUnico()): string =>
  `${prefijo}-${sufijo}`;

export const emailUnico = (prefijo: string): string => `${prefijo}.${Date.now()}@test.com`;

/**
 * La fecha de HOY en formato YYYY-MM-DD, en la zona horaria LOCAL.
 * Ojo: new Date().toISOString() devuelve la fecha en UTC — de noche, en Uruguay,
 * UTC ya está en "mañana" y la comparación contra la app falla.
 */
export const fechaHoy = (): string => new Intl.DateTimeFormat('en-CA').format(new Date());
