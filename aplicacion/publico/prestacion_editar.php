<?php
// Edición de prestación (?id=). Solo médicos. El tipo no se cambia.
require __DIR__ . '/../app/config.php';
requerir_medico();

require __DIR__ . '/../app/prestacion_desde_formulario.php';

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $servicio->modificar(prestacion_desde_formulario($_POST, (int) ($_POST['id'] ?? 0)));
        flash_poner('ok', 'Prestación actualizada.');
        header('Location: catalogo.php');
    } catch (ExcepcionClinica $e) {
        flash_poner('error', $e->getMessage());
        header('Location: prestacion_editar.php?id=' . (int) ($_POST['id'] ?? 0));
    }
    exit;
}

try {
    $prestacion = $servicio->detalle((int) ($_GET['id'] ?? 0));
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
    header('Location: catalogo.php');
    exit;
}

$titulo = 'Editar prestación';
$accion = 'prestacion_editar.php';
require __DIR__ . '/../app/vistas/vista_prestacion_form.php';
