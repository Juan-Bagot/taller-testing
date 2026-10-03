import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { MEDICO } from "../helpers/usuarios";
import { esperarFlash } from "../helpers/flash";

test("TC10 - médico no accede a funciones de paciente", async ({ page }) => {
  await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);

  for (const url of ["seguidas.php", "solicitud.php", "historial.php"]) {
    await page.goto("/" + url);

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, "error", "Esa función es solo para pacientes.");
  }
});
