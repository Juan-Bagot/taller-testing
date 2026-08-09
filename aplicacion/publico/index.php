<?php
// La portada redirige al catálogo: es la pantalla principal del sitio.
require __DIR__ . '/../app/config.php';

header('Location: catalogo.php');
exit;
