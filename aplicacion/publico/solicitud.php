<?php
// La solicitud (el carrito). Vive en $_SESSION['solicitud'] como [id => cantidad]:
// mientras el paciente elige, la base de datos no se entera de nada.
require __DIR__ . '/../app/config.php';
requerir_paciente();

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

// De [id => cantidad] a objetos con el precio ACTUAL (el histórico se congela
// recién al confirmar). Si una prestación fue eliminada mientras tanto, se omite.
$items = [];
foreach ($_SESSION['solicitud'] ?? [] as $prestacionId => $cantidad) {
    try {
        $items[] = [
            'prestacion' => $servicio->detalle((int) $prestacionId),
            'cantidad'   => (int) $cantidad,
        ];
    } catch (PrestacionInexistenteException) {
        unset($_SESSION['solicitud'][$prestacionId]);
    }
}

require __DIR__ . '/../app/vistas/vista_solicitud.php';
