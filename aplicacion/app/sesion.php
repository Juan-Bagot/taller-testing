<?php
// Todo lo que tiene que ver con la sesión, en un solo archivo:
// quién está logueado, el control de acceso, los mensajes flash y el escape de HTML.

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Quién está logueado
// ---------------------------------------------------------------------------

/** Lo que guardamos del usuario al loguearse: email, nombre y tipo. Nunca la contraseña. */
function usuario_actual(): ?array
{
    return $_SESSION['usuario'] ?? null;
}

function hay_sesion(): bool
{
    return usuario_actual() !== null;
}

function es_medico(): bool
{
    return (usuario_actual()['tipo'] ?? '') === 'MEDICO';
}

function es_paciente(): bool
{
    return (usuario_actual()['tipo'] ?? '') === 'PACIENTE';
}

// ---------------------------------------------------------------------------
// El control de acceso: ÚNICO lugar del proyecto donde se decide quién entra.
// Cada página protegida lo invoca en su primera línea útil.
// Esconder un botón no es seguridad: cualquiera escribe la URL a mano.
// ---------------------------------------------------------------------------

function requerir_sesion(): void
{
    if (!hay_sesion()) {
        flash_poner('error', 'Tenés que iniciar sesión para entrar ahí.');
        header('Location: login.php');
        exit;
    }
}

function requerir_medico(): void
{
    requerir_sesion();
    if (!es_medico()) {
        flash_poner('error', 'Esa función es solo para médicos.');
        header('Location: catalogo.php');
        exit;
    }
}

function requerir_paciente(): void
{
    requerir_sesion();
    if (!es_paciente()) {
        flash_poner('error', 'Esa función es solo para pacientes.');
        header('Location: catalogo.php');
        exit;
    }
}

// ---------------------------------------------------------------------------
// Mensajes flash: se escriben antes de un redirect y se muestran UNA vez
// en la página siguiente. Los escribe flash_poner(), los consume cabecera.php.
// ---------------------------------------------------------------------------

function flash_poner(string $tipo, string $texto): void
{
    $_SESSION['flash'] = ['tipo' => $tipo, 'texto' => $texto];
}

/** Devuelve el flash pendiente y lo borra (por eso se muestra una sola vez). */
function flash_sacar(): ?array
{
    $flash = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $flash;
}

// ---------------------------------------------------------------------------
// Escape de HTML: TODA salida dinámica de las vistas pasa por acá.
// Si un dato trae "<script>...", se imprime como texto inofensivo.
// ---------------------------------------------------------------------------

function e(?string $texto): string
{
    return htmlspecialchars($texto ?? '', ENT_QUOTES, 'UTF-8');
}
