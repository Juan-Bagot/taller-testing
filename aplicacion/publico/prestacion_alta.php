<?php
// Alta de prestación. Solo médicos.
require __DIR__ . '/../app/config.php';
requerir_medico();

require __DIR__ . '/../app/prestacion_desde_formulario.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

    try {
        $servicio->agregar(prestacion_desde_formulario($_POST));
        flash_poner('ok', 'Prestación creada.');
        header('Location: catalogo.php');
    } catch (ExcepcionClinica $e) {
        flash_poner('error', $e->getMessage());
        header('Location: prestacion_alta.php');
    }
    exit;
}

$titulo = 'Nueva prestación';
$accion = 'prestacion_alta.php';
$prestacion = null;
require __DIR__ . '/../app/vistas/vista_prestacion_form.php';
