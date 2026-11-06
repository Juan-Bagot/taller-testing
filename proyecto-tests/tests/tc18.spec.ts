import { expect, test } from "../fixtures";
import { PaginaCatalogo } from "../pages/PaginaCatalogo";
import { PaginaFormularioPrestacion } from "../pages/PaginaFormularioPrestacion";
import { nombreUnico } from "../helpers/datos";
import { esperarFlash } from "../helpers/flash";

test("TC18 - Crear un estudio (auto-contenido)", async ({ comoMedico: page }) => {
  const nombre = nombreUnico("Estudio Prueba");
  const catalogo = new PaginaCatalogo(page);

  await page.getByRole("link", { name: "Nueva prestación" }).click();

  const formulario = new PaginaFormularioPrestacion(page);
  await formulario.completarEstudio({ nombre, precio: 990, franja: "Tarde", duracion: 25 });
  await formulario.enviar();

  await expect(page).toHaveURL(/catalogo\.php/);
  await esperarFlash(page, "ok", "Prestación creada.");

  const fila = catalogo.filaDe(nombre);

  await expect(fila).toBeVisible();
  await expect(fila).toContainText("Estudio");
  await expect(fila).toContainText("Tarde");
  await expect(fila).toContainText("$ 990,00");

  await catalogo.abrirDetalle(nombre);

  await expect(page).toHaveURL(/prestacion\.php\?id=\d+/);
  await expect(page.getByText("Duración")).toBeVisible();
  await expect(page.getByText("25 minutos")).toBeVisible();

  await catalogo.ir();
  await catalogo.eliminar(nombre);

  await expect(catalogo.filaDe(nombre)).toHaveCount(0);
});
