import { type Locator, type Page } from '@playwright/test';

// COMPONENT OBJECT de la barra de navegación.
//
// La barra no es una pantalla: es un componente que aparece en TODAS
// (`app/vistas/fragmentos/cabecera.php`). Modelarla aparte evita que cada page
// object repita "cómo se llega al enlace Historial".
//
// Lo que muestra depende de quién esté logueado:
//   anónimo   → "Entrar" y "Registrarse"
//   médico    → "Nueva prestación" (y NO "Seguidas"/"Solicitud"/"Historial")
//   paciente  → "Seguidas", "Solicitud" (con contador del carrito) e "Historial"
// Eso es justamente lo que asertan TC04 y TC05.

export class Barra {
  constructor(private page: Page) {}

  /** La raíz del componente: todo se busca ADENTRO de la barra, no en la página. */
  private raiz(): Locator {
    return this.page.locator('nav.barra');
  }

  /**
   * Un enlace de la barra por su texto visible.
   *
   * Deliberadamente NO usamos `exact: true`: el enlace "Solicitud" incluye
   * adentro el <span class="contador"> con la cantidad del carrito, así que su
   * nombre accesible pasa a ser "Solicitud 3" cuando hay ítems. Con búsqueda
   * por subcadena, `enlace('Solicitud')` lo encuentra en los dos estados.
   */
  enlace(texto: string): Locator {
    return this.raiz().getByRole('link', { name: texto });
  }

  /** El nombre del usuario logueado (a la derecha, antes de "Salir"). */
  nombreUsuario(): Locator {
    return this.raiz().locator('.nombre-usuario');
  }

  /** El globito con la cantidad de ítems de la solicitud. No existe si está vacía. */
  contadorDeSolicitud(): Locator {
    return this.raiz().locator('.contador');
  }
}
