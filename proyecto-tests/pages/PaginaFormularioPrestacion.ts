import { type Locator, type Page } from '@playwright/test';

// Page object del formulario de prestación.
//
// El alta (`prestacion_alta.php`) y la edición (`prestacion_editar.php`) son la
// MISMA vista (`vista_prestacion_form.php`) con dos diferencias:
//
//   1. el tipo: en el alta son dos radios (Estudio/Terapia); en la edición es
//      un dato fijo — un estudio no se convierte en terapia;
//   2. el botón: "Crear prestación" vs "Guardar cambios".
//
// Por eso un solo page object cubre las dos pantallas.
//
// NOTA DE COMPATIBILIDAD: este archivo AMPLÍA el page object original del
// starter. `irAlta`, `completarEstudio`, `completarTerapia` y `enviar` siguen
// existiendo con la misma firma — `franja` sigue siendo opcional. Lo agregado
// son los locators de cada campo (para asertar sobre el formulario, no solo
// completarlo) y los atajos `guardar` / `crearEstudio`.

type Franja = 'Mañana' | 'Tarde' | 'Noche';

export class PaginaFormularioPrestacion {
  constructor(private page: Page) {}

  // ---------------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------------

  async irAlta(): Promise<void> {
    await this.page.goto('/prestacion_alta.php');
  }

  // (a la edición se llega desde el catálogo, con `PaginaCatalogo.editar(nombre)`)

  // ---------------------------------------------------------------------------
  // Campos sueltos
  // ---------------------------------------------------------------------------

  campoNombre(): Locator {
    return this.page.getByLabel('Nombre');
  }

  campoPrecio(): Locator {
    return this.page.getByLabel('Precio');
  }

  selectorDeFranja(): Locator {
    return this.page.getByLabel('Franja horaria');
  }

  campoDuracion(): Locator {
    return this.page.getByLabel('Duración (minutos)');
  }

  campoSesiones(): Locator {
    return this.page.getByLabel('Cantidad de sesiones');
  }

  casillaDerivacion(): Locator {
    return this.page.getByRole('checkbox', { name: 'Requiere derivación' });
  }

  /** Los radios de tipo. Solo existen en el ALTA: en la edición son 0. */
  radiosDeTipo(): Locator {
    return this.page.getByRole('radio');
  }

  /** El párrafo "Tipo: Estudio" que reemplaza a los radios en la edición. */
  tipoFijo(): Locator {
    return this.page.locator('.dato-fijo');
  }

  // ---------------------------------------------------------------------------
  // Operaciones de alto nivel
  // ---------------------------------------------------------------------------

  async elegirTipo(tipo: 'Estudio' | 'Terapia'): Promise<void> {
    await this.page.getByRole('radio', { name: tipo }).check();
  }

  async completarNombre(nombre: string): Promise<void> {
    await this.campoNombre().fill(nombre);
  }

  async completarPrecio(precio: number): Promise<void> {
    await this.campoPrecio().fill(String(precio));
  }

  async elegirFranja(franja: Franja): Promise<void> {
    await this.selectorDeFranja().selectOption({ label: franja });
  }

  /** Completa el formulario de alta de un ESTUDIO (no lo envía). */
  async completarEstudio(datos: {
    nombre: string;
    precio: number;
    franja?: Franja;
    duracion: number;
  }): Promise<void> {
    await this.elegirTipo('Estudio');
    await this.completarNombre(datos.nombre);
    await this.completarPrecio(datos.precio);
    if (datos.franja) {
      await this.elegirFranja(datos.franja);
    }
    await this.campoDuracion().fill(String(datos.duracion));
  }

  /** Completa el formulario de alta de una TERAPIA (no lo envía). */
  async completarTerapia(datos: {
    nombre: string;
    precio: number;
    franja?: Franja;
    requiereDerivacion: boolean;
    sesiones: number;
  }): Promise<void> {
    await this.elegirTipo('Terapia');
    await this.completarNombre(datos.nombre);
    await this.completarPrecio(datos.precio);
    if (datos.franja) {
      await this.elegirFranja(datos.franja);
    }
    if (datos.requiereDerivacion) {
      await this.casillaDerivacion().check();
    }
    await this.campoSesiones().fill(String(datos.sesiones));
  }

  /**
   * Envía el formulario.
   *
   * El mismo botón cambia de texto entre alta ("Crear prestación") y edición
   * ("Guardar cambios"): la regex cubre los dos casos con un solo método.
   */
  async guardar(): Promise<void> {
    await this.page.getByRole('button', { name: /Crear prestación|Guardar cambios/ }).click();
  }

  /** Alias histórico de `guardar()`: es el nombre que traía el starter. */
  async enviar(): Promise<void> {
    await this.guardar();
  }

  /** Atajo del alta: completar un estudio y enviarlo. */
  async crearEstudio(datos: {
    nombre: string;
    precio: number;
    franja?: Franja;
    duracion: number;
  }): Promise<void> {
    await this.completarEstudio(datos);
    await this.guardar();
  }
}
