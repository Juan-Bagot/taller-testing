import { expect, test } from "../fixtures";
import { PaginaCatalogo } from "../pages/PaginaCatalogo";
import { PaginaDetalle } from "../pages/PaginaDetalle";
import { PaginaSolicitud } from "../pages/PaginaSolicitud";
import { PaginaHistorial } from "../pages/PaginaHistorial";

test("TC28 - Confirmar la orden médica", async ({ comoPaciente: page }) => {
  const catalogo = new PaginaCatalogo(page);
  await catalogo.solicitar("Ecografía abdominal");

  await catalogo.abrirDetalle("Fisioterapia de rodilla");
  await new PaginaDetalle(page).agregarASolicitud(2);

  const linkSolicitud = page.getByRole("link", { name: /Solicitud/ });
  await expect(linkSolicitud).toContainText("3");

  await linkSolicitud.click();
  await new PaginaSolicitud(page).confirmar();

  await expect(page).toHaveURL(/historial\.php/);
  await expect(page.locator(".mensaje-ok")).toHaveText(/^Orden #\d+ confirmada\.$/);

  const orden = new PaginaHistorial(page).ordenMasReciente();

  const ecografia = orden.getByRole("row").filter({ hasText: "Ecografía abdominal" });
  await expect(ecografia.locator('[data-rotulo="Cantidad"]')).toHaveText("1");
  await expect(ecografia.locator('[data-rotulo="Precio"]')).toHaveText("$ 1.800,00");
  await expect(ecografia.locator('[data-rotulo="Subtotal"]')).toHaveText("$ 1.800,00");

  const fisioterapia = orden.getByRole("row").filter({ hasText: "Fisioterapia de rodilla" });
  await expect(fisioterapia.locator('[data-rotulo="Cantidad"]')).toHaveText("2");
  await expect(fisioterapia.locator('[data-rotulo="Precio"]')).toHaveText("$ 850,00");
  await expect(fisioterapia.locator('[data-rotulo="Subtotal"]')).toHaveText("$ 1.700,00");

  await expect(orden.locator("tfoot .total .numero")).toHaveText("$ 3.500,00");

  await expect(linkSolicitud).not.toContainText(/\d/);
});
