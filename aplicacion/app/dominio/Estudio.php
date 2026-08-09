<?php
declare(strict_types=1);

class Estudio extends Prestacion
{
    public function __construct(
        ?int $id,
        string $nombre,
        float $precio,
        Franja $franja,
        public readonly int $duracionMinutos,
    ) {
        parent::__construct($id, $nombre, $precio, $franja);
    }

    public function tipo(): string
    {
        return 'ESTUDIO';
    }

    public function etiquetaTipo(): string
    {
        return 'Estudio';
    }
}
