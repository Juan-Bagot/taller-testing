<?php
// Quitar una prestación de la solicitud. Solo pacientes, solo POST.
require __DIR__ . '/../app/config.php';
requerir_paciente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: solicitud.php');
    exit;
}

unset($_SESSION['solicitud'][(int) ($_POST['prestacion_id'] ?? 0)]);

header('Location: solicitud.php');
exit;
