import { expect, test } from "../fixtures";
import { PaginaLogin } from "../pages/PaginaLogin";
import { PaginaCatalogo } from "../pages/PaginaCatalogo";
import { PaginaFormularioPrestacion } from "../pages/PaginaFormularioPrestacion";
import { PaginaSolicitud } from "../pages/PaginaSolicitud";
import { PaginaHistorial } from "../pages/PaginaHistorial";
import { esperarFlash } from "../helpers/flash";
import { nombreUnico } from "../helpers/datos";
import { LUIS } from "../helpers/usuarios";

test("TC30 - Precio histórico end-to-end con dos roles", async ({
  comoMedico: pageMedico,
  browser,
}) => {
  const nombre = nombreUnico("Historico");

  const formulario = new PaginaFormularioPrestacion(pageMedico);
  await formulario.irAlta();
  await formulario.completarEstudio({ nombre, precio: 500, franja: "Tarde", duracion: 30 });
  await formulario.enviar();

  await expect(pageMedico).toHaveURL(/catalogo\.php/);
  await esperarFlash(pageMedico, "ok", "Prestación creada.");

  const contextoPaciente = await browser.newContext({
    baseURL: "http://localhost:9080",
    locale: "es-UY",
  });
  const pagePaciente = await contextoPaciente.newPage();
  await new PaginaLogin(pagePaciente).entrar(LUIS.email, LUIS.password);

  const catalogoPaciente = new PaginaCatalogo(pagePaciente);
  await catalogoPaciente.ir();
  await catalogoPaciente.solicitar(nombre);

  const solicitud = new PaginaSolicitud(pagePaciente);
  await solicitud.ir();
  await expect(solicitud.filaDe(nombre)).toBeVisible();
  await solicitud.confirmar();

  await expect(pagePaciente).toHaveURL(/historial\.php/);
  const flash = pagePaciente.locator(".mensaje-ok");
  await expect(flash).toHaveText(/^Orden #\d+ confirmada\.$/);
  const numero = ((await flash.textContent()) ?? "").match(/#(\d+)/)?.[1] ?? "";

  const catalogoMedico = new PaginaCatalogo(pageMedico);
  await catalogoMedico.ir();
  await catalogoMedico.editar(nombre);
  await pageMedico.getByLabel("Precio").fill("800");
  await formulario.enviar();

  await expect(pageMedico).toHaveURL(/catalogo\.php/);
  await esperarFlash(pageMedico, "ok", "Prestación actualizada.");

  const historial = new PaginaHistorial(pagePaciente);
  await historial.ir();
  const orden = historial.ordenes().filter({
    has: pagePaciente.getByRole("heading", { name: `Orden #${numero}`, exact: true }),
  });
  await expect(orden).toHaveCount(1);

  const linea = orden.getByRole("row").filter({ hasText: nombre });
  await expect(linea.locator('[data-rotulo="Precio"]')).toHaveText("$ 500,00");

  await catalogoPaciente.ir();
  await catalogoPaciente.abrirDetalle(nombre);
  await expect(pagePaciente.getByText("$ 800,00")).toBeVisible();

  await catalogoMedico.eliminar(nombre);
  await esperarFlash(
    pageMedico,
    "error",
    "No se puede eliminar: la prestación aparece en una orden médica.",
  );
  await expect(catalogoMedico.filaDe(nombre)).toBeVisible();
});
