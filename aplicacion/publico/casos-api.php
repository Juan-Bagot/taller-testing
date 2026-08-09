<?php
// El catálogo de casos de prueba de la API (TA), más el resumen del contrato.
require __DIR__ . '/../app/config.php';

$todos = json_decode(file_get_contents(__DIR__ . '/../app/datos/casos.json'), true);

$grupos = array_values(array_filter($todos,
    fn($g) => str_contains($g['grupo'], 'API')));

$titulo = 'Casos de prueba de la API';
$activa = 'api';
require __DIR__ . '/../app/vistas/vista_casos.php';
