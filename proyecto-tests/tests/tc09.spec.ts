import { expect, test } from "../fixtures";
import { esperarFlash } from "../helpers/flash";

test("TC09 - paciente no accede a funciones de médico", async ({ comoAna: page }) => {
  for (const url of ["prestacion_alta.php", "prestacion_editar.php?id=1"]) {
    await page.goto("/" + url);

    await expect(page).toHaveURL(/catalogo\.php/);
    await esperarFlash(page, "error", "Esa función es solo para médicos.");

    await expect(page.getByRole("link", { name: "Historial" })).toBeVisible();
  }
});
