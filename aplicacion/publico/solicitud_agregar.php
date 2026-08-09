<?php
// Agregar una prestación a la solicitud. Solo pacientes, solo POST.
// No toca la base: solo suma en la sesión.
require __DIR__ . '/../app/config.php';
requerir_paciente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: catalogo.php');
    exit;
}

$prestacionId = (int) ($_POST['prestacion_id'] ?? 0);
$cantidad     = max(1, (int) ($_POST['cantidad'] ?? 1));

// Que exista, antes de metérsela al carrito.
$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));
try {
    $servicio->detalle($prestacionId);
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
    header('Location: catalogo.php');
    exit;
}

$_SESSION['solicitud'][$prestacionId] = ($_SESSION['solicitud'][$prestacionId] ?? 0) + $cantidad;

flash_poner('ok', 'Agregada a la solicitud.');
header('Location: catalogo.php');
exit;
