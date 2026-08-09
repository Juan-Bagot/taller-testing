<?php
// La conexión a MySQL, con PDO. Una sola por pedido: la primera llamada la crea,
// las siguientes devuelven la misma.

declare(strict_types=1);

function conexion(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        // El DSN dice a qué motor, host y base conectarse, y con qué charset.
        $dsn = 'mysql:host=' . BD_HOST . ';dbname=' . BD_NOMBRE . ';charset=utf8mb4';

        $pdo = new PDO($dsn, BD_USUARIO, BD_PASSWORD, [
            // Si algo falla, que lance una excepción (y no que devuelva false en silencio).
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // fetch() devuelve arrays asociativos: $fila['nombre'], no $fila[1].
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Prepared statements de verdad (los prepara MySQL, no los simula PHP).
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    return $pdo;
}
