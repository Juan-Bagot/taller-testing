<?php
// Cerrar sesión: se olvida todo (incluida la solicitud a medio armar).
require __DIR__ . '/../app/config.php';

session_destroy();

header('Location: login.php');
exit;
