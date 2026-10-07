import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { LUIS } from "../helpers/usuarios";
import { esperarFlash } from "../helpers/flash";

test("TC07 - Salir cierra la sesión y descarta la solicitud a medio armar", async ({
  page,
}) => {
  const login = new PaginaLogin(page);

  await login.entrar(LUIS.email, LUIS.password);

  const fila = page.getByRole("row").filter({ hasText: "Audiometría" });
  await fila.getByRole("button", { name: "Solicitar" }).click();

  await expect(page.getByRole("link", { name: /Solicitud/ })).toContainText(
    "1",
  );

  await page.getByRole("link", { name: "Salir" }).click();

  await expect(page).toHaveURL(/login\.php/);
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

  await page.goto("/historial.php");

  await expect(page).toHaveURL(/login\.php/);
  await esperarFlash(
    page,
    "error",
    "Tenés que iniciar sesión para entrar ahí.",
  );

  await login.entrar(LUIS.email, LUIS.password);

  await page.getByRole("link", { name: /Solicitud/ }).click();

  await expect(page.getByText("La solicitud está vacía.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Solicitud/ })).not.toContainText(
    /\d/,
  );
});
