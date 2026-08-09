<?php
// La solicitud (el carrito). Espera $items: lista de
// ['prestacion' => Prestacion, 'cantidad' => int] con los precios ACTUALES.
$titulo = 'Mi solicitud';
require __DIR__ . '/fragmentos/cabecera.php';

$total = 0;
foreach ($items as $item) {
    $total += $item['prestacion']->precio * $item['cantidad'];
}
?>

<h1>Mi solicitud</h1>

<?php if ($items === []): ?>
    <p class="vacio">La solicitud está vacía.
       <a href="catalogo.php">Agregá prestaciones desde el catálogo</a>.</p>
<?php else: ?>
    <table class="listado">
        <thead>
            <tr>
                <th>Prestación</th>
                <th class="numero">Precio</th>
                <th class="numero">Cantidad</th>
                <th class="numero">Subtotal</th>
                <th class="acciones"></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($items as $item): $p = $item['prestacion']; ?>
                <tr>
                    <td data-rotulo="Prestación"><?= e($p->nombre) ?></td>
                    <td data-rotulo="Precio" class="numero">$ <?= number_format($p->precio, 2, ',', '.') ?></td>
                    <td data-rotulo="Cantidad" class="numero"><?= $item['cantidad'] ?></td>
                    <td data-rotulo="Subtotal" class="numero">$ <?= number_format($p->precio * $item['cantidad'], 2, ',', '.') ?></td>
                    <td class="acciones">
                        <form method="post" action="solicitud_quitar.php">
                            <input type="hidden" name="prestacion_id" value="<?= $p->id ?>">
                            <button type="submit" class="boton chico peligro">Quitar</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr class="total">
                <td colspan="3">Total</td>
                <td class="numero">$ <?= number_format($total, 2, ',', '.') ?></td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <!-- El formulario NO lleva precios ni ítems: la solicitud vive en la sesión,
         del lado del servidor. Lo único que viaja es "confirmá lo que tenés". -->
    <form method="post" action="solicitud_confirmar.php" class="confirmar">
        <button type="submit" class="boton grande">Confirmar la orden médica</button>
    </form>
<?php endif; ?>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
