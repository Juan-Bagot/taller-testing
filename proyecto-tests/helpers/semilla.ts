// Los datos semilla del catálogo (los que carga `datos_iniciales.php`), en UN
// solo lugar. TC11 los recorre entero; otros casos usan alguno suelto.
//
// Los valores están escritos TAL COMO SE VEN EN PANTALLA, no como están en la
// base: la franja se muestra "Mañana" (en la base es 'MANANA') y el precio se
// muestra "$ 700,00" (en la base es 700.00). El test compara contra lo que ve
// el usuario, que es lo que el caso de prueba especifica.

export type PrestacionSemilla = {
  nombre: string;
  tipo: 'Estudio' | 'Terapia';
  franja: 'Mañana' | 'Tarde' | 'Noche';
  precio: string;
};

/**
 * Las 8 prestaciones semilla, YA en orden alfabético — que es el orden por
 * defecto del catálogo (`ORDER BY nombre`). Notá que ese orden NO coincide con
 * el de precios: está hecho a propósito para que ordenar se note (TC11 vs TC12).
 */
export const PRESTACIONES_SEMILLA: PrestacionSemilla[] = [
  { nombre: 'Audiometría',             tipo: 'Estudio', franja: 'Mañana', precio: '$ 700,00' },
  { nombre: 'Ecografía abdominal',     tipo: 'Estudio', franja: 'Tarde',  precio: '$ 1.800,00' },
  { nombre: 'Electrocardiograma',      tipo: 'Estudio', franja: 'Noche',  precio: '$ 1.200,00' },
  { nombre: 'Fisioterapia de rodilla', tipo: 'Terapia', franja: 'Tarde',  precio: '$ 850,00' },
  { nombre: 'Fonoaudiología',          tipo: 'Terapia', franja: 'Mañana', precio: '$ 600,00' },
  { nombre: 'Masoterapia',             tipo: 'Terapia', franja: 'Tarde',  precio: '$ 400,00' },
  { nombre: 'Radiografía de tórax',    tipo: 'Estudio', franja: 'Mañana', precio: '$ 950,00' },
  { nombre: 'Terapia respiratoria',    tipo: 'Terapia', franja: 'Noche',  precio: '$ 1.500,00' },
];

/** Solo los nombres, en orden alfabético. */
export const NOMBRES_SEMILLA_ALFABETICO: string[] = PRESTACIONES_SEMILLA.map((p) => p.nombre);

/** ¿Este nombre es de la semilla, o lo creó algún test? (lo usa TC11). */
export const esDeLaSemilla = (nombre: string): boolean =>
  NOMBRES_SEMILLA_ALFABETICO.includes(nombre);
