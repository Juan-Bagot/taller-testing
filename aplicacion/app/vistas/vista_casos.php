<?php
// El catálogo de casos de prueba, embebido en el sitio (estilo
// automationexercise.com/test_cases). Espera:
//   $titulo    el título de la página
//   $grupos    los grupos a mostrar (del casos.json)
//   $activa    'web' | 'api'  (para las solapas)
require __DIR__ . '/fragmentos/cabecera.php';

// Mini-conversor del markdown de cada caso a HTML: escapar primero, formatear después.
function caso_html(string $md): string
{
    $html = e($md);
    $html = preg_replace('/`([^`]+)`/', '<code>$1</code>', $html);
    $html = preg_replace('/\*\*([^*]+)\*\*/', '<b>$1</b>', $html);
    $html = preg_replace('/\*([^*\n]+)\*/', '<em>$1</em>', $html);
    return nl2br($html);
}
?>

<h1><?= e($titulo) ?></h1>

<p class="solapas">
    <a href="casos.php" class="boton chico <?= $activa === 'web' ? '' : 'secundario' ?>">Web y visuales</a>
    <a href="casos-api.php" class="boton chico <?= $activa === 'api' ? '' : 'secundario' ?>">API</a>
</p>

<p>Estos son los casos de prueba a automatizar en el obligatorio. Cada uno indica sus
   precondiciones, los pasos y el resultado esperado. La regla de oro: los casos deben
   poder correrse <b>en cualquier orden y repetidas veces</b> — los marcados con ⚠
   modifican los datos semilla (resetear la base después).</p>

<?php foreach ($grupos as $grupo): ?>
    <?php foreach ($grupo['secciones'] as $seccion): ?>
        <?php if ($seccion['seccion'] !== ''): ?>
            <h2 class="seccion-casos"><?= e($seccion['seccion']) ?></h2>
        <?php endif; ?>

        <?php foreach ($seccion['casos'] as $caso): ?>
            <details class="tarjeta caso">
                <summary>
                    <span class="etiqueta"><?= e($caso['id']) ?></span>
                    <?= $caso['alerta'] ? '⚠ ' : '' ?><?= e($caso['titulo']) ?>
                </summary>
                <div class="caso-cuerpo"><?= caso_html($caso['cuerpo']) ?></div>
            </details>
        <?php endforeach; ?>
    <?php endforeach; ?>
<?php endforeach; ?>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
