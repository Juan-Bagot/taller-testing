<?php
// La pantalla principal: el catálogo. Espera:
//   $prestaciones  Prestacion[]     lo que hay que listar
//   $orden         'nombre'|'precio'  el orden actual
//   $buscar        string             el texto buscado (puede ser '')
$titulo = 'Catálogo';
require __DIR__ . '/fragmentos/cabecera.php';
?>

<h1>Catálogo de prestaciones</h1>

<!-- Buscar y ordenar son un formulario GET: los parámetros quedan en la URL,
     así que el resultado se puede refrescar y compartir. -->
<form method="get" action="catalogo.php" class="filtros">
    <input type="search" name="buscar" placeholder="Buscar por nombre…" value="<?= e($buscar) ?>">

    <select name="orden">
        <option value="nombre" <?= $orden === 'nombre' ? 'selected' : '' ?>>Por nombre</option>
        <option value="precio" <?= $orden === 'precio' ? 'selected' : '' ?>>Por precio</option>
    </select>

    <button type="submit" class="boton chico">Aplicar</button>
    <?php if ($buscar !== ''): ?><a href="catalogo.php">Limpiar</a><?php endif; ?>
</form>

<?php if ($prestaciones === []): ?>
    <p class="vacio">No hay prestaciones que coincidan con la búsqueda.</p>
<?php else: ?>
    <table class="listado">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Franja</th>
                <th class="numero">Precio</th>
                <th class="acciones">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($prestaciones as $p): ?>
                <tr>
                    <td data-rotulo="Nombre"><a href="prestacion.php?id=<?= $p->id ?>"><?= e($p->nombre) ?></a></td>
                    <td data-rotulo="Tipo"><span class="etiqueta"><?= e($p->etiquetaTipo()) ?></span></td>
                    <td data-rotulo="Franja"><?= e($p->franja->etiqueta()) ?></td>
                    <td data-rotulo="Precio" class="numero">$ <?= number_format($p->precio, 2, ',', '.') ?></td>
                    <td class="acciones">
                        <?php if (es_medico()): ?>
                            <a class="boton chico secundario" href="prestacion_editar.php?id=<?= $p->id ?>">Editar</a>
                            <form method="post" action="prestacion_eliminar.php">
                                <input type="hidden" name="id" value="<?= $p->id ?>">
                                <button type="submit" class="boton chico peligro">Eliminar</button>
                            </form>
                        <?php endif; ?>

                        <?php if (es_paciente()): ?>
                            <form method="post" action="seguida_agregar.php">
                                <input type="hidden" name="prestacion_id" value="<?= $p->id ?>">
                                <input type="hidden" name="volver" value="catalogo.php">
                                <button type="submit" class="boton chico secundario">Seguir</button>
                            </form>
                            <form method="post" action="solicitud_agregar.php">
                                <input type="hidden" name="prestacion_id" value="<?= $p->id ?>">
                                <input type="hidden" name="cantidad" value="1">
                                <button type="submit" class="boton chico">Solicitar</button>
                            </form>
                        <?php endif; ?>

                        <?php if (!hay_sesion()): ?>
                            <a class="boton chico secundario" href="prestacion.php?id=<?= $p->id ?>">Ver</a>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
