import { type Locator, type Page } from '@playwright/test';

// Page object del catálogo (`catalogo.php`), la pantalla principal del sitio.
//
// Es la pantalla más usada de la suite y la más "polimórfica": las acciones de
// cada fila cambian según el rol logueado.
//
//   anónimo   → "Ver"
//   paciente  → "Seguir" y "Solicitar"
//   médico    → "Editar" y "Eliminar"
//
// El page object ofrece las cuatro acciones; cada test usa las que su rol tiene.
//
// NOTA DE COMPATIBILIDAD: este archivo AMPLÍA el page object original del
// starter. Todos sus métodos siguen existiendo con la misma firma
// (`ir`, `buscar`, `ordenarPor`, `filaDe`, `abrirDetalle`, `seguir`,
// `solicitar`, `eliminar`, `editar`); lo que se agregó son los locators que
// hacen falta para ASERTAR sobre la tabla, no solo para operarla.

/** Los rótulos de columna que la vista imprime en `data-rotulo`. */
type Columna = 'Nombre' | 'Tipo' | 'Franja' | 'Precio';

/** Las acciones que son <button> dentro de un <form> (la app no muta por GET). */
type AccionBoton = 'Seguir' | 'Solicitar' | 'Eliminar';

/** Las acciones que son enlaces. */
type AccionEnlace = 'Editar' | 'Ver';

export class PaginaCatalogo {
  constructor(private page: Page) {}

  // ---------------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------------

  /** El catálogo sin parámetros: orden por nombre y sin búsqueda. */
  async ir(): Promise<void> {
    await this.page.goto('/catalogo.php');
  }

  // ---------------------------------------------------------------------------
  // Elementos de la pantalla
  // ---------------------------------------------------------------------------

  titulo(): Locator {
    return this.page.getByRole('heading', { name: 'Catálogo de prestaciones' });
  }

  /** La tabla del listado. Acotar acá evita confundir botones de la barra con los de una fila. */
  tabla(): Locator {
    return this.page.locator('table.listado');
  }

  /**
   * Todas las filas de datos (sin el encabezado).
   *
   * Acá sí usamos un selector CSS: "las filas del cuerpo de la tabla" no tiene
   * un rol accesible que las distinga del <thead> (todas son role="row").
   * Queda encapsulado en el page object, que es el lugar donde eso se permite.
   */
  filas(): Locator {
    return this.tabla().locator('tbody tr');
  }

  /**
   * El enlace con el nombre de una prestación (la primera celda de su fila).
   *
   * `exact: true` para que "Editar-123" no matchee también a "Editada-123".
   *
   * Ojo con el detalle de por qué arranca en `this.page` y NO en `this.tabla()`:
   * este locator se reusa como filtro en `filaDe()`, y el locator que se pasa a
   * `filter({ has })` se RE-ANCLA en el elemento externo. Si acá dijera
   * `this.tabla()`, adentro de la fila se buscaría "un table.listado que
   * contenga el enlace" — que no existe — y `filaDe()` no matchearía nunca.
   */
  enlaceDe(nombre: string): Locator {
    return this.page.getByRole('link', { name: nombre, exact: true });
  }

  /**
   * La fila de una prestación: la que CONTIENE su enlace de nombre.
   *
   * Es más robusto que el `getByRole('row', { name: /nombre/ })` clásico: el
   * nombre accesible de una fila es la concatenación de TODAS sus celdas —
   * incluidos los textos de los botones. Como médico, cada fila termina en
   * "… Editar Eliminar", así que una regex /Editar/ matchearía las 8 filas.
   * Filtrando por el enlace del nombre, la fila se identifica por su dato real.
   */
  filaDe(nombre: string): Locator {
    return this.filas().filter({ has: this.enlaceDe(nombre) });
  }

  /** Una celda concreta de una fila, por el rótulo de su columna. */
  celdaDe(nombre: string, columna: Columna): Locator {
    return this.filaDe(nombre).locator(`td[data-rotulo="${columna}"]`);
  }

  /** Los nombres listados, EN EL ORDEN EN QUE SE MUESTRAN. */
  async nombresListados(): Promise<string[]> {
    const celdas = this.tabla().locator('tbody td[data-rotulo="Nombre"]');
    return (await celdas.allTextContents()).map((texto) => texto.trim());
  }

  // ---------------------------------------------------------------------------
  // Filtros (formulario GET: los parámetros quedan en la URL)
  // ---------------------------------------------------------------------------

  campoDeBusqueda(): Locator {
    return this.page.getByRole('searchbox');
  }

  selectorDeOrden(): Locator {
    return this.page.getByRole('combobox');
  }

  async buscar(texto: string): Promise<void> {
    await this.campoDeBusqueda().fill(texto);
    await this.aplicarFiltros();
  }

  async ordenarPor(orden: 'Por nombre' | 'Por precio'): Promise<void> {
    await this.selectorDeOrden().selectOption({ label: orden });
    await this.aplicarFiltros();
  }

  async aplicarFiltros(): Promise<void> {
    await this.page.getByRole('button', { name: 'Aplicar' }).click();
  }

  /** El enlace "Limpiar", que solo existe cuando hay una búsqueda activa. */
  enlaceLimpiar(): Locator {
    return this.page.getByRole('link', { name: 'Limpiar' });
  }

  // ---------------------------------------------------------------------------
  // Acciones por fila (existen o no según el rol logueado)
  // ---------------------------------------------------------------------------

  /** Abre el detalle clickeando el nombre de la prestación. */
  async abrirDetalle(nombre: string): Promise<void> {
    await this.enlaceDe(nombre).click();
  }

  // `exact: true` en todas las acciones, por una razón concreta: la búsqueda por
  // subcadena haría que una prestación llamada "Editar-1757…" matcheara como si
  // fuera el enlace de acción "Editar". El nombre accesible tiene que ser
  // EXACTAMENTE el de la acción.

  accionDeFila(nombre: string, accion: AccionBoton): Locator {
    return this.filaDe(nombre).getByRole('button', { name: accion, exact: true });
  }

  enlaceDeFila(nombre: string, enlace: AccionEnlace): Locator {
    return this.filaDe(nombre).getByRole('link', { name: enlace, exact: true });
  }

  /** TODOS los botones de una acción en la tabla — para contarlos contra las filas. */
  botonesDeAccion(accion: AccionBoton): Locator {
    return this.tabla().getByRole('button', { name: accion, exact: true });
  }

  /** TODOS los enlaces de una acción en la tabla. */
  enlacesDeAccion(enlace: AccionEnlace): Locator {
    return this.tabla().getByRole('link', { name: enlace, exact: true });
  }

  async seguir(nombre: string): Promise<void> {
    await this.accionDeFila(nombre, 'Seguir').click();
  }

  async solicitar(nombre: string): Promise<void> {
    await this.accionDeFila(nombre, 'Solicitar').click();
  }

  async eliminar(nombre: string): Promise<void> {
    await this.accionDeFila(nombre, 'Eliminar').click();
  }

  async editar(nombre: string): Promise<void> {
    await this.enlaceDeFila(nombre, 'Editar').click();
  }
}
