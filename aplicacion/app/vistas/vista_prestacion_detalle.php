<?php
// El detalle de una prestación. Espera $prestacion (Estudio o Terapia).
$titulo = $prestacion->nombre;
require __DIR__ . '/fragmentos/cabecera.php';
?>

<p class="volver"><a href="catalogo.php">← Volver al catálogo</a></p>

<article class="tarjeta detalle">
    <span class="etiqueta"><?= e($prestacion->etiquetaTipo()) ?></span>
    <h1><?= e($prestacion->nombre) ?></h1>

    <dl>
        <dt>Precio</dt>
        <dd class="precio-grande">$ <?= number_format($prestacion->precio, 2, ',', '.') ?></dd>

        <dt>Franja horaria</dt>
        <dd><?= e($prestacion->franja->etiqueta()) ?></dd>

        <?php if ($prestacion instanceof Estudio): ?>
            <dt>Duración</dt>
            <dd><?= $prestacion->duracionMinutos ?> minutos</dd>
        <?php endif; ?>

        <?php if ($prestacion instanceof Terapia): ?>
            <dt>Requiere derivación</dt>
            <dd><?= $prestacion->requiereDerivacion ? 'Sí' : 'No' ?></dd>

            <dt>Cantidad de sesiones</dt>
            <dd><?= $prestacion->cantidadSesiones ?></dd>
        <?php endif; ?>
    </dl>

    <?php if (es_paciente()): ?>
        <div class="acciones-detalle">
            <form method="post" action="seguida_agregar.php">
                <input type="hidden" name="prestacion_id" value="<?= $prestacion->id ?>">
                <input type="hidden" name="volver" value="prestacion.php?id=<?= $prestacion->id ?>">
                <button type="submit" class="boton secundario">Seguir</button>
            </form>
            <form method="post" action="solicitud_agregar.php" class="con-cantidad">
                <input type="hidden" name="prestacion_id" value="<?= $prestacion->id ?>">
                <label>Cantidad <input type="number" name="cantidad" value="1" min="1" max="99"></label>
                <button type="submit" class="boton">Agregar a la solicitud</button>
            </form>
        </div>
    <?php endif; ?>

    <?php if (es_medico()): ?>
        <div class="acciones-detalle">
            <a class="boton secundario" href="prestacion_editar.php?id=<?= $prestacion->id ?>">Editar</a>
        </div>
    <?php endif; ?>
</article>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
