// Flujo: Control de acceso — TC08.
// El control es del servidor: no depende de que los botones estén ocultos.

import { expect, test } from "@playwright/test";
import { esperarFlash } from "../../helpers/flash";

const PAGINAS_PROTEGIDAS = [
  "seguidas.php",
  "solicitud.php",
  "historial.php",
  "prestacion_alta.php",
];

// Un test por página: si una falla, el reporte dice cuál, y las otras igual corren.
for (const url of PAGINAS_PROTEGIDAS) {
  test(`TC08: anónimo a ${url} rebota al login`, async ({ page }) => {
    await page.goto("/" + url);
    await expect(page).toHaveURL(/login\.php/);
    await esperarFlash(
      page,
      "error",
      "Tenés que iniciar sesión para entrar ahí.",
    );
  });
}
