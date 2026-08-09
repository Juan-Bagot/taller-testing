<?php
// El historial de órdenes del paciente. Espera $ordenes (OrdenMedica[], DESC).
$titulo = 'Mi historial';
require __DIR__ . '/fragmentos/cabecera.php';
?>

<h1>Mi historial de órdenes</h1>

<?php if ($ordenes === []): ?>
    <p class="vacio">Todavía no confirmaste ninguna orden.</p>
<?php else: ?>
    <?php foreach ($ordenes as $orden): ?>
        <article class="tarjeta orden">
            <header>
                <h2>Orden #<?= $orden->id ?></h2>
                <span class="fecha"><?= e($orden->fecha) ?></span>
            </header>

            <table class="listado compacto">
                <thead>
                    <tr>
                        <th>Prestación</th>
                        <th class="numero">Cantidad</th>
                        <th class="numero">Precio de ese momento</th>
                        <th class="numero">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orden->lineas as $linea): ?>
                        <tr>
                            <td data-rotulo="Prestación"><?= e($linea->prestacionNombre) ?></td>
                            <td data-rotulo="Cantidad" class="numero"><?= $linea->cantidad ?></td>
                            <td data-rotulo="Precio" class="numero">$ <?= number_format($linea->precioUnitario, 2, ',', '.') ?></td>
                            <td data-rotulo="Subtotal" class="numero">$ <?= number_format($linea->subtotal(), 2, ',', '.') ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr class="total">
                        <td colspan="3">Total</td>
                        <td class="numero">$ <?= number_format($orden->total(), 2, ',', '.') ?></td>
                    </tr>
                </tfoot>
            </table>
        </article>
    <?php endforeach; ?>
<?php endif; ?>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
