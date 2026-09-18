import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { ANA } from "../helpers/usuarios";

test("TC29 - Historial descendente y precio histórico congelado", async ({
  page,
}) => {
  await new PaginaLogin(page).entrar(ANA.email, ANA.password);

  await page.getByRole("link", { name: "Historial" }).click();

  const ordenReciente = page
    .getByRole("table")
    .filter({ hasText: "Ecografía abdominal" });

  const ordenVieja = page
    .getByRole("table")
    .filter({ hasText: "Electrocardiograma" });

  await expect(ordenReciente).toBeVisible();
  await expect(ordenVieja).toBeVisible();

  const tablas = page.getByRole("table");

  await expect(tablas.nth(0)).toContainText("Ecografía abdominal");
  await expect(tablas.nth(1)).toContainText("Electrocardiograma");

  await expect(ordenVieja).toContainText("Fisioterapia de rodilla");

  const electrocardiograma = ordenVieja
    .getByRole("row")
    .filter({ hasText: "Electrocardiograma" });

  await expect(electrocardiograma).toContainText("$ 1.000,00");

  await expect(ordenVieja).toContainText("$ 1.850,00");

  await page.getByRole("link", { name: /catálogo/i }).click();

  await page.getByText("Electrocardiograma", { exact: true }).click();

  await expect(page.getByText("$ 1.200,00")).toBeVisible();
});
