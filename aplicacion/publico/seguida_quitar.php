<?php
// Dejar de seguir una prestación. Solo pacientes, solo POST.
require __DIR__ . '/../app/config.php';
requerir_paciente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: seguidas.php');
    exit;
}

$servicio = new ServicioSeguidas(
    new RepositorioSeguidas(conexion()),
    new RepositorioPrestaciones(conexion()),
);
$servicio->quitar(usuario_actual()['email'], (int) ($_POST['prestacion_id'] ?? 0));

flash_poner('ok', 'Quitada de tus seguidas.');
header('Location: seguidas.php');
exit;
