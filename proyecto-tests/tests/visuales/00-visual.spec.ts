// TV01 (login), TV02 (registro, página completa) y TV06 (captura de ELEMENTO: flash de error).
// Baselines: se crean en la primera corrida (npm run baselines) y se comparan después.
// Nombre 00-*: corre primero. Solo en el proyecto "escritorio" (1280x720).

import { expect, test } from "@playwright/test";
import { PaginaLogin } from "../../pages/PaginaLogin";
import { ANA } from "../../helpers/usuarios";

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "escritorio",
    "corre solo en escritorio (1280x720)",
  );
});

test("TV01: login en escritorio", async ({ page }) => {
  await page.goto("/login.php");

  // Estabilizar antes de capturar
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

  await expect(page).toHaveScreenshot("login-escritorio.png");
});

test("TV02: registro en escritorio", async ({ page }) => {
  await page.goto("/registro.php");

  await expect(
    page.getByRole("button", { name: "Crear cuenta" }),
  ).toBeVisible();

  await expect(page).toHaveScreenshot("registro-escritorio.png", {
    fullPage: true,
  });
});

test("TV06: flash de error (captura de elemento)", async ({ page }) => {
  await new PaginaLogin(page).entrar(ANA.email, "incorrecta");

  const flash = page.locator(".mensaje-error");
  await expect(flash).toHaveText("Email o contraseña incorrectos.");

  await expect(flash).toHaveScreenshot("flash-error.png");
});