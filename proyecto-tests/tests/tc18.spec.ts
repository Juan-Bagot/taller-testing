import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { MEDICO } from "../helpers/usuarios";
import { esperarFlash } from "../helpers/flash";

test("TC18 - Crear un estudio (auto-contenido)", async ({ page }) => {
  const nombre = `Estudio Prueba ${Date.now()}`;

  await new PaginaLogin(page).entrar(MEDICO.email, MEDICO.password);

  await page.getByRole("link", { name: "Nueva prestación" }).click();

  await page.getByLabel("Estudio").check();
  await page.getByLabel("Nombre").fill(nombre);
  await page.getByLabel("Precio").fill("990");
  await page.getByLabel("Franja").selectOption({ label: "Tarde" });
  await page.getByLabel("Duración (minutos)").fill("25");

  await page.getByRole("button", { name: "Crear prestación" }).click();

  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, "ok", "Prestación creada.");

  const fila = page.getByRole("row").filter({ hasText: nombre });

  await expect(fila).toBeVisible();
  await expect(fila).toContainText("Estudio");
  await expect(fila).toContainText("Tarde");
  await expect(fila).toContainText("$ 990,00");

  await fila.getByRole("link", { name: /editar/i }).click();

  await expect(page).toHaveURL(/prestacion_editar\.php\?id=\d+/);

  await expect(page.getByLabel("Duración (minutos)")).toHaveValue("25");

  await page.goto("/catalogo.php");

  const filaCreada = page.getByRole("row").filter({ hasText: nombre });

  await filaCreada.getByRole("button", { name: /eliminar/i }).click();

  await expect(page.getByRole("row").filter({ hasText: nombre })).toHaveCount(
    0,
  );
});
