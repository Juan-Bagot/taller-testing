import { expect, test } from "../fixtures";
import { esperarFlash } from "../helpers/flash";

test("TC08 - Anónimo no entra a ninguna página protegida", async ({ page }) => {
  for (const url of [
    "seguidas.php",
    "solicitud.php",
    "historial.php",
    "prestacion_alta.php",
  ]) {
    await page.goto("/" + url);

    await expect(page).toHaveURL(/login\.php/);
    await esperarFlash(
      page,
      "error",
      "Tenés que iniciar sesión para entrar ahí.",
    );
  }
});
