<?php
// Seguir una prestación. Solo pacientes, solo POST.
// El hidden "volver" dice a qué página regresar (catálogo o detalle).
require __DIR__ . '/../app/config.php';
requerir_paciente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: catalogo.php');
    exit;
}

$servicio = new ServicioSeguidas(
    new RepositorioSeguidas(conexion()),
    new RepositorioPrestaciones(conexion()),
);

try {
    $servicio->agregar(usuario_actual()['email'], (int) ($_POST['prestacion_id'] ?? 0));
    flash_poner('ok', 'Agregada a tus seguidas.');
} catch (ExcepcionClinica $e) {
    flash_poner('error', $e->getMessage());
}

// Solo volvemos a páginas nuestras: nada de redirigir a donde diga un formulario.
$volver = in_array($_POST['volver'] ?? '', ['catalogo.php', 'seguidas.php'], true)
    ? $_POST['volver']
    : (str_starts_with($_POST['volver'] ?? '', 'prestacion.php?id=') ? $_POST['volver'] : 'catalogo.php');

header('Location: ' . $volver);
exit;
