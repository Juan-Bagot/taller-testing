import { expect, test } from "../fixtures";
import { esperarFlash } from "../helpers/flash";

test("TC17 - Detalle con id inexistente", async ({ page }) => {
  await page.goto("prestacion.php?id=99999");
  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, "error", "No existe esa prestación.");
});
