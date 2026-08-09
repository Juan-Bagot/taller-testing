<?php
// Convierte los campos del formulario de prestación en un objeto del dominio.
// Lo comparten el alta y la edición: es la única traducción $_POST -> objeto.

declare(strict_types=1);

function prestacion_desde_formulario(array $post, ?int $id = null): Prestacion
{
    $nombre = trim($post['nombre'] ?? '');
    $precio = (float) ($post['precio'] ?? 0);
    $franja = Franja::tryFrom($post['franja'] ?? '') ?? Franja::MANANA;

    if (($post['tipo'] ?? '') === 'ESTUDIO') {
        return new Estudio($id, $nombre, $precio, $franja,
            (int) ($post['duracion_minutos'] ?? 0));
    }

    return new Terapia($id, $nombre, $precio, $franja,
        isset($post['requiere_derivacion']),
        (int) ($post['cantidad_sesiones'] ?? 0));
}
