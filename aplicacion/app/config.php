<?php
// El punto de entrada de la aplicación: TODAS las páginas de publico/ empiezan con
//     require __DIR__ . '/../app/config.php';
// y con eso queda todo pronto: errores visibles, sesión iniciada, clases cargadas.

declare(strict_types=1);

// En desarrollo queremos ver todos los errores en pantalla.
error_reporting(E_ALL);

// Dónde está la base de datos. Dentro de Docker el host es "db" (el nombre del
// servicio en docker-compose.yml). Con XAMPP sería "localhost".
const BD_HOST     = 'db';
const BD_NOMBRE   = 'clinica';
const BD_USUARIO  = 'clinica';
const BD_PASSWORD = 'clinica';

// La sesión tiene que arrancar antes de imprimir cualquier cosa.
session_start();

require __DIR__ . '/cargador.php';
require __DIR__ . '/conexion.php';
require __DIR__ . '/sesion.php';
