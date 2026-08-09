<?php
// Las seguidas del paciente. Espera $seguidas (Seguido[]).
$titulo = 'Mis seguidas';
require __DIR__ . '/fragmentos/cabecera.php';
?>

<h1>Mis seguidas</h1>

<?php if ($seguidas === []): ?>
    <p class="vacio">Todavía no seguís ninguna prestación.
       <a href="catalogo.php">Mirá el catálogo</a>.</p>
<?php else: ?>
    <table class="listado">
        <thead>
            <tr>
                <th>Prestación</th>
                <th>Tipo</th>
                <th class="numero">Precio</th>
                <th>Seguida desde</th>
                <th class="acciones"></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($seguidas as $seguida): ?>
                <tr>
                    <td data-rotulo="Prestación">
                        <a href="prestacion.php?id=<?= $seguida->prestacion->id ?>"><?= e($seguida->prestacion->nombre) ?></a>
                    </td>
                    <td data-rotulo="Tipo"><span class="etiqueta"><?= e($seguida->prestacion->etiquetaTipo()) ?></span></td>
                    <td data-rotulo="Precio" class="numero">$ <?= number_format($seguida->prestacion->precio, 2, ',', '.') ?></td>
                    <td data-rotulo="Desde"><?= e($seguida->fecha) ?></td>
                    <td class="acciones">
                        <form method="post" action="seguida_quitar.php">
                            <input type="hidden" name="prestacion_id" value="<?= $seguida->prestacion->id ?>">
                            <button type="submit" class="boton chico peligro">Quitar</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
