import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { ANA } from "../helpers/usuarios";
import { esperarFlash } from "../helpers/flash";

test("TC09 - paciente no accede a funciones de médico", async ({ page }) => {
  await new PaginaLogin(page).entrar(ANA.email, ANA.password);

  for (const url of ["prestacion_alta.php", "prestacion_editar.php?id=1"]) {
    await page.goto("/" + url);

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, "error", "Esa función es solo para médicos.");

    await expect(page.getByRole("link", { name: "Historial" })).toBeVisible();
  }
});
