<?php
// El historial de órdenes del paciente, la más reciente primero.
require __DIR__ . '/../app/config.php';
requerir_paciente();

$servicio = new ServicioOrdenes(
    new RepositorioOrdenes(conexion()),
    new RepositorioPrestaciones(conexion()),
);
$ordenes = $servicio->historial(usuario_actual()['email']);

require __DIR__ . '/../app/vistas/vista_historial.php';
