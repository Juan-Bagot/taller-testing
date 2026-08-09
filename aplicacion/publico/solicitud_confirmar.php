<?php
// Confirmar la solicitud: acá el carrito de la sesión se convierte en una orden
// médica real, en UNA transacción. El formulario no manda ni ítems ni precios:
// el servidor confirma LO QUE ÉL tiene en la sesión, con precios releídos de la base.
require __DIR__ . '/../app/config.php';
requerir_paciente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: solicitud.php');
    exit;
}

$servicio = new ServicioOrdenes(
    new RepositorioOrdenes(conexion()),
    new RepositorioPrestaciones(conexion()),
);

try {
    $ordenId = $servicio->confirmar(usuario_actual()['email'], $_SESSION['solicitud'] ?? []);
    unset($_SESSION['solicitud']);
    flash_poner('ok', "Orden #$ordenId confirmada.");
    header('Location: historial.php');
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
    header('Location: solicitud.php');
}
exit;
