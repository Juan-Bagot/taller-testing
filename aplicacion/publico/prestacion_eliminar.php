<?php
// Eliminación de prestación. Solo médicos, y SOLO por POST: un GET no debe
// borrar nada (los links se prefetchean, los buscadores los siguen).
require __DIR__ . '/../app/config.php';
requerir_medico();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: catalogo.php');
    exit;
}

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

try {
    $servicio->eliminar((int) ($_POST['id'] ?? 0));
    flash_poner('ok', 'Prestación eliminada.');
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
}

header('Location: catalogo.php');
exit;
