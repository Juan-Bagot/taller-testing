<?php
// Inicio de sesión.
// GET: formulario. POST: verifica credenciales, guarda al usuario en la sesión (PRG).
require __DIR__ . '/../app/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servicio = new ServicioUsuarios(new RepositorioUsuarios(conexion()));

    try {
        $usuario = $servicio->iniciarSesion(
            trim($_POST['email'] ?? ''),
            $_POST['password'] ?? '',
        );

        // En la sesión guardamos lo mínimo para saber quién es: nunca la contraseña.
        $_SESSION['usuario'] = [
            'email'  => $usuario->email,
            'nombre' => $usuario->nombre,
            'tipo'   => $usuario->tipo(),
        ];

        flash_poner('ok', 'Hola, ' . $usuario->nombre . '.');
        header('Location: catalogo.php');
    } catch (ExcepcionClinica $e) {
        flash_poner('error', $e->getMessage());
        header('Location: login.php');
    }
    exit;
}

require __DIR__ . '/../app/vistas/vista_login.php';
