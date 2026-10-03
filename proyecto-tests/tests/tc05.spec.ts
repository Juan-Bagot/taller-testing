import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { MEDICO } from "../helpers/usuarios";
import { esperarFlash } from "../helpers/flash";

test("TC05 - Login exitoso de médico", async ({ page }) => {
  await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);

  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, "ok", "Hola, Dra. Admin.");

  await expect(
    page.getByRole("link", { name: "Nueva prestación" }),
  ).toBeVisible();

  for (const nombre of ["Seguidas", "Solicitud", "Historial"]) {
    await expect(page.getByRole("link", { name: nombre })).toHaveCount(0);
  }

  const filas = page.locator("tbody tr");
  const total = await filas.count();
  expect(total).toBeGreaterThan(0);

  for (const fila of await filas.all()) {
    await expect(fila.getByRole("link", { name: /editar/i })).toBeVisible();
    await expect(fila.getByRole("button", { name: /eliminar/i })).toBeVisible();
    await expect(
      fila.getByRole("button", { name: /seguir|solicitar/i }),
    ).toHaveCount(0);
    await expect(
      fila.getByRole("link", { name: /seguir|solicitar/i }),
    ).toHaveCount(0);
  }
});
