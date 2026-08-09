<?php
// La raíz de la jerarquía del catálogo. Igual que Usuario: abstracta,
// cada fila real es un Estudio o una Terapia.

declare(strict_types=1);

abstract class Prestacion
{
    public function __construct(
        public readonly ?int $id,       // null hasta que la base le asigne uno
        public readonly string $nombre,
        public readonly float $precio,
        public readonly Franja $franja,
    ) {
    }

    /** Lo que va a la columna `tipo` de la base. */
    abstract public function tipo(): string;

    /** Cómo se muestra el tipo en pantalla. */
    abstract public function etiquetaTipo(): string;
}
