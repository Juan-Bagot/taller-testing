<?php
// Registro de médicos y pacientes.
// GET: muestra el formulario. POST: intenta registrar y redirige (PRG).
require __DIR__ . '/../app/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servicio = new ServicioUsuarios(new RepositorioUsuarios(conexion()));

    try {
        $servicio->registrar(
            $_POST['tipo'] === 'MEDICO' ? 'MEDICO' : 'PACIENTE',
            trim($_POST['email'] ?? ''),
            trim($_POST['nombre'] ?? ''),
            $_POST['password'] ?? '',
            trim($_POST['extra'] ?? ''),
        );
        flash_poner('ok', 'Cuenta creada. Ya podés iniciar sesión.');
        header('Location: login.php');
    } catch (ExcepcionClinica $e) {
        flash_poner('error', $e->getMessage());
        header('Location: registro.php');
    }
    exit;
}

require __DIR__ . '/../app/vistas/vista_registro.php';
