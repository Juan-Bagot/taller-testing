<?php
// El catálogo de casos de prueba WEB y VISUALES (TC + TV), servido por el
// propio sitio bajo prueba — así el catálogo y la app viajan siempre juntos.
require __DIR__ . '/../app/config.php';

$todos = json_decode(file_get_contents(__DIR__ . '/../app/datos/casos.json'), true);

// Los dos primeros grupos: web funcionales y visuales.
$grupos = array_values(array_filter($todos,
    fn($g) => !str_contains($g['grupo'], 'API')));

$titulo = 'Casos de prueba';
$activa = 'web';
require __DIR__ . '/../app/vistas/vista_casos.php';
