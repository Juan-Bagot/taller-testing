<?php
declare(strict_types=1);

class Terapia extends Prestacion
{
    public function __construct(
        ?int $id,
        string $nombre,
        float $precio,
        Franja $franja,
        public readonly bool $requiereDerivacion,
        public readonly int $cantidadSesiones,
    ) {
        parent::__construct($id, $nombre, $precio, $franja);
    }

    public function tipo(): string
    {
        return 'TERAPIA';
    }

    public function etiquetaTipo(): string
    {
        return 'Terapia';
    }
}
