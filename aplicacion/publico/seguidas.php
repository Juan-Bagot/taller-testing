<?php
// Las seguidas del paciente logueado.
require __DIR__ . '/../app/config.php';
requerir_paciente();

$servicio = new ServicioSeguidas(
    new RepositorioSeguidas(conexion()),
    new RepositorioPrestaciones(conexion()),
);
$seguidas = $servicio->listar(usuario_actual()['email']);

require __DIR__ . '/../app/vistas/vista_seguidas.php';
