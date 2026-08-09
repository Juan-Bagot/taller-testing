<?php
// El detalle de una prestación (?id=), con los datos propios de su subtipo.
require __DIR__ . '/../app/config.php';

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

try {
    $prestacion = $servicio->detalle((int) ($_GET['id'] ?? 0));
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
    header('Location: catalogo.php');
    exit;
}

require __DIR__ . '/../app/vistas/vista_prestacion_detalle.php';
