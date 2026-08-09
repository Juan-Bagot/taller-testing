<?php
// El HTML común del principio de TODAS las páginas: el <head>, la barra de
// navegación (que cambia según quién esté logueado) y el mensaje flash si hay.
// Espera una variable $titulo definida por la vista que lo incluye.

$usuario = usuario_actual();
$flash = flash_sacar();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <!-- Sin esta línea, el teléfono simula una pantalla grande y el @media no actúa -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($titulo) ?> — Clínica</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body>

<nav class="barra">
    <a class="marca" href="catalogo.php">✚ Clínica</a>

    <div class="enlaces">
        <a href="catalogo.php">Catálogo</a>
        <a href="casos.php">Casos de prueba</a>

        <?php if (es_medico()): ?>
            <a href="prestacion_alta.php">Nueva prestación</a>
        <?php endif; ?>

        <?php if (es_paciente()): ?>
            <a href="seguidas.php">Seguidas</a>
            <a href="solicitud.php">Solicitud
                <?php $enCarrito = array_sum($_SESSION['solicitud'] ?? []); ?>
                <?php if ($enCarrito > 0): ?><span class="contador"><?= $enCarrito ?></span><?php endif; ?>
            </a>
            <a href="historial.php">Historial</a>
        <?php endif; ?>
    </div>

    <div class="quien">
        <?php if ($usuario === null): ?>
            <a href="login.php">Entrar</a>
            <a class="boton chico" href="registro.php">Registrarse</a>
        <?php else: ?>
            <span class="nombre-usuario"><?= e($usuario['nombre']) ?></span>
            <a href="salir.php">Salir</a>
        <?php endif; ?>
    </div>
</nav>

<?php if ($flash !== null): ?>
    <p class="mensaje mensaje-<?= e($flash['tipo']) ?>"><?= e($flash['texto']) ?></p>
<?php endif; ?>

<main>
