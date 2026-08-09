<?php
// POST /api/login.php — inicia sesión por API.
//
// Cuerpo: { "email": "...", "password": "..." }
// Éxito: 200 con los datos del usuario. La respuesta setea la MISMA cookie de
// sesión que el login web: las requests siguientes del cliente van autenticadas.

declare(strict_types=1);

require __DIR__ . '/_api.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    metodo_no_permitido('POST');
}

$datos = leer_json();

if (($datos['email'] ?? '') === '' || ($datos['password'] ?? '') === '') {
    responder_error(400, 'VALIDACION', 'Faltan email y/o password.');
}

$servicio = new ServicioUsuarios(new RepositorioUsuarios(conexion()));

try {
    $usuario = $servicio->iniciarSesion($datos['email'], $datos['password']);
} catch (ExcepcionClinica $e) {
    [$estado, $codigo] = estado_http_de($e);
    responder_error($estado, $codigo, $e->getMessage());
}

// Exactamente lo mismo que guarda el login web: la sesión es UNA.
$_SESSION['usuario'] = [
    'email'  => $usuario->email,
    'nombre' => $usuario->nombre,
    'tipo'   => $usuario->tipo(),
];

responder(200, ['ok' => true, 'datos' => $_SESSION['usuario']]);
