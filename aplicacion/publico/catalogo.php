<?php
// El catálogo: la pantalla principal. Público (los botones cambian según el rol).
// Parámetros GET: orden=nombre|precio, buscar=texto.
require __DIR__ . '/../app/config.php';

$orden  = ($_GET['orden'] ?? 'nombre') === 'precio' ? 'precio' : 'nombre';
$buscar = trim($_GET['buscar'] ?? '');

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));
$prestaciones = $servicio->catalogo($orden, $buscar);

require __DIR__ . '/../app/vistas/vista_catalogo.php';
