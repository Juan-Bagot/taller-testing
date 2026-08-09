<?php
// UN formulario para el alta y para la edición. Espera:
//   $titulo       'Nueva prestación' | 'Editar prestación'
//   $accion       la página a la que postea (prestacion_alta.php | prestacion_editar.php)
//   $prestacion   null en el alta; la Prestacion a editar en la edición
//
// En la edición el tipo NO se cambia: un estudio no se convierte en terapia.
$editando = $prestacion !== null;
require __DIR__ . '/fragmentos/cabecera.php';
?>

<h1><?= e($titulo) ?></h1>

<form method="post" action="<?= e($accion) ?>" class="tarjeta formulario">
    <?php if ($editando): ?>
        <input type="hidden" name="id" value="<?= $prestacion->id ?>">
        <input type="hidden" name="tipo" value="<?= e($prestacion->tipo()) ?>">
        <p class="dato-fijo">Tipo: <span class="etiqueta"><?= e($prestacion->etiquetaTipo()) ?></span></p>
    <?php else: ?>
        <fieldset class="opciones-tipo">
            <legend>Tipo</legend>
            <label><input type="radio" name="tipo" value="ESTUDIO" checked> Estudio</label>
            <label><input type="radio" name="tipo" value="TERAPIA"> Terapia</label>
        </fieldset>
    <?php endif; ?>

    <label>Nombre
        <input type="text" name="nombre" required
               value="<?= $editando ? e($prestacion->nombre) : '' ?>">
    </label>

    <label>Precio
        <input type="number" name="precio" required min="1" step="0.01"
               value="<?= $editando ? $prestacion->precio : '' ?>">
    </label>

    <label>Franja horaria
        <select name="franja">
            <?php foreach (Franja::cases() as $franja): ?>
                <option value="<?= $franja->value ?>"
                    <?= $editando && $prestacion->franja === $franja ? 'selected' : '' ?>>
                    <?= e($franja->etiqueta()) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </label>

    <fieldset>
        <legend>Si es un estudio</legend>
        <label>Duración (minutos)
            <input type="number" name="duracion_minutos" min="1"
                   value="<?= $editando && $prestacion instanceof Estudio ? $prestacion->duracionMinutos : '' ?>">
        </label>
    </fieldset>

    <fieldset>
        <legend>Si es una terapia</legend>
        <label class="en-linea">
            <input type="checkbox" name="requiere_derivacion" value="1"
                <?= $editando && $prestacion instanceof Terapia && $prestacion->requiereDerivacion ? 'checked' : '' ?>>
            Requiere derivación
        </label>
        <label>Cantidad de sesiones
            <input type="number" name="cantidad_sesiones" min="1"
                   value="<?= $editando && $prestacion instanceof Terapia ? $prestacion->cantidadSesiones : '' ?>">
        </label>
    </fieldset>

    <button type="submit" class="boton"><?= $editando ? 'Guardar cambios' : 'Crear prestación' ?></button>
    <p class="al-pie"><a href="catalogo.php">Cancelar</a></p>
</form>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
