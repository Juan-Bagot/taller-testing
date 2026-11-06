import { expect, test } from '@playwright/test';
import { clienteApiMedico } from '../../helpers/api';
import { nombreUnico, sufijoUnico } from '../../helpers/datos';

test('TA10: crear una prestación inválida devuelve 400 y no deja rastro', async ({ baseURL }) => {
  const api = await clienteApiMedico(baseURL);
  const sufijo = sufijoUnico();
  const antes = await api.get('/api/prestaciones.php');
  const antesJson = await antes.json();
  const totalAntes = antesJson.datos.length;

  const casos = [
    {
      nombre: `PrecioCero-${sufijo}`,
      payload: { tipo: 'TERAPIA', nombre: `PrecioCero-${sufijo}`, precio: 0, franja: 'TARDE', requiere_derivacion: true, cantidad_sesiones: 4 },
      mensaje: 'El precio tiene que ser mayor que cero.',
    },
    {
      nombre: `NombreVacio-${sufijo}`,
      payload: { tipo: 'TERAPIA', nombre: '', precio: 250, franja: 'TARDE', requiere_derivacion: false, cantidad_sesiones: 2 },
      mensaje: 'El nombre no puede estar vacío.',
    },
    {
      nombre: `FranjaInvalida-${sufijo}`,
      payload: { tipo: 'TERAPIA', nombre: `FranjaInvalida-${sufijo}`, precio: 250, franja: 'MADRUGADA', requiere_derivacion: false, cantidad_sesiones: 2 },
      mensaje: 'La franja tiene que ser MANANA, TARDE o NOCHE.',
    },
    {
      nombre: `TipoInvalido-${sufijo}`,
      payload: { tipo: 'CIRUGIA', nombre: `TipoInvalido-${sufijo}`, precio: 250, franja: 'TARDE', requiere_derivacion: false, cantidad_sesiones: 2 },
      mensaje: 'El tipo tiene que ser ESTUDIO o TERAPIA.',
    },
  ];

  for (const caso of casos) {
    const respuesta = await api.post('/api/prestaciones.php', { data: caso.payload });
    expect(respuesta.status()).toBe(400);

    const cuerpo = await respuesta.json();
    expect(cuerpo.ok).toBe(false);
    expect(cuerpo.error.codigo).toBe('VALIDACION');
    expect(cuerpo.error.mensaje).toBe(caso.mensaje);
  }

  const despues = await api.get('/api/prestaciones.php');
  const despuesJson = await despues.json();
  expect(despuesJson.datos.length).toBe(totalAntes);
  for (const caso of casos) {
    expect(despuesJson.datos.some((p: { nombre: string }) => p.nombre === caso.nombre)).toBe(false);
  }

  await api.dispose();
});
